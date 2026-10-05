# EXPLOREBD — OPENCODE MASTER PROMPT
## Cinematic Landing Page + Bangladesh Travel Planner + Cost Intelligence Engine

You are working inside the EXISTING ExploreBD repository.

Live product:
- https://explorebd-three.vercel.app/
- Main map route: https://explorebd-three.vercel.app/map

Primary inspiration:
- https://unseenbangladesh.com/

IMPORTANT LEGAL / DESIGN RULE:
Do NOT copy, scrape, paste, or redistribute proprietary source code, JavaScript bundles, CSS, images, video files, SVG artwork, or other copyrighted assets from the inspiration website.

Instead, reproduce the PUBLICLY OBSERVABLE experience in a clean-room implementation using ExploreBD's own code, assets, components, data and visual identity.

The inspiration site currently uses a highly immersive one-page experience:
- cinematic full-width travel imagery/background media
- a compact “64 districts · 8 divisions” type context pill
- a large centered Bengali travel question
- a short explanation
- a rounded light CTA
- a district-map interaction embedded directly into the homepage
- a world-map section
- travel guide discovery
- trip planner
- quiz
- map puzzle
- leaderboard
- smooth transitions between these experiences

ExploreBD must take that emotional, dynamic, single-page storytelling model and improve it substantially.

The target feeling:

> National Geographic editorial storytelling + Airbnb polish + Apple Maps clarity + AllTrails utility.

The result must feel expensive, alive and memorable, but remain fast on mid-range Android phones and normal Bangladeshi mobile connections.

---

# PART A — PRODUCT GOAL

ExploreBD should no longer feel primarily like a collection of pages.

It should feel like a living travel product.

Brand:

**ExploreBD**

Tagline:

**Track. Discover. Plan. Go.**

Strategic positioning:

> **The personal travel operating system for Bangladesh.**

Core product loop:

Discover
→ Track
→ Plan
→ Travel
→ Mark visited
→ Collect passport progress
→ Share
→ Discover again

Primary landing-page purpose:

1. Emotionally attract users.
2. Let them interact almost immediately.
3. Give them a shareable result.
4. Show that ExploreBD is much more useful than a simple district map.
5. Move users naturally into trip planning, discovery and Travel Passport.

---

# PART B — FIRST INSPECT THE EXISTING REPOSITORY

Before editing:

1. Inspect package.json.
2. Identify framework and router.
3. Identify map implementation.
4. Identify existing map geometry files.
5. Identify current localStorage/session storage state.
6. Identify district/place data.
7. Identify all public pages.
8. Identify current planner code.
9. Identify export/share-card code.
10. Identify Tailwind/global styles.
11. Identify installed component libraries.
12. Identify API clients.
13. Run:
   - install
   - TypeScript check
   - lint
   - tests
   - production build
14. Preserve working logic.
15. Refactor incrementally.

Do not rebuild functioning map selection logic without a strong technical reason.

Never wipe existing user progress.

If storage schema changes, write migration code.

---

# PART C — LANDING PAGE: CINEMATIC DESIGN

The new homepage should feel dynamic immediately.

## C1. HERO: FULL-VIEWPORT CINEMATIC OPENING

Create a hero approximately:

- min-height: 92svh desktop
- min-height: 88svh mobile

Use either:

1. an optimized muted looping travel video owned/licensed by ExploreBD, OR
2. a cinematic image-sequence/slideshow using licensed Bangladesh photography.

Do NOT hotlink or copy the competitor's media.

Recommended Bangladesh scenes:
- Ratargul
- Sreemangal tea gardens
- Cox's Bazar
- Sajek or hill landscape
- Sundarbans waterways
- haor
- Old Dhaka / heritage architecture
- river and boat scenes

If video is used:
- autoplay
- muted
- loop
- playsInline
- no controls
- poster image
- aggressively optimized
- lazy-load secondary media
- provide image fallback

Hero media treatment:

Layer 1:
background video/image

Layer 2:
soft vignette

Layer 3:
vertical gradient:
rgba(8,25,18,.20) top
rgba(8,25,18,.42) middle
rgba(8,25,18,.74) bottom

Layer 4:
optional very subtle film grain/noise texture at low opacity

Never make text difficult to read.

---

## C2. HERO CONTENT

Place hero content near center, slightly below optical center.

Top context pill:

**64 DISTRICTS · 8 DIVISIONS**

or in Bangla:

**৬৪ জেলা · ৮ বিভাগ**

Then very large heading.

Recommended Bangla-first headline:

**বাংলাদেশের কতটুকু আপনি দেখেছেন?**

English version:

**How much of Bangladesh have you explored?**

Supporting copy:

**Mark the places you've visited, discover where to go next, and turn your travels into a map worth sharing.**

Primary CTA:

**Start My Travel Map**

Bangla:

**আমার ভ্রমণ ম্যাপ বানাই**

Secondary action:

**Explore Bangladesh**

CTA style:
- warm ivory/white
- dark forest text
- pill or 14–18px radius
- medium weight
- arrow icon
- hover arrow moves 4–6px
- subtle scale 1.01 only
- no glowing effect

At bottom:
animated but subtle scroll cue.

---

# PART D — HERO MOTION

Use Framer Motion or lightweight CSS.

On initial load:

Context pill:
opacity 0 → 1
y 12 → 0
duration ~0.45s

