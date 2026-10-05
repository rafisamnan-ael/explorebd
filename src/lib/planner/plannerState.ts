export type TravelStyle = 'save' | 'balanced' | 'comfort';
export type RouteMode = 'optimized' | 'manual';
export type HotelTier = 'budget' | 'mid' | 'comfort';

export interface PlannerState {
  originDistrictId: string | null;
  destinationDistrictIds: string[];
  selectedPlaceIdsByDistrict: Record<string, string[]>;
  routeMode: RouteMode;
  preferredFirstDestinationId: string | null;
  manualRouteOrder: string[];
  days: number;
  totalBudget: number | null;
  travellers: number;
  travelStyle: TravelStyle;
  returnToOrigin: boolean;
  useOvernightTravel: boolean;
  selectedTransportBySegment: Record<string, string>;
}

export const PLANNER_STORAGE_KEY = 'explorebd:planner:v1';

export function defaultPlannerState(): PlannerState {
  return {
    originDistrictId: 'bd-dhaka',
    destinationDistrictIds: [],
    selectedPlaceIdsByDistrict: {},
    routeMode: 'optimized',
    preferredFirstDestinationId: null,
    manualRouteOrder: [],
    days: 3,
    totalBudget: null,
    travellers: 2,
    travelStyle: 'balanced',
    returnToOrigin: true,
    useOvernightTravel: false,
    selectedTransportBySegment: {},
  };
}

export function loadPlannerState(): PlannerState | null {
  try {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    return { ...defaultPlannerState(), ...parsed };
  } catch {
    return null;
  }
}

export function savePlannerState(state: PlannerState): void {
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function clearPlannerState(): void {
  try {
    localStorage.removeItem(PLANNER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
