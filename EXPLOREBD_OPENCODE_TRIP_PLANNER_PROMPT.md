# ExploreBD OpenCode Prompt — Trip Planner Only

You are working inside my EXISTING ExploreBD repository.

Live app:
https://explorebd-three.vercel.app/

Planner inspiration:
https://unseenbangladesh.com/#plan

IMPORTANT:
Do not copy or scrape proprietary source code, CSS, JavaScript bundles, images, or private implementation from the inspiration website.

Recreate the publicly observable planner interaction as a clean-room implementation, then improve it for ExploreBD.

The inspiration interaction model to preserve is:

1. Choose starting district
2. Choose destination districts
3. Choose route order
4. Choose trip days and optional total group budget
5. Choose number of travellers and travel style
6. Optionally return to origin
7. Generate the itinerary
8. Print / save as PDF
9. Reset

Keep the planner on ONE page. Do not turn it into a multi-page wizard.

The final planner must be simpler than a booking engine but much more useful than a generic travel form.

---

## 1. Inspect the existing repository first

Before editing:

- inspect current planner route/components
- inspect district data
- inspect attraction/place data
- inspect Bangladesh map/GeoJSON/SVG
- inspect localStorage/state
- inspect travel cost files
- inspect routing APIs
- inspect export/PDF code
- inspect current Tailwind/design system
- inspect existing i18n

Then run:
- TypeScript
- lint
- tests
- production build

Preserve working functionality and user data.

Do not rename district IDs unnecessarily.
If storage changes, add migration logic.

---

## 2. Planner page structure

Top intro:

Eyebrow:
“A trip shaped around you”
Bangla:
“আপনার মতো করে সাজানো ভ্রমণ”

H1:
“Trip Planner”
Bangla:
“ট্রিপ প্ল্যানার”

Description:
“Choose where you are starting and which districts you want to visit. ExploreBD will arrange the practical route, daily stops, stay plan, and estimated cost.”

Bangla:
“কোথা থেকে শুরু করবেন আর কোন কোন জেলায় যাবেন বেছে নিন — ExploreBD সাজিয়ে দেবে কোথায় আগে যাবেন, প্রতিদিন কী দেখবেন, কোথায় থাকবেন এবং মোট কত খরচ হতে পারে।”

Use a premium warm-ivory travel-app visual style, not a corporate dashboard.

---

## 3. Desktop layout

Use a two-column workspace.

Left side: planner controls, about 40–46%.
Right side: sticky Bangladesh map, about 54–60%.

Below both columns: generated trip result.

Concept:

[ Controls ] [ Interactive Bangladesh Map ]
[         Generated Plan Below          ]

The map should remain visible while users modify controls.

---

## 4. Mobile layout

Order:

1. planner intro
2. start district
3. destination selector
4. interactive map
5. route order
6. days and budget
7. travellers and style
8. Build My Trip
9. results

Use bottom sheets for:
- district selection
- attraction selection
- route details

Do not shrink the map into a tiny card.

---

## 5. Numbered sections

Keep the simple five-step visual structure.

1. Where will you start?
2. Which districts will you visit?
3. What route order?
4. How many days and what budget?
5. What kind of trip?

Bangla:

১. কোথা থেকে শুরু করবেন?
২. কোন কোন জেলায় যাবেন?
৩. কোন ক্রমে ঘুরবেন?
৪. কত দিন, কত বাজেট?
৫. ভ্রমণের ধরন

Use numbered badges, not a wizard progress bar.

---

## 6. Step 1 — Starting district

Use one searchable combobox containing all 64 districts.

Support Bangla and English search.

Selected origin displays:
- district name
- division
- map-pin icon

Highlight the origin distinctly on the map.

Do not automatically count origin as a destination.

---

## 7. Step 2 — Destination districts

Use a searchable multi-select.

Users must also be able to click districts directly on the map to add/remove them.

Map and selector state must stay synchronized.