Heading:
opacity 0 → 1
y 24 → 0
duration ~0.7s
delay ~0.1

Body:
opacity 0 → 1
y 20 → 0
delay ~0.18

CTA:
opacity 0 → 1
scale .98 → 1
delay ~0.26

Hero media:
slow scale 1.00 → 1.055 over 14–20 seconds

Do not loop dramatic text animations.

On scroll:
hero text can move upward roughly 20–40px and fade slightly.

Respect:
`prefers-reduced-motion`.

---

# PART E — TRANSPARENT NAVIGATION

At top of hero:

Desktop:

ExploreBD logo

Navigation:
- Explore
- Map
- Places
- Plan Trip
- Passport

Right:
- Search
- বাংলা / EN
- Profile

Initial state:
transparent.

After ~48px scroll:
- warm ivory or deep forest surface
- 88–96% opacity
- subtle backdrop blur
- soft border
- slightly reduced height

Do not show 10+ navbar links.

Mobile:
- logo
- search
- menu/profile

Use bottom navigation after entering app routes:
Explore / Map / Plan / Passport / Profile.

---

# PART F — SCROLL STORY ARCHITECTURE

Do not follow the generic pattern:
hero → cards → cards → cards.

Use a flowing editorial story.

Recommended homepage order:

1. Cinematic hero
2. Interactive Bangladesh progress section
3. “Where next?” discovery scene
4. Immersive destination rail
5. Planner demo scene
6. Travel Passport
7. Social travel-card generator preview
8. Hidden Gems / seasonal recommendations
9. Travel Roulette
10. Community/data freshness
11. Final cinematic CTA

Alternate light and dark zones.

Example:

Hero:
dark cinematic

Map scene:
warm ivory

Destination discovery:
deep forest

Planner:
paper/ivory

Passport:
dark charcoal/forest

Social cards:
warm neutral

Final CTA:
cinematic photo

This gives rhythm.

---

# PART G — HOMEPAGE INTERACTIVE MAP SCENE

Directly after hero, show a real mini version of the user map.

Heading:

**Your Bangladesh, one district at a time.**

Copy:

**Tap the districts you've visited. Your progress is saved automatically.**

Layout desktop:
left copy/progress
right large Bangladesh map

Mobile:
copy
large map
sticky bottom action

Show:
- selected district count
- percentage
- Visited
- Wishlist

Do not expose every advanced map option in this preview.

After user chooses 3+ districts:
animate the count upward.

CTA:

**Open Full Map**

Secondary:
**Create Travel Card**

---

# PART H — STICKY EDITORIAL FEATURE SCENES

Create 1–2 sticky storytelling sections.

Example Planner scene:

Left side stays sticky:
“Tell us where you're starting, how long you have and what you want to spend.”

Right side scrolls through:
- choose destination
- choose transport
- cost estimate
- itinerary
- map route

As user scrolls, active step changes.

Use IntersectionObserver or Motion scroll progress.

Do NOT make the entire homepage dependent on scroll-jacking.

Normal browser scrolling must remain intact.

---

# PART I — IMMERSIVE DESTINATION CARDS

Use photography-first cards.

Each large card:
- 4:3 or 3:2 image
- destination
- district
- one useful line
- season chip
- approximate budget from if trustworthy
- save button

Hover desktop:
image scale 1 → 1.035
card rises ~2px

Mobile:
horizontal snap carousel where appropriate.

Sections:

**Best this month**

**Weekend escapes from Dhaka**

**Under ৳5,000**

**Nature & hills**

**Heritage Bangladesh**

**Hidden gems**

---

# PART J — TRAVEL PASSPORT PREVIEW

Create an emotional passport scene, not a dashboard.

Example:

EXPLOREBD PASSPORT

Farhan Ahmed
Explorer Level 14

27 / 64 districts
82 places
8 divisions

Large mini map.
Passport stamp collection.
Badge collection.

Use subtle paper texture, embossed-style borders and stamp visuals.

No fake government-document styling.

CTA:
**Open My Passport**

---

# PART K — SOCIAL SHARE CARD SECTION

This is a major growth engine.

Show 3 overlapping example cards:
- 1080×1350 portrait
- 1080×1080 square
- 1080×1920 story

Each card should have:
- user's name
- map
- 27 / 64
- divisions
- place count
- Explorer level
- ExploreBD mark

Themes:
- Heritage
- River
- Bengal
- Midnight
- Minimal

CTA:
**Create My Travel Card**

Never export a screenshot of the web UI.

Render dedicated share assets.

---

# PART L — LANDING PAGE MICROINTERACTIONS

Use:
- CTA arrow shift
- map polygon hover
- progress number transition
- save-heart scale feedback
- scroll reveal
- image parallax 2–5%
- card hover lift
- passport stamp animation
- subtle route-line drawing

Avoid:
- particles everywhere
- giant gradient blobs
- bouncing icons
- continuous rotating elements
- cursor gimmicks
- scroll hijacking
- excessive glassmorphism

---

# PART M — MAIN DESIGN SYSTEM

Use the existing ExploreBD palette if already implemented well; otherwise move toward:

Deep Forest: #12372A
Emerald: #176B4D
Heritage Green: #278661
Warm Ivory: #F8F5ED
Paper: #EEE8DA
Charcoal: #17211D
Muted: #65716B
Brass: #C69B4B
River Blue: #397C91
Terracotta: #C66245
Bangladesh Red: #F42A41

