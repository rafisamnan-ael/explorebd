import type { TransportMode } from '@/types';
import type { RouteLeg } from '@/lib/routing/types';
import { foodPerDay, hotelRateForDistrict, styleForHotelTier } from '@/data/travel-cost';

export type HotelTier = 'budget' | 'mid' | 'premium';
export type Pace = 'relaxed' | 'balanced' | 'packed';

export interface BudgetInput {
  legs: RouteLeg[];
  days: number;
  travelerCount: number;
  hotelTier: HotelTier;
  pace: Pace;
  transportPreferences: TransportMode[];
  destinationDistrictId?: string;
}

export interface BudgetCategory {
  key: 'transportCost' | 'accommodation' | 'food' | 'entryFees' | 'localTransport' | 'contingency';
  amount: number;
}

export interface BudgetResult {
  categories: BudgetCategory[];
  subtotal: number;
  total: number;
  perPerson: number;
  assumptions: string[];
}

export const budgetRates = {
  transportPerKmPerson: { bus: 2.4, train: 2.0, car: 13, flight: 11, any: 2.4 } as Record<string, number>,
  flightBaseBdt: 3200,
  hotelPerRoomNight: { budget: 1300, mid: 2600, premium: 5800 } as Record<HotelTier, number>,
  foodPerPersonDay: { budget: 450, mid: 750, premium: 1300 } as Record<HotelTier, number>,
  activityPerPersonDay: 180,
  localTransportPerPersonDay: 280,
  contingencyRate: 0.08,
};

const paceFactor: Record<Pace, number> = { relaxed: 0.85, balanced: 1, packed: 1.15 };

function primaryTransport(prefs: TransportMode[]): TransportMode {
  if (!prefs.length || prefs.includes('any')) return 'bus';
  return prefs[0]!;
}

export function computeBudget(input: BudgetInput): BudgetResult {
  const { legs, days, travelerCount, hotelTier, pace, transportPreferences, destinationDistrictId } = input;
  const travelers = Math.max(1, travelerCount);
  const nights = Math.max(0, days - 1);
  const mode = primaryTransport(transportPreferences);

  const totalKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0);
  const perKm = budgetRates.transportPerKmPerson[mode] ?? budgetRates.transportPerKmPerson.bus!;
  let transport = totalKm * perKm * travelers;
  if (mode === 'flight' && legs.length > 0) {
    transport += budgetRates.flightBaseBdt * travelers * Math.min(legs.length, 2);
  }
  if (mode === 'car') {
    // Car is per-vehicle; adjust for extra travelers.
    transport = totalKm * budgetRates.transportPerKmPerson.car! + Math.max(0, travelers - 3) * totalKm * 1.5;
  }

  const hotel = destinationDistrictId ? hotelRateForDistrict(destinationDistrictId, hotelTier) : null;
  const nightlyRate = hotel?.rate ?? budgetRates.hotelPerRoomNight[hotelTier];
  const rooms = Math.ceil(travelers / 2);
  const accommodation = nights * rooms * nightlyRate;
  const dailyFood = foodPerDay(styleForHotelTier(hotelTier));
  const food = days * travelers * dailyFood * paceFactor[pace];
  const entryFees = days * travelers * budgetRates.activityPerPersonDay * paceFactor[pace];
  const localTransport = days * travelers * budgetRates.localTransportPerPersonDay;

  const subtotal = transport + accommodation + food + entryFees + localTransport;
  const contingency = subtotal * budgetRates.contingencyRate;
  const total = subtotal + contingency;

  return {
    categories: [
      { key: 'transportCost', amount: Math.round(transport) },
      { key: 'accommodation', amount: Math.round(accommodation) },
      { key: 'food', amount: Math.round(food) },
      { key: 'entryFees', amount: Math.round(entryFees) },
      { key: 'localTransport', amount: Math.round(localTransport) },
      { key: 'contingency', amount: Math.round(contingency) },
    ],
    subtotal: Math.round(subtotal),
    total: Math.round(total),
    perPerson: Math.round(total / travelers),
    assumptions: [
      `Transport: ৳${perKm}/km/person (${mode})`,
      `Hotel: ৳${nightlyRate}/room/night × ${rooms} room(s) × ${nights} night(s)${hotel ? ` · ${hotel.source}` : ''}`,
      `Food: ৳${dailyFood}/person/day`,
      `Activities: ৳${budgetRates.activityPerPersonDay}/person/day`,
      `Contingency: ${Math.round(budgetRates.contingencyRate * 100)}%`,
    ],
  };
}