Selected chips example:

1 Cox's Bazar ×
2 Bandarban ×
3 Rangamati ×

Prevent duplicates.

---

## 8. Destination attraction selection

When a district is selected, make its known attractions selectable.

Example:

Cox's Bazar
✓ Cox's Bazar Sea Beach
✓ Himchari
✓ Inani Beach
□ Ramu
□ Maheshkhali

Controls:
- Recommended
- Select all
- Clear

Default:
preselect 2–4 high-priority places based on available trip days.

Each attraction may show:
- name
- category
- estimated visit duration
- known entry fee

Do not force attraction selection. If none are chosen, use recommended places.

---

## 9. Map behavior

Map states:

Origin:
distinct blue/gold marker or ring.

Selected destination:
ExploreBD emerald.

Unselected:
warm neutral.

Hover:
subtle highlight.

Optimized route:
numbered sequence badges.

After route calculation:
draw route connections.

If real road geometry exists, use it.
If not, use approximate connectors and label them approximate.

Clicking a selected district again removes it.

---

## 10. Step 3 — Route order

Provide two modes.

### Smart Route

Default ON.

Label:
“Optimize for the shortest practical route”
Bangla:
“সবচেয়ে কম দূরত্বের ব্যবহারিক রুটে সাজিয়ে দিন”

Optional:
“Start with”
[chosen destination]

Then optimize the remaining route.

### Manual Route

When Smart Route is OFF:

1. Cox's Bazar ↑ ↓
2. Bandarban ↑ ↓
3. Rangamati ↑ ↓

Prefer drag-and-drop, but keep up/down buttons for accessibility.

Any reorder must update:
- map
- route distance
- travel time
- itinerary
- cost

---

## 11. Route optimization

Priority:

1. real road travel-time matrix
2. road-distance matrix
3. stored district-to-district road distance
4. Haversine × road-factor fallback

For 2–8 destinations:
- nearest-neighbour seed
- 2-opt improvement

Optimize for practical route, not straight geographic line.

Account for hills, rivers and road connectivity when data exists.

---

## 12. Route summary

Show a compact route:

Dhaka
↓ 243 km
Chattogram
↓ 148 km
Cox's Bazar
↓ 110 km
Bandarban

Show:
- total intercity distance
- estimated travel time
- return distance/time if round trip is ON

---

## 13. Step 4 — Trip days

Large stepper:

−  3 days  +

Range:
1–30.

Changing days should immediately update feasibility.

---

## 14. Optional total budget

Field:

“Total budget”
“for everyone, optional”

Prefix:
৳

Placeholder:
e.g. 20000

This budget represents the entire group, not per person.

If blank:
estimate based on travel style.

If entered:
attempt to fit the trip to the budget.

---

## 15. Budget status

Show:

Budget: ৳30,000
Estimated: ৳27,500–31,200

Statuses:

Within budget
Near budget
Over budget

If over budget, suggest practical actions:

- Non-AC coach instead of AC
- Shovan Chair instead of AC train
- lower hotel tier
- overnight travel
- remove one destination
- add a day if route is too compressed

Do not merely show “over budget”.

---

## 16. Step 5 — Travellers

Large stepper:

−  4 travellers  +

Range:
1–30.

Use group size for:
- intercity fares
- rooms
- food
- entry fees
- local transport

---

## 17. Travel style

Three radio cards.

### Save / সাশ্রয়ী

Use when appropriate:
- non-AC intercity bus
- Shovan Chair train
- budget hotel
- low-cost local food
- shared/local transport

Description:
“Travel for less with practical transport and simple stays.”

### Balanced / মাঝারি

DEFAULT.

Use when appropriate:
- AC coach
- Snigdha train
- mid-range hotel
- balanced food budget
- moderate convenience

Description:
“A practical balance of comfort and cost.”

### Comfort / আরামদায়ক