Red is accent only.

Typography:
- Geist / Inter for English UI
- Noto Sans Bengali or Hind Siliguri for Bangla
- optional DM Serif Display for large English editorial titles only

Use shadcn/ui as a component foundation if compatible, but heavily customize it.

---

# PART N — CRITICAL PLANNER PROBLEM TO FIX

The planner must NOT show empty generic screens or vague “estimated cost” placeholders.

It must produce a useful, explainable Bangladesh travel plan from one place to another.

The planner must answer:

1. How do I get there?
2. What modes are realistically available?
3. How long will it take?
4. How much will travel cost?
5. What will accommodation likely cost?
6. What should I budget for food?
7. What might local transport cost?
8. How much per person?
9. How much for the whole group?
10. How uncertain is the estimate?
11. What data is official versus estimated?
12. Can an overnight bus/train save one hotel night?
13. Is the trip realistic for the number of days?

---

# PART O — DATA CONFIDENCE MODEL

Every price must carry a source type.

Use:

```ts
type PriceConfidence =
  | "official_exact"
  | "official_formula"
  | "market_observed"
  | "city_baseline"
  | "fallback_estimate";
```

UI labels:

official_exact:
**Published fare**

official_formula:
**Official-rate estimate**

market_observed:
**Typical current range**

city_baseline:
**Typical room rate**

fallback_estimate:
**Planning estimate**

Never display an inferred number as an exact official fare.

---

# PART P — ROAD DISTANCE

Preferred order:

1. Real road route distance from configured routing API.
2. Stored known route distance.
3. Haversine distance × road factor fallback.

Recommended provider abstraction:

```ts
interface RoutingProvider {
  getRoadRoute(
    origin: Coordinate,
    destination: Coordinate
  ): Promise<{
    distanceKm: number;
    durationMinutes: number;
    geometry?: GeoJSON.LineString;
  }>;
}
```

Possible providers:
- openrouteservice / HeiGIT endpoint
- GraphHopper
- self-hosted OSRM
- another configured provider

Do not depend on a public demo server for production reliability.

Fallback road factor:

flat/highway:
1.18

mixed:
1.24

hill:
1.34

river/ferry-sensitive:
1.38

Mark fallback distance as approximate.

---

# PART Q — CURRENT BANGLADESH BUS COST MODEL

DATA DATE:
October 2026.

## Q1. Ordinary/non-AC inter-district buses

As of 22 September 2026, the government rate for diesel-powered inter-district and long-distance buses/minibuses is:

**৳2.40 per passenger-kilometre**

Dhaka/Chattogram metro ordinary bus:
**৳2.70/km**

Relevant DTCA-area rate:
**৳2.60/km**

For ExploreBD trip planning, use the inter-district rate for ordinary long-distance bus estimation.

Formula:

```ts
baseNonAcFare = roadDistanceKm * 2.40
```

Then apply route-specific:
- bridge/road toll allocation
- terminal/route adjustment if documented
- official route override if known

Round planning estimate sensibly:
nearest ৳10.

Do not claim the distance formula always equals the ticket price exactly because route fare charts, tolls and bus seating configurations can affect the final fare.

Recommended output:

**Non-AC bus**
৳950–৳1,100
Official-rate estimate

not:

৳987.43

---

# PART R — AC BUS MODEL

CRITICAL:
There is currently no government-fixed fare chart for AC inter-district buses.

Therefore DO NOT label an AC fare “official”.

Use operator/market observations when available.

When no route observation exists, estimate from the ordinary-bus baseline.

Recommended classes:

```ts
const AC_BUS_MULTIPLIERS = {
  economyAc: [1.55, 1.90],
  premiumAc: [1.90, 2.40],
  sleeperOrBusiness: [2.40, 3.10],
};
```

Use conservative ranges.

Example:

If non-AC baseline is ৳1,000:

AC economy:
~৳1,550–1,900

Premium:
~৳1,900–2,400

Sleeper:
~৳2,400–3,100

Where real route observations exist, they override the multiplier.

Example market observation:
Dhaka ↔ Cox's Bazar has recently shown roughly:
- non-AC around ৳1,100
- standard AC around ৳2,000–2,200
- higher premium/sleeper up to roughly ৳3,000

These are not government-fixed.

---

# PART S — BUS ROUTE OVERRIDE DATA MODEL

Create:

```ts
type BusFareOverride = {
  originId: string;
  destinationId: string;
  distanceKm?: number;
  nonAc?: {
    min: number;
    max: number;
    sourceType: PriceConfidence;
  };
  ac?: {
    min: number;
    max: number;
    sourceType: PriceConfidence;
  };
  premium?: {
    min: number;
    max: number;
    sourceType: PriceConfidence;
  };
  checkedAt: string;
  sourceUrl?: string;
};
```

Route override > formula.

Admin should eventually be able to update fares without code deployment.

---

# PART T — TRAIN FARE MODEL

Do NOT estimate Bangladesh Railway fare purely by road distance.

Train fares depend on:
- actual rail route
- commercial distance
- class
- route-specific charges
- bridge/pontage charges
- train/service availability

Preferred order:

1. Exact route/class fare table.
2. Station-pair published fare.
3. Rail-distance fallback estimate.

Create train-station and train-route data.

Example current baseline routes, useful for initial data:

## Dhaka ↔ Chattogram

Typical published intercity fares:
- Shovan Chair: ৳450
- First Seat: ৳685
- Snigdha AC: ৳855
- AC Seat: ৳1,025

## Dhaka ↔ Rajshahi

Typical published intercity:
- Shovan Chair: ৳405
- Snigdha AC: ৳771
- AC Seat: ৳926
- AC Berth on services where available: around ৳1,386

## Dhaka ↔ Cox's Bazar

Current published route examples:
- Shovan Chair: ৳695
- Snigdha AC: ৳1,325
- AC Seat: ৳1,590
- AC Berth where available: ৳2,380

Do not show classes that the selected train does not actually offer.

---

# PART U — TRAIN CLASS MULTIPLIERS FOR FALLBACK ONLY

When only a base Shovan Chair estimate exists:

```ts
const TRAIN_CLASS_MULTIPLIER = {
  shovanChair: 1.0,
  firstSeat: 1.52,
  snigdha: 1.90,
  acSeat: 2.28,
  acBerth: 3.42,
};
```

These ratios closely match several current published intercity examples.

Fallback base Shovan Chair should be a range, not false precision.

Use a calibrated approximate rate:

```ts
baseChairLow = railDistanceKm * 1.20;
baseChairHigh = railDistanceKm * 1.65;
```

For special/new routes or known pontage-heavy routes, widen the range.

Never use the fallback when an actual published route fare exists.

---

# PART V — FLIGHT COST MODEL

Domestic airfares are dynamic and are NOT a simple government per-kilometre tariff.

Use:

1. Current airline/route fare feed if available.
2. Stored route floor/range.
3. Distance-based fallback only as a rough planning estimate.

Current examples in 2026 show domestic one-way entry fares roughly around:
- Dhaka ↔ Chattogram: about ৳4,700 starting level
- Dhaka ↔ Sylhet: about ৳4,700 starting level
- Dhaka ↔ Saidpur: about ৳4,800 starting level
- Dhaka ↔ Cox's Bazar: about ৳5,200 starting level

Market ranges can be much higher on weekends, winter travel, Eid and late booking.

Use labels such as:

**Flights from ~৳5,200**
or
**Typical ৳5,200–৳9,000**

Never label this as fixed.

---

# PART W — FLIGHT FALLBACK

If:
- a real scheduled domestic air route exists
- but no current stored fare exists

Use a conservative planning formula:

```ts
const floor = 4700;
const distanceComponent = Math.max(0, airDistanceKm - 150) * 3;
const estimatedLow = floor + distanceComponent;
const estimatedHigh = estimatedLow * 1.45;
```

Then round to nearest ৳100.

This formula is only a planning fallback.

Display:

**Estimated flight range**

Never:
**Official airfare**

Holiday multiplier may increase the high estimate.

---

# PART X — TRANSPORT AVAILABILITY

Do not show every mode for every destination.

Create:

```ts
type TransportAvailability = {
  bus: boolean;
  train: boolean;
  flight: boolean;
  launch: boolean;
};
```

Train:
only if a practical passenger rail connection exists.

Flight:
only if a scheduled useful airport pair exists.

Launch:
only for relevant routes.

If the destination does not have an airport:
allow flight + ground transfer only if sensible.

Example:
flight to Saidpur + road transfer to nearby northern destination.

Explain the transfer.

---

# PART Y — ACCOMMODATION ENGINE

Hotel cost should vary by city.

Do NOT use one national nightly rate.

Use:
1. city-specific observed baseline
2. tourism-city baseline
3. generic city tier fallback

Initial October 2026 planning baselines from recent observed booking-market snapshots:

## Dhaka

Budget:
~৳3,650 / room / night

Mid-range:
~৳5,050

Comfortable:
~৳9,300

## Cox's Bazar

Budget:
~৳3,150

Mid-range:
~৳4,150

Comfortable:
~৳5,850

Strong seasonal variation.

## Sylhet

Budget:
~৳2,200

Mid-range:
~৳3,050

Comfortable:
~৳4,650

## Khulna

Budget:
~৳1,250

Mid-range:
~৳2,950

Comfortable:
~৳3,550

## Chattogram

Until sufficient local live data exists, use a provisional major-city baseline around:

Budget:
~৳3,000

Mid-range:
~৳4,200

Comfortable:
~৳6,200

Clearly label provisional/fallback values.

---

# PART Z — GENERIC HOTEL CITY TIERS

When no city-specific data exists:

```ts
const HOTEL_TIER = {
  A: {
    budget: 3200,
    mid: 5000,
    comfort: 8000,
  },
  B: {
    budget: 2200,
    mid: 3500,
    comfort: 5500,
  },
  C: {
    budget: 1500,
    mid: 2500,
    comfort: 4000,
  },
};
```

Tier A:
Dhaka / major high-demand tourist/business centres.

Tier B:
major divisional cities and established tourism towns.

Tier C:
ordinary district towns where supply is cheaper.

Use specific city data whenever available.

---

# PART AA — HOTEL SEASON MULTIPLIERS

Do not make all locations seasonal in the same way.

Default:

regular weekday:
1.00

weekend:
1.05–1.12

national long weekend:
1.12–1.30

Eid/high demand:
1.25–1.60

Winter tourism destinations:
1.15–1.45

Cox's Bazar in peak winter/holiday:
allow stronger seasonal adjustment.

Monsoon tourist low season:
0.85–1.00 where market evidence supports it.

Never guarantee the adjusted rate.