Use when appropriate:
- premium AC coach
- AC train
- flight where time-saving makes sense
- comfortable hotel/resort
- reserved transport where practical

Do not automatically choose flights for every Comfort trip.

---

## 18. Round trip

Checkbox ON by default:

“Return to my starting point”
Bangla:
“শেষে শুরুর জায়গায় ফিরে আসবো”

If OFF:
trip ends at last destination.

Update:
- route
- time
- cost

immediately.

---

## 19. Build trip CTA

Required inputs:

- origin
- at least one destination
- trip days
- travellers

CTA:

“Build My Trip”
Bangla:
“আমার ট্রিপ সাজিয়ে দিন”

Use the primary ExploreBD green.

Mobile:
sticky CTA while form is ready.

---

## 20. Validation

No origin:
“Choose where your trip starts.”

No destination:
“Choose at least one destination district.”

Too many destinations for available days:
do not block generation.

Generate the plan with a feasibility warning.

---

## 21. Generated plan summary

Smoothly scroll to results.

Show:

YOUR BANGLADESH TRIP

Dhaka → Chattogram → Cox's Bazar

3 days
4 travellers
Balanced

Approx. 500 km
Approx. 16h travel

Estimated total:
৳28,500–33,000

Per person:
৳7,125–8,250

Always use realistic ranges when data is uncertain.

---

## 22. Feasibility

Return one:

Comfortable
Busy
Too tight

Example:

“Too tight for 2 days. Add one day or remove 2 attractions.”

Use practical reasons:
- travel hours
- attraction count
- local transfer time
- overnight requirements

---

## 23. Daily itinerary

One card per day.

Example:

DAY 1
Dhaka → Chattogram

06:30
Leave Dhaka

12:00
Arrive Chattogram

12:30
Lunch and hotel check-in

14:30
Patenga Beach

17:00
Riverfront

19:30
Dinner

Stay:
Chattogram

Estimated day cost:
৳X–Y

---

## 24. Itinerary realism

Account for:

- intercity travel time
- hotel check-in
- meals
- attraction duration
- local travel
- opening hours when known
- daylight
- buffers

Default sightseeing window:
08:30–18:00

Lunch:
12:30–14:00

Typical maximum active day:
~10 hours.

Do not create impossible schedules.

---

## 25. Attraction duration fallback

If exact duration is missing:

Museum: ~90 min
Historical site: ~75 min
Beach: ~120 min
Park: ~120 min
Viewpoint: ~60 min
Religious site: ~45–60 min
Nature destination: ~120–240 min

These are scheduling assumptions, not claims about opening hours.

---

## 26. Accommodation section

For each overnight district show:

Where to stay

Recommended area if data exists.

Price tiers:
- Budget
- Mid-range
- Comfort

Use location-sensitive rates.

Do not use one hotel price for all Bangladesh.

If no live hotel inventory exists:
show typical area/tier, not fake available hotels.

---

## 27. Transport between districts

For every intercity segment show recommended transport.

Example:

Dhaka → Chattogram

Recommended:
Train — Snigdha

Time:
~5h

Fare:
৳855/person

Why:
Good balance of comfort and price

Alternatives:
Bus / Train / Flight

Only show modes that are actually realistic.

---

## 28. Transport selector after plan generation

Allow user to change mode.

Cards/tabs:
- Bus
- Train
- Flight
- Launch/boat where relevant

Changing mode recalculates:
- fare
- trip total
- arrival time
- itinerary if necessary

---

## 29. Bus pricing

Use centralized cost configuration.

Ordinary/non-AC inter-district bus:

official-rate-based estimate using current configured BRTA passenger-km rate.

Do not hardcode current rate inside React components.

Display:
“Official-rate estimate”

AC coach:
- route-specific observed fare if available
- otherwise market-based range/multiplier

Display:
“Typical market range”

Never label AC fare as government-fixed unless that changes and data is verified.

---

## 30. Train pricing

Priority:

1. exact stored route/class fare
2. published/official route fare
3. rail-distance fallback estimate

Never derive an exact train fare from road distance.

Only show classes available for the route/service.

Example:

Shovan Chair ৳695
Snigdha ৳1,325
AC Seat ৳1,590

Allow class selection.

---

## 31. Flight pricing

Flights are dynamic.

Display:

“from ৳X”
or
“৳X–Y typical range”

Label:
“Dynamic fare estimate”

Do not call it live unless a genuine live airfare API/provider is connected.

---

## 32. Hotel cost engine

Price priority:

1. city-specific baseline
2. tourism-city baseline
3. city tier fallback

Major business/tourism cities should cost more than ordinary district towns.

Room count:

ceil(travellers / occupancyPerRoom)

Allow room count override.

---

## 33. Food budget

Include food automatically.

Travel-style presets:

Save:
low-cost local meals

Balanced:
mixed local restaurants

Comfort:
higher restaurant allowance

Show daily per-person assumption.

Allow manual override.

---

## 34. Local transportation

Include realistic local travel:

- rickshaw
- CNG
- rideshare
- local bus
- auto
- jeep/chander gari
- boat
- reserved car where relevant

Remote/hill locations need their own rules.

Do not use the same local-transport baseline for Dhaka and Bandarban.

---

## 35. Entry fees

Known:
include.

Unknown:
do not assume free.

Show:
“Some entry fees are not included.”

---

## 36. Cost breakdown

Display:

Transport
Stay
Food
Local travel
Entry fees
Extras

Then:
Estimated total
Per person

Use a clean horizontal breakdown, not a finance dashboard.

---

## 37. Cost confidence

Use labels:

Published fare
Official-rate estimate
Typical market range
Typical room rate
Planning estimate

Every generated cost should internally track source/confidence.

Never present a fallback as an official value.

---

## 38. “Why this price?” disclosure

Each cost category can expand.

Example bus:

Road distance: 405 km
Rate source: configured BRTA ordinary intercity rate
Route/toll allowance: included
Status: Official-rate estimate
Checked: [date]

Example hotel:

2 rooms
2 nights
Cox's Bazar mid-range baseline
Status: Typical room rate

This is essential for trust.

---

## 39. Overnight-travel saving

When a route supports overnight bus/train:

Suggest:

“Travel overnight and you may save one hotel night.”

Toggle:
“Use overnight travel”

When enabled:
recalculate:
- hotel nights
- schedule
- total

Do not enable invisibly.

---

## 40. Budget-fitting behavior

If user supplied total budget:

attempt, in order:

1. cheaper realistic intercity mode
2. lower stay tier
3. overnight travel if sensible
4. lower food tier
5. cheaper local transport
6. recommend reducing destinations

Never remove destinations automatically.

Explain each recommendation.

---

## 41. Result map

Show route beside/above itinerary.

Numbered stops.

Click map stop:
scroll to district/day.

Click itinerary district:
highlight map.

Keep map and itinerary synchronized.

---

## 42. District result details

Expandable district section:

- selected attractions
- planned hours
- arrival/departure
- recommended stay area
- district transport
- district cost
- nearby alternative

Keep default view clean.

---

## 43. Editable result

After generation user can still change:

- destinations
- route order
- attractions
- days
- travellers
- budget
- travel style
- transport mode
- hotel tier
- room count
- round trip
- overnight travel

Use “Update Plan” where recalculation is significant.

Do not force a full reset.

---

## 44. Print / PDF

Provide:

“Print / PDF”

Create dedicated print CSS.

Include:
- ExploreBD logo
- route title
- dates if known
- travellers
- day-by-day itinerary
- transport
- stay
- cost breakdown
- disclaimer

Hide:
- navigation
- editing controls
- unnecessary buttons

Avoid page breaks inside day cards.

Browser Print → Save as PDF is acceptable initially.

---

## 45. Start over