Show a range.

---

# PART AB — ROOM SHARING

Input:
- travellers
- preferred occupancy

Calculate:

```ts
rooms = Math.ceil(travellers / occupancyPerRoom)
```

Trip styles:

Solo:
1 per room

Couple:
2 per room

Friends:
2–4 per room

Family:
selectable

Let users manually change room count.

---

# PART AC — OVERNIGHT TRAVEL SAVING

If:
- departure occurs at night
- arrival is early morning
- user actually sleeps during transit

allow planner to suggest:

**Night coach/train may save one hotel night.**

Do not automatically subtract the night without explaining it.

Show toggle:

[x] Use overnight travel to save one hotel night

---

# PART AD — FOOD BUDGET

Food must be part of planning.

Per person/day baseline:

Save:
৳600

Balanced:
৳1,000

Comfort:
৳1,800

Premium:
৳3,000+

These are planning assumptions, not menu prices.

Allow editing.

If hotel breakfast is included:
subtract one meal where appropriate.

---

# PART AE — LOCAL TRANSPORT

Generic per-person/day planning baseline:

Save:
৳300–500

Balanced:
৳600–1,000

Comfort:
৳1,200–2,000

But override for:
- Bandarban
- Rangamati
- Sajek
- islands
- boats
- reserved jeeps
- remote attractions

Remote/hill transport should be group-based when vehicles are hired.

Example data structure:

```ts
type LocalTransportRule = {
  locationId: string;
  basis: "per_person" | "per_group";
  budget: [number, number];
  balanced: [number, number];
  comfort: [number, number];
  notes?: string;
};
```

---

# PART AF — ENTRY FEES

Do not assume missing entry fees are free.

Use:

```ts
entryFee?: number
entryFeeStatus:
  | "verified"
  | "estimated"
  | "unknown"
```

If unknown:
exclude from numeric total and show:

**Some entry fees not included**

This is better than fake precision.

---

# PART AG — TOTAL COST ENGINE

Total trip cost should include:

Transport to destination
+
Return transport if selected
+
Accommodation
+
Food
+
Local transport
+
Known entry fees
+
Optional user-added costs

Pseudo:

```ts
transport =
  outboundFare * people +
  (returnTrip ? returnFare * people : 0);

stay =
  rooms * payableNights * nightlyRoomRate;

food =
  people * tripDays * dailyFoodRate;

local =
  localTransportBasis === "per_group"
    ? tripDays * groupLocalRate
    : people * tripDays * personLocalRate;

entry =
  sumKnownEntryFees * people;

total =
  transport + stay + food + local + entry + extras;
```

Also calculate:

- total for group
- per person
- low estimate
- expected estimate
- high estimate

---

# PART AH — UNCERTAINTY

Every plan should display a range.

Example:

**Estimated total**
৳24,500–৳30,800

**About ৳6,100–৳7,700 per person**

Reason:
- hotel rates change
- AC coach fares are market-set
- flights are dynamic
- food varies
- local rides vary

Do not overpromise.

---

# PART AI — TRAVEL STYLES

Add three main presets:

## SAVE

- non-AC bus or Shovan Chair train where practical
- budget room
- local food
- simple local transport

## BALANCED

- AC bus / Snigdha train where practical
- mid-range room
- mixed restaurants
- moderate convenience

## COMFORT

- premium AC / flight when time-saving makes sense
- comfortable room
- ride-hailing/reserved transport where practical
- higher food budget

Allow manual mode override.

---

# PART AJ — PLANNER INPUT UX

The planning page should NOT start with a giant empty form.

Use a polished guided flow.

Hero:

**Plan a Bangladesh trip that fits your time and budget.**

Fields:

From:
search city/district

To:
search place/district

When:
date or flexible

Days:
stepper

People:
stepper

Budget:
optional

Style:
Save / Balanced / Comfort

Preference:
Fastest / Cheapest / Balanced

CTA:

**Build My Trip**

---

# PART AK — RESULTS PAGE

Immediately show:

## Top summary

Dhaka → Cox's Bazar

3 days
4 travellers
Balanced

Estimated total:
৳XX,XXX–XX,XXX

Per person:
৳X,XXX–X,XXX

---

# PART AL — TRANSPORT COMPARISON

Render real cards.

Example:

### Non-AC Coach
10h
৳1,050–1,150
Best for lowest cost
Official-rate estimate

### AC Coach
10h
৳1,800–2,300
Comfortable overnight
Typical market range

### Train
8h 25m
Shovan Chair ৳695
Snigdha ৳1,325
Published fares

### Flight
1h 05m
from ~৳5,200
Fastest
Dynamic fare

User selects a mode.

Planner recalculates instantly.

---

# PART AM — “WHY THIS PRICE?” DRAWER

Every fare card should have:

**Why this estimate?**

Example bus:

Road distance:
405 km

Official ordinary inter-district rate:
৳2.40/km

Base:
~৳972

Toll/route allowance:
included in displayed range

Updated:
Oct 2026

AC:
market-priced, not government-fixed

This creates trust.

---

# PART AN — ROUTE-SPECIFIC OVERRIDES

Create a central data directory:

```
src/data/travel-cost/
  bus-rates.ts
  train-fares.ts
  flight-fares.ts
  hotel-baselines.ts
  local-transport.ts
  city-tiers.ts
  route-overrides.ts
  sources.ts
```

Never bury prices inside components.

---

# PART AO — COST CONFIG VERSIONING

Every data set should contain:

```ts
{
  validFrom: "2026-09-22",
  checkedAt: "2026-10-05",
  sourceType: "...",
  sourceUrl: "...",
}
```

Make updates easy.

Eventually the admin panel should update stored values.

---

# PART AP — SAMPLE COST CONFIG

Use the included `explorebd-travel-cost-baseline.ts` as an initial structure.

Do NOT treat all included estimates as live booking quotes.

---

# PART AQ — ROUTE PLANNING LOGIC

For one destination:

1. obtain origin coordinates
2. obtain destination coordinates
3. calculate road route
4. check train availability
5. check flight availability
6. check launch availability if relevant
7. calculate costs by mode
8. estimate journey time
9. select recommended option based on user preference

Preference:

Cheapest:
lowest expected cost

Fastest:
lowest total travel time including transfer time

Balanced:
score based on cost + time + comfort

Example:

```ts
balancedScore =
  normalizedCost * 0.45 +
  normalizedTime * 0.35 +
  discomfortPenalty * 0.20;
```

Lower score wins.

---

# PART AR — MULTI-CITY ROUTE PLANNING

For multiple destinations:

Do not merely use straight-line nearest neighbour and call it optimal.

Use:

1. road distance matrix
2. chosen transport mode constraints
3. attraction opening hours
4. available days
5. required overnight stops
6. practical maximum travel hours/day

Initial route optimization:
nearest-neighbour seed + 2-opt improvement.

For small destination sets:
evaluate multiple permutations if computationally reasonable.

Do not schedule:
- 10 hours of travel
- followed by 8 hours of sightseeing

Use humane limits.

---

# PART AS — DAY PLANNING

Default assumptions:

Breakfast:
07:30–08:30

Sightseeing start:
08:30–09:00

Lunch:
12:30–14:00

Sightseeing end:
18:00 unless place/night activity supports later

Maximum standard active day:
~10 hours

Add:
- travel buffers
- meal buffers
- check-in time
- prayer/rest flexibility where relevant

Do not create unrealistic minute-perfect schedules.

Show:
**Approximate timing**

---

# PART AT — FEASIBILITY ENGINE

If itinerary is too crowded:

Do not silently squeeze everything.

Display:

**This trip is too tight for 2 days.**

Then:

Recommended:
3 days

Why:
- ~9h outbound travel
- 7 selected attractions
- local travel ~4h
- return journey

Buttons:
**Use 3 Days**
**Keep 2 Days and Remove Stops**

---

# PART AU — ACCOMMODATION PLACEMENT

For multi-day trips:
choose a central stay area based on:
- selected places
- arrival point
- next-day route

Do not claim a specific hotel unless data exists.

Can suggest:
**Best area to stay**
Kolatoli / central Sylhet / etc.

If actual hotel inventory is not connected:
show price tier, not fake availability.

---

# PART AV — PLANNER UI: DAILY TIMELINE

Use:

DAY 1
Friday

07:00
Depart Dhaka

17:00
Arrive Cox's Bazar

17:30
Hotel check-in

18:30
Laboni Beach sunset

20:30
Dinner

Each stop card:
- time
- image if available
- duration
- travel to next stop
- cost if known
- map pin

Allow reorder only when route engine can recalculate.

---

# PART AW — LIVE RECALCULATION

When user changes:
- travel mode
- travellers
- rooms
- hotel tier
- food tier
- days
- return trip
- overnight-travel toggle

Update totals instantly.

Use debounced state where needed.

---

# PART AX — COST BAR

Keep a sticky cost summary on desktop.

Example:

**Trip Estimate**
৳26,400–৳31,800

Per person:
৳6,600–৳7,950

Breakdown:
Transport 32%
Stay 29%
Food 24%
Local 11%
Entry 4%

Mobile:
collapsible sticky bottom bar.

---

# PART AY — COST CHART

Use a simple horizontal stacked visualization.

Do not use a corporate dashboard pie chart unless it genuinely helps.

Travel planning should remain visually editorial.

---

# PART AZ — USER OVERRIDES

Users often already know a fare.

Allow:

**I already have a ticket price**

Input.

**I have a hotel quote**

Input.

User value overrides model value.

Label:

**Your price**

This makes the planner useful even when data gets old.

---

# PART BA — SOURCES PANEL

At the bottom of itinerary:

**How we estimate costs**

List:
- official BRTA ordinary-bus rate
- stored Bangladesh Railway fares
- current airline market baseline
- recent hotel-market baseline
- route distance source
- manually entered user prices

Show:
**Last checked**

This is critical for trust.

---

# PART BB — DATA FRESHNESS BADGES

Examples:

Published fare
Updated Sep 2026

Typical market range
Checked Oct 2026

Hotel baseline
Captured Sep 2026

Fallback estimate
No current route quote

Use subtle badges.

---

# PART BC — IMPORTANT CURRENT SOURCES TO ENCODE

These sources are for initial configuration and future validation.

## Bus

BRTA inter-district fare list:
https://brta.gov.bd/site/page/1a7a3abe-99a0-473c-abf7-b232d0ee5edd/

Latest Sep 2026 fare change reporting based on government gazette:
https://www.bssnews.net/news/427466
https://bdnews24.com/bangladesh/vi8979wckd

AC fare status:
https://www.thedailystar.net/news/bangladesh/news/ac-bus-fares-climb-amid-fuel-price-hike-4282521