Button:

“Start Over”
Bangla:
“নতুন করে শুরু”

Confirmation:
“Start a new plan and clear the current planner?”

Only reset planner state.

Never erase:
- visited districts
- Passport
- account data

---

## 46. Save trip

Enhancement:

For guest:
save locally.

For signed-in user:
sync if account backend exists.

Default name:
“Dhaka → Cox's Bazar · 3 Days”

Allow rename.

---

## 47. Share trip

Create share-safe summary:

DHAKA → COX'S BAZAR
3 Days
4 Travellers
~৳7,200/person
Train + Mid-range Stay
ExploreBD

Do not expose private notes.

---

## 48. Planner state

Use a serializable structure similar to:

```ts
type PlannerState = {
  originDistrictId: string | null;
  destinationDistrictIds: string[];
  selectedPlaceIdsByDistrict: Record<string, string[]>;
  routeMode: "optimized" | "manual";
  preferredFirstDestinationId: string | null;
  manualRouteOrder: string[];
  days: number;
  totalBudget: number | null;
  travellers: number;
  travelStyle: "save" | "balanced" | "comfort";
  returnToOrigin: boolean;
  selectedTransportBySegment: Record<string, string>;
  hotelTierByDistrict: Record<string, "budget" | "mid" | "comfort">;
  roomsByDistrict: Record<string, number>;
  useOvernightTravel: boolean;
};
```

---

## 49. Generated plan model

```ts
type CostRange = {
  low: number;
  expected?: number;
  high: number;
};

type GeneratedTripPlan = {
  routeDistrictIds: string[];
  totalDistanceKm: number;
  totalTravelMinutes: number;
  feasibility: "comfortable" | "busy" | "too_tight";
  days: TripDay[];
  costs: {
    transport: CostRange;
    accommodation: CostRange;
    food: CostRange;
    localTransport: CostRange;
    entryFees: CostRange;
    total: CostRange;
    perPerson: CostRange;
  };
  warnings: string[];
  assumptions: string[];
};
```

---

## 50. Transport segment model

```ts
type TransportSegment = {
  originId: string;
  destinationId: string;
  mode: "bus" | "train" | "flight" | "launch" | "boat" | "car";
  className?: string;
  distanceKm?: number;
  durationMinutes?: number;
  farePerPerson: CostRange;
  confidence:
    | "official_exact"
    | "official_formula"
    | "market_observed"
    | "fallback_estimate";
  sourceLabel?: string;
  checkedAt?: string;
};
```

---

## 51. Planner algorithm

Implement:

1. validate inputs
2. calculate route order
3. get intercity distance/time
4. determine realistic transport modes
5. choose recommended mode from travel style/budget
6. estimate arrivals
7. allocate attractions across days
8. determine overnight locations
9. calculate rooms/nights
10. calculate food
11. calculate local transport
12. calculate known entry fees
13. calculate low/high totals
14. evaluate feasibility
15. generate warnings/suggestions
16. render itinerary

---

## 52. Feasibility logic

Compare:

available trip minutes
vs.
intercity travel
+ local travel
+ attraction duration
+ meals
+ check-in
+ buffers

Guideline:

<=80% used:
Comfortable

80–105%:
Busy

>105%:
Too tight

Long intercity days can override this score.

---

## 53. Missing data fallback

If exact fare is unavailable:
show an estimate.

If train is unavailable:
hide it.

If flight is unavailable:
hide it.

If hotel data is missing:
use city tier.

If attraction duration is missing:
use category default.

If route API fails:
use cached/stored distance or safe fallback.

The planner should still produce a useful plan.

Never show zero because data is missing.

---

## 54. Local storage

Save unfinished planner state under a versioned key, e.g.:

explorebd:planner:v1

On revisit ask:

“Continue your previous unfinished plan?”

Buttons:
Continue
Start New

Do not silently surprise users.

---

## 55. Bangla-first support

Every planner string must support Bangla and English.

Do not translate only headings.

Translate:
- helper text
- errors
- cost labels
- itinerary verbs
- transport labels
- warnings
- PDF copy

Use existing i18n architecture or add a clean one.

---

## 56. Visual style

Use ExploreBD premium palette:

Deep Forest #12372A
Emerald #176B4D
Heritage Green #278661
Warm Ivory #F8F5ED
Paper #EEE8DA
Charcoal #17211D
Muted #65716B
Brass #C69B4B
River Blue #397C91
Terracotta #C66245

Planner background:
warm ivory.

Controls:
paper/white.

Origin:
river blue/brass.

Selected destinations:
emerald.

Warnings:
terracotta/amber.

Use one cohesive planner container rather than dozens of detached cards.

---

## 57. Microinteractions

Use subtle:

- chip selection
- district map transitions
- route-line draw
- cost update animation
- reorder animation
- result reveal
- attraction checkbox feedback

150–300ms.

Respect prefers-reduced-motion.

---

## 58. Empty state

Before generation:

“Your trip will appear here.”

“Choose a starting district and at least one destination.”

Show a subtle map/route placeholder.

Never leave the result area blank.

---

## 59. Loading state

If work takes noticeable time:

“Arranging your route…”
“Estimating transport costs…”
“Building your daily plan…”

Do not add artificial delay.

---

## 60. Error handling

If route lookup fails:

“We could not retrieve the exact road route, so this plan uses an approximate distance.”

Continue when possible.

One missing price should not crash the whole planner.

---

## 61. Accessibility

Required:

- keyboard-searchable district combobox
- district list alternative to map
- visible focus
- labelled steppers
- labelled radio cards
- accessible map controls
- drag/drop with up/down fallback
- print contrast
- cost status not indicated by color alone

---

## 62. Performance

- lazy-load heavy map modules
- cache route lookups
- memoize distance matrices
- do not call routing API on every keystroke
- debounce where appropriate
- persist route results where safe
- optimize for mid-range Android devices

---

## 63. Acceptance scenarios

Test at minimum:

A.
Dhaka → Cox's Bazar
3 days
2 travellers
Balanced
Round trip

B.
Dhaka → Chattogram → Cox's Bazar
4 days
4 travellers
Balanced

C.
Dhaka → Bandarban
3 days
6 travellers
Save

D.
Sylhet → Moulvibazar
2 days
2 travellers
Save

E.
Dhaka → Rajshahi
2 days
1 traveller
Comfort

F.
Dhaka → Cox's Bazar
1 day
8 travellers

Must warn that the trip is too tight.

G.
Budget lower than cheapest reasonable plan.

Must show over-budget status plus useful suggestions.

---

## 64. Responsive QA

Test:

320
360
390
430
768
1024
1280
1440
1920

Do not merely stack desktop components.

Make mobile intentionally designed.

---

## 65. Build QA

After each implementation phase run:

- TypeScript
- lint
- tests
- production build

Do not leave broken code until the end.

---

## 66. Final competitive target

Preserve the strongest parts of the inspiration planner:

- one-page simplicity
- five numbered sections
- origin selection
- destination selection
- clickable map
- route ordering
- day count
- optional total group budget
- traveller count
- travel-style presets
- return-to-origin
- print/PDF
- reset

Improve it with ExploreBD-specific value:

- attraction-level selection
- real road-distance support
- transport comparison
- transparent fare source/confidence
- location-sensitive hotel estimates
- food budget
- local transport cost
- low/high total range
- per-person and group cost
- itinerary feasibility
- overnight-travel savings
- editable results
- saved plans
- shareable plans
- better mobile experience

The final planner must be simple enough for a first-time user to understand instantly, but practical enough to genuinely help someone plan travel within Bangladesh.

Do not only describe the solution.

IMPLEMENT IT directly in the existing ExploreBD repository while preserving existing working functionality.