## Railway

Official Railway fare list pages:
https://railway.gov.bd/pages/files/69199762933eb65569ddc6b9
https://railway.gov.bd/pages/files/6919975d933eb65569ddc526

Current route examples:
https://gojatra.com/train/dhaka-to-coxs-bazar-train-ticket-price/
https://gojatra.com/train/sonar-bangla-express-train-schedule-ticket-price/
https://gojatra.com/train/padma-express-train-schedule-ticket-price/

## Flights

Air Astra official current advertised starting fares:
https://www.airastra.com/

Market route references:
https://goflybd.com/air-ticket-price-in-bangladesh/
https://goflybd.com/dhaka-to-coxs-bazar-air-ticket-price-flight-schedules/
https://goflybd.com/dhaka-to-sylhet-air-ticket-price-flight-schedules/

## Accommodation

Current observed market snapshots:
https://bdplaces.com/dhaka-trip-cost/
https://bdplaces.com/coxs-bazar-trip-cost/
https://bdplaces.com/sylhet-trip-cost/
https://bdplaces.com/khulna-trip-cost/

These are planning references, not booking APIs.

Do not scrape them continuously without permission.

---

# PART BD — EXAMPLE: DHAKA → COX'S BAZAR

Use this as a planner QA scenario.

Approx road distance:
around 405–415 km depending routing provider.

Expected choices:

Non-AC bus:
roughly ~৳1,000–1,150 planning range

AC bus:
roughly ~৳1,800–2,300 standard market estimate
higher premium/sleeper possible

Train:
Shovan Chair: ~৳695
Snigdha: ~৳1,325
AC Seat: ~৳1,590
AC Berth when available: ~৳2,380

Flight:
starting around ~৳5,000–5,500 in lower fare inventory
can rise substantially

Hotel:
budget ~৳3,150/room/night
mid ~৳4,150
comfortable ~৳5,850
before seasonal adjustment

Planner must show that the night bus/train can sometimes save a hotel night.

---

# PART BE — EXAMPLE: DHAKA → CHATTOGRAM

QA:

Road distance:
use routing result.

Non-AC:
official-rate based estimate + toll/route effects.

Train:
Shovan Chair ~৳450
First Seat ~৳685
Snigdha ~৳855
AC Seat ~৳1,025

Flight:
rough starting baseline ~৳4,700+
dynamic.

The planner should typically recommend:
train for balanced,
bus for budget flexibility,
flight for speed when time is more valuable.

---

# PART BF — EXAMPLE: DHAKA → SYLHET

QA:

Road:
~250 km range depending route.

Bus:
official ordinary rate gives a useful baseline.

Flight:
current low starting market roughly ~৳4,700+, dynamic.

Hotel:
budget ~৳2,200
mid ~৳3,050
comfortable ~৳4,650

Train:
use actual route fare data if loaded.
Do not invent exact train fare from distance when route data is absent.

---

# PART BG — CITY PRICE INTELLIGENCE

Major-city accommodation should cost more than ordinary district towns.

Build a location profile:

```ts
type LocationCostProfile = {
  locationId: string;
  hotelTier: "A" | "B" | "C";
  tourismDemand:
    | "normal"
    | "high"
    | "seasonal_high";
  localTransportFactor: number;
  foodFactor: number;
  seasonalityProfile?: string;
};
```

Examples:

Dhaka:
A
business/high demand

Cox's Bazar:
A
seasonal_high

Chattogram:
A/B
major city

Sylhet:
B
tourism/high

Sreemangal:
B
seasonal tourism

Bandarban:
B
seasonal/high local transport

Khulna:
B/C

ordinary district town:
C

---

# PART BH — HILL DISTRICT LOGIC

Bandarban, Sajek, Rangamati and similar routes require special handling.

Do not assume:
distance × normal local-transport price.

Include:
- reserved jeep/chander gari
- shared jeep
- boat where applicable
- permission/restriction notices where current data exists
- road-condition warning
- seasonal rain/landslide warning

Mark:
**Local transport can dominate trip cost here.**

---

# PART BI — ISLAND / WATER ROUTES

For Saint Martin's and other water-dependent destinations:

model:
road/flight to gateway
+
ship/boat fare
+
local transfer

Do not calculate a single road-only trip.

Transport segments must support:

```ts
type TripSegmentMode =
  | "bus"
  | "train"
  | "flight"
  | "launch"
  | "boat"
  | "car"
  | "local";
```

---

# PART BJ — TRIP SEGMENT MODEL

Use:

```ts
type TripSegment = {
  id: string;
  originId: string;
  destinationId: string;
  mode: TripSegmentMode;
  distanceKm?: number;
  durationMinutes?: number;
  farePerPerson?: {
    low: number;
    high: number;
    expected?: number;
  };
  farePerGroup?: {
    low: number;
    high: number;
    expected?: number;
  };
  confidence: PriceConfidence;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedAt?: string;
  notes?: string[];
};
```

---

# PART BK — SHAREABILITY OF PLANS

A completed plan should generate a beautiful card:

**Dhaka → Cox's Bazar**

3 days
4 friends

Estimated:
৳7,200/person

Travel:
Train

Stay:
Budget

6 saved places

ExploreBD

Do not include exact sensitive personal information.

---

# PART BL — NO EMPTY PLANNER PAGES

If data is missing:

Do not show an empty card.

Instead:

**We don't have a verified fare for this route yet.**

Then:
- show fallback estimate
- identify it clearly
- let user enter a quoted price
- provide transport options if known

This creates usefulness even with incomplete data.

---

# PART BM — SEO FOR PLANNING PAGES

When public route pages are created, make them crawlable.

Examples:

/travel/dhaka-to-coxs-bazar
/travel/dhaka-to-sylhet
/travel/dhaka-to-chattogram

Pages can include:
- distance
- transport choices
- indicative fares
- trip time
- best mode
- related places
- planning calculator

SSR/SSG public text.

Dynamic planner remains interactive client-side.

---

# PART BN — MOBILE PLANNER

Mobile flow:
one focused decision at a time.

Do not put the full desktop form into one vertical screen.

Use:
bottom sheet selectors
large touch targets
sticky Next / Build Trip button

Result:
- summary first
- recommended transport
- cost
- itinerary
- map

Map can expand full-screen.

---

# PART BO — PERFORMANCE

Cinematic landing must not destroy performance.

Requirements:

- optimized poster
- AVIF/WebP
- do not autoplay huge 4K video
- use responsive video source if possible
- pause video when tab hidden
- honor reduced motion
- lazy-load below-fold destination imagery
- code split MapLibre/heavy maps
- no enormous JavaScript animation bundles

Target good mobile Core Web Vitals.

---

# PART BP — ACCESSIBILITY

Hero:
- adequate contrast
- video decorative if no essential content
- pause behavior if accessibility requires
- meaningful alt text for images
- keyboard-accessible CTA

Map:
- provide searchable district list as non-map equivalent

Planner:
- proper field labels
- keyboard navigation
- accessible tabs
- accessible drawers
- readable fare tables

---

# PART BQ — DESIGN IMPLEMENTATION COMPONENTS

Create/refactor components:

Landing:
- CinematicHero
- TransparentHeader
- ScrollCue
- SectionReveal
- InteractiveMapPreview
- StickyPlannerStory
- DestinationRail
- PassportPreview
- ShareCardShowcase
- FinalCinematicCTA

Planner:
- PlannerHero
- RouteInput
- TravelStyleSelector
- TransportComparison
- FareSourceBadge
- FareExplanationDrawer
- TripCostSummary
- TripCostBreakdown
- ItineraryTimeline
- RouteMap
- FeasibilityCard
- CostOverrideForm
- DataFreshnessPanel

---

# PART BR — CLEAN ANIMATION PRIMITIVES

Build reusable motion presets:

```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }
};

export const softScale = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 }
  }
};
```

Use sparingly.

---

# PART BS — QUALITY RULES

Never:
- copy competitor code/assets
- show fake live prices
- pretend AC bus fare is government-fixed
- calculate train fare only from road distance
- treat flights as fixed-price transport
- use one hotel price for Bangladesh
- display a missing entry fee as free
- create impossible schedules
- force login before initial map usage
- make public travel pages look like dashboards

Always:
- show price confidence
- show checked date
- use ranges where uncertain
- let users override costs
- preserve working app behavior
- keep the visual experience emotional and premium

---

# PART BT — EXECUTION PHASES

## Phase 1
Repository audit and design foundation.

## Phase 2
Cinematic landing hero + transparent nav.

## Phase 3
Homepage scroll story and map preview.

## Phase 4
Destination/discovery scenes.

## Phase 5
Planner data architecture.

## Phase 6
Travel cost engine.

## Phase 7
Transport comparison UI.

## Phase 8
Accommodation, food and local transport budgeting.

## Phase 9
Day-by-day itinerary + feasibility.

## Phase 10
Passport and social-card scenes.

## Phase 11
Responsive polish, accessibility, performance, SEO.

After every phase:
- TypeScript
- lint
- tests
- production build

Fix regressions immediately.

---

# PART BU — ACCEPTANCE TESTS

The redesign is not done until these work.

## Landing

- Hero renders beautifully on desktop and mobile.
- Background media does not block first interaction.
- CTA reaches map.
- Scroll animation is smooth.
- reduced motion works.
- navbar transforms correctly.
- sections have visual rhythm.
- no generic dashboard appearance.

## Planner

Test at minimum:

Dhaka → Cox's Bazar
Dhaka → Chattogram
Dhaka → Sylhet
Dhaka → Rajshahi
Dhaka → Khulna
Dhaka → Bandarban

For each:
- road distance
- available modes
- mode price range
- hotel tier
- food
- local transport
- nights
- per-person cost
- group cost
- confidence/source
- itinerary feasibility

No NaN.
No zero-cost transport unless genuinely free.
No impossible travel mode.

---

# PART BV — FINAL PRODUCT STANDARD

When finished, a user should feel:

1. “This looks like a serious premium travel product.”
2. “I want to make my map.”
3. “I can actually use this to plan a trip.”
4. “The cost estimate explains where the number came from.”
5. “I want to save/share my result.”
6. “I want to come back after my next trip.”

The landing page should capture the emotional energy of the inspiration website without copying its proprietary implementation.

The planner should be substantially better than the inspiration site by being:
- transparent
- route-aware
- cost-aware
- transport-aware
- city-aware
- realistic about uncertainty

DO THE WORK IN THE EXISTING REPOSITORY.

Do not merely write a design document.

Implement the redesign and the planner architecture, keep the build working, and report clearly what was changed.
