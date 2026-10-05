# OPENCODE MASTER PROMPT — Bangladesh Travel Platform

Copy everything in this file into OpenCode while it is opened in the project folder. If the included `starter/` code exists, use it as the starting point. If it does not exist, create the project from scratch according to this specification.

---

## 0. YOUR ROLE AND EXECUTION MODE

You are the principal product engineer, senior UX/UI designer, data architect, security engineer, SEO engineer, and QA lead for this project.

Your job is not to merely propose an architecture or create mockups. **Build the working application end to end.** Make sensible decisions without repeatedly asking questions. If a credential or paid API key is unavailable, implement a provider adapter plus a safe local/mock/fallback path so the application still builds and runs. Never put secrets in client code.

Use the existing repository if present. Before making large changes, inspect all files and preserve useful code. Refactor weak starter code where necessary. Do not blindly rewrite working parts.

After each major milestone:

1. run TypeScript checks,
2. run tests,
3. run the production build,
4. fix all errors,
5. update `IMPLEMENTATION_STATUS.md` with what is complete, what uses fallback data, and what still needs credentials/content.

Do not leave fake buttons, dead navigation, empty panels, broken forms, or TODO-only features in the user-facing UI. If a feature is intentionally deferred, hide it behind a feature flag rather than presenting a non-working control.

The final result must be a polished production-oriented application, not a clone with renamed text.

---

# 1. CLEAN-ROOM / IP RULE

The product is inspired by the public behavior of `https://unseenbangladesh.com/`, but this must be a **clean-room implementation**.

You may reproduce general product concepts and workflows such as:

- a selectable Bangladesh travel map,
- district progress,
- map export,
- travel guides,
- trip planning,
- quizzes,
- map puzzles,
- leaderboards,
- travel profiles,
- share cards,
- a world travel map.

Do **not** copy:

- private source code,
- minified/proprietary implementation code,
- wording from their travel articles,
- their branding,
- their exact color scheme,
- their icons/logo,
- their images unless independently obtained under a valid license,
- their proprietary datasets,
- their layout pixel-for-pixel.

Create a distinct visual identity and original code. Use open/licensed data sources listed later in this prompt.

---

# 2. PRODUCT VISION

Build the best Bangladesh-first travel progress, discovery, and trip-planning web app.

The core promise is:

> “Track where you have been, discover where to go next, plan the trip, remember it afterward, and share your Bangladesh travel story.”

The app should feel useful even without an account. Guest users should be able to immediately select districts and create a travel map. Accounts are optional and add cloud sync, public profiles, collaborative trips, and cross-device history.

The product should support both Bangla and English. Bangla should feel first-class, not machine-translated UI bolted on later.

Default working product name: **ExploreBD**.

Do not hard-code the brand name throughout the app. Put brand values in one configuration file so I can rename it later:

`src/config/brand.ts`

Example:

```ts
export const brand = {
  name: 'ExploreBD',
  nameBn: 'এক্সপ্লোর বিডি',
  tagline: 'Track. Discover. Plan. Go.',
  defaultLocale: 'bn-BD',
  supportedLocales: ['bn-BD', 'en-BD'] as const,
};
```

---

# 3. WHAT THE REFERENCE PRODUCT ALREADY DOES — BASELINE TO MATCH

At minimum, our product should cover the useful public workflows of the reference product:

1. Bangladesh 64-district selectable travel map.
2. District search.
3. Select all / clear all.
4. Click a district directly on the map.
5. Show progress such as `23 / 64`.
6. Map theme customization.
7. Optional display name.
8. Optional user photo.
9. District labels toggle.
10. PNG export.
11. JPG export.
12. PDF/print export.
13. World travel map with approximately 195 countries.
14. Bangladesh travel guide organized by divisions, districts, and attractions.
15. Search places/districts.
16. Seasonal suggestions.
17. Trip planner with starting point, destinations, days, budget, group size, order, and round trip.
18. Printable itinerary.
19. Bangladesh quiz.
20. Bangladesh map puzzle.
21. Weekly leaderboard.
22. District “famous for” discovery content.
23. Local-first privacy for map state and uploaded profile photo where practical.

Do not stop after matching the baseline. The differentiators below are the main reason users should prefer our app.

---

# 4. DIFFERENTIATORS — FEATURES THAT SHOULD MAKE PEOPLE SWITCH

## 4.1 Multi-status Travel Passport

Do not limit districts to visited/not visited.

Each district and country can have one primary status:

- `unvisited`
- `want_to_go`
- `visited`
- `favorite`
- `lived_here`

Allow a separate `visitedAt` date or year and optional visit count.

Map colors must visually distinguish these statuses. Add a legend.

The Travel Passport dashboard should calculate:

- districts visited,
- divisions completed,
- countries visited,
- total travel percentage,
- favorite districts,
- most visited district,
- current wishlist count,
- district streak/badges,
- next easy milestone, for example “Visit 2 more districts to complete Sylhet Division.”

## 4.2 Upazila Progress Mode

Add an optional advanced Bangladesh map mode for upazilas.

This should be lazy-loaded because upazila geometry can be large. Do not block the 64-district map waiting for it.

Users can switch:

`Districts | Upazilas`

If boundary data is not available initially, implement the data model and feature flag, keep the district product fully functional, and document the exact source/format needed.

## 4.3 Smart “Where Should I Go Next?”

Create a recommendation engine that considers:

- unvisited/wishlist locations,
- selected month,
- user interests,
- budget,
- available days,
- starting district,
- distance/travel time,
- weather when available,
- family/solo/couple/group preference,
- pace: relaxed / balanced / packed.

It must work without AI using deterministic scoring.

Optional AI can improve explanation text, but core recommendations must not fail without an AI API.

## 4.4 Travel Roulette / Surprise Me

Add a highly shareable feature:

“আমাকে কোথাও পাঠাও / Surprise Me”

Filters:

- max budget,
- max travel time,
- month,
- nature/history/beach/hill/food/city/adventure,
- visited/unvisited only,
- group type.

Animate a short roulette effect, then show one destination with reasons, estimated budget, route, and save-to-trip CTA.

## 4.5 Real Trip Planner + Budget Planner

Build a real itinerary rather than merely sorting district centroids.

Inputs:

- start point,
- destination districts,
- chosen attractions,
- dates or number of days,
- total budget,
- number of travelers,
- transport preference,
- pace,
- interests,
- hotel tier,
- round trip,
- accessibility constraints,
- traveling with children toggle.

Output:

- ordered route,
- day-by-day schedule,
- estimated travel time,
- suggested places per day,
- estimated transport cost,
- hotel estimate,
- food estimate,
- tickets/activities estimate,
- contingency amount,
- per-person total,
- total trip total,
- budget warning if plan exceeds target,
- printable PDF,
- shareable trip link if account/collaboration is enabled.

Use actual routing when configured. Fall back to Haversine + heuristic without breaking the planner.

## 4.6 Group Trip Collaboration

Logged-in users can create a trip and invite others through a share link.

Participants can:

- vote on destinations,
- vote on dates,
- suggest places,
- see the current itinerary,
- add shared expenses,
- mark who paid,
- split equally or custom,
- add notes.

For initial release this may be behind `FEATURE_COLLAB_TRIPS`.

## 4.7 Expense Splitter

For saved trips provide:

- total trip budget,
- planned vs actual,
- transport/hotel/food/activity/other categories,
- payer,
- participants,
- equal/custom split,
- “who owes whom” summary.

Do not build payment processing. This is tracking only.

## 4.8 Travel Journal / Memory Timeline

Users can attach memories to places or trips:

- date,
- caption,
- private note,
- rating,
- photos,
- companions text,
- favorite moment.

Guest journal content stays local by default. Account users can choose cloud sync and visibility per entry:

- private,
- link-only,
- public.

Images must be resized/compressed client-side before upload.

## 4.9 Public Travel Profile

Optional public profile:

`/profile/:handle`

Shows only information the user explicitly makes public:

- display name,
- avatar,
- district map,
- progress,
- badges,
- public trips/journal highlights.

Never expose private travel dates or private journal entries accidentally.

## 4.10 “Freshness” and Trust Layer

Travel price and transport information goes stale. Every content item that can become stale must support:

- `verifiedAt`,
- `sourceUrl`,
- `sourceName`,
- `confidence`,
- optional `validFrom` / `validUntil`.

Show human-friendly freshness:

- “Verified 12 days ago”
- “May have changed”

Add “Report outdated info” to place pages.

Do not blindly accept user edits. Reports go to moderation/admin queue.

## 4.11 Offline-Friendly Bangladesh Mode

PWA requirements:

- cache app shell,
- cache district metadata,
- cache saved guide articles,
- cache saved itineraries,
- cache the local district GeoJSON,
- allow guest passport offline,
- show a clear offline banner,
- queue appropriate local mutations.

**Do not bulk-download OpenStreetMap/OpenFreeMap tiles unless the tile provider explicitly permits offline packages.** Offline map fallback should show locally stored Bangladesh district/upazila polygons and saved content without a basemap.

## 4.12 Weather-aware Trips

When a weather provider is configured, show:

- temperature,
- precipitation probability,
- weather icon/summary,
- simple packing hint,
- severe-weather caution if supported.

Do not make safety guarantees. Label forecasts as forecasts.

## 4.13 Achievements and Challenges

Examples:

- First District
- 10 District Explorer
- 32 District Halfway
- 64 District Legend
- Complete Dhaka Division
- Complete Chattogram Division
- Coastal Explorer
- Hill Explorer
- Heritage Explorer
- 5 National Parks
- Weekend Warrior

Create monthly optional challenges such as “Visit one new district this month.”

No manipulative streak pressure. Keep gamification light and positive.

## 4.14 Better Sharing

Generate beautiful social share cards in multiple aspect ratios:

- 1200×630 social/Open Graph,
- 1080×1080 square,
- 1080×1920 story.

Templates:

- district progress,
- division completion,
- trip itinerary summary,
- quiz score,
- puzzle time,
- passport milestone.

Generate locally where possible. Upload only when user explicitly creates a public share link.

---

# 5. INFORMATION ARCHITECTURE / ROUTES

Implement these routes or equivalent router structure.

Public:

```text
/
/map
/world
/guide
/guide/:districtSlug
/place/:placeSlug
/famous
/season/:monthSlug
/planner
/passport
/journal
/games
/games/quiz
/games/map-puzzle
/leaderboard
/about
/credits
/privacy
/terms
/settings
```

Account/collaboration when enabled:

```text
/profile/:handle
/trips
/trip/:tripId
/trip/:tripId/expenses
/trip/:tripId/collaborate
/account
```

Admin when enabled:

```text
/admin
/admin/places
/admin/districts
/admin/advisories
/admin/reports
/admin/images
/admin/leaderboard
```

Use readable slugs and canonical URLs.

---

# 6. DESIGN LANGUAGE

The product must not visually copy the reference site.

Create a premium Bangladesh-inspired visual system with restrained colors, excellent typography, large touch targets, subtle map/topography motifs, and modern card layouts.

The interface should feel like a mix of:

- a premium travel product,
- a map utility,
- a lightweight travel journal,
- a trustworthy guide.

Avoid making it look like a generic SaaS dashboard.

## 6.1 Color Palette

Centralize all colors as semantic CSS variables/tokens.

### Light theme

```css
--bg: #F7F9F6;
--surface: #FFFFFF;
--surface-2: #F0F5F2;
--surface-3: #E8F0EC;

--text: #13231D;
--text-muted: #62716A;
--text-subtle: #829089;

--border: #DCE6E0;
--border-strong: #C7D6CE;

--primary: #116149;
--primary-hover: #0D533E;
--primary-pressed: #094232;
--primary-soft: #E4F3ED;

--river: #2563EB;
--river-soft: #E8F0FF;

--sunset: #E87546;
--sunset-soft: #FCEDE6;

--gold: #C98A0A;
--gold-soft: #FFF4D8;

--success: #15803D;
--warning: #B45309;
--danger: #C2413B;
--info: #2563EB;
```

### Dark theme

```css
--bg: #0D1512;
--surface: #14201B;
--surface-2: #1A2923;
--surface-3: #20332B;

--text: #EEF6F1;
--text-muted: #A9B9B1;
--text-subtle: #83968C;

--border: #2A4036;
--border-strong: #365246;

--primary: #48B58A;
--primary-hover: #5EC49B;
--primary-pressed: #369B73;
--primary-soft: #163D30;

--river: #75A4FF;
--river-soft: #172A4B;

--sunset: #F09A73;
--sunset-soft: #47261B;

--gold: #F1C45E;
--gold-soft: #443616;
```

### Travel status colors

Keep these distinct in light/dark modes and never rely on color alone. Pair them with legend labels/icons.

```text
Unvisited     neutral gray
Want to go    river blue
Visited       forest green
Favorite      sunset/coral
Lived here    warm gold
```

Map labels need strong enough contrast.

## 6.2 Typography

Use:

- English/Latin: `Inter`
- Bangla: `Noto Sans Bengali`

Prefer package/self-hosted fonts such as Fontsource so the app is not dependent on runtime Google Fonts requests.

Fallback:

```css
font-family: Inter, "Noto Sans Bengali", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Suggested scale:

```text
Display XL: 56/64 desktop, 40/48 mobile, 750 weight
H1: 42/50 desktop, 32/40 mobile, 700
H2: 32/40 desktop, 26/34 mobile, 700
H3: 24/32 desktop, 21/29 mobile, 650
Body large: 18/30
Body: 16/26
Small: 14/21
Caption: 12/18
```

Bangla line-height should be slightly more generous when necessary.

## 6.3 Spacing

Use a 4px base system:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

Main desktop content max width: `1280px`.

Guide article readable width: approximately `760px` for body text.

## 6.4 Radius

```text
small controls: 10px
inputs/buttons: 12px
cards: 18px
feature panels: 24px
large map/hero panels: 28px
pills: 999px
```

## 6.5 Shadows

Use subtle shadows only.

Cards should usually be separated by border/background before shadow.

Example:

```css
--shadow-sm: 0 1px 2px rgba(13, 35, 27, .06);
--shadow-md: 0 12px 32px rgba(13, 35, 27, .08);
--shadow-lg: 0 24px 64px rgba(13, 35, 27, .12);
```

## 6.6 Icons

Use Lucide icons or another single consistent open-source icon set.

Do not mix emoji and professional icons in core navigation. Emoji are acceptable inside quiz content or playful achievements.

## 6.7 Motion

Use subtle motion:

- 120–180ms controls,
- 200–280ms panels,
- gentle map fill transitions,
- animated progress ring,
- tasteful Travel Roulette animation.

Respect `prefers-reduced-motion`.

---

# 7. RESPONSIVE NAVIGATION

## 7.1 Desktop header

Sticky header, approximately 72px high.

Left:

- logo mark,
- `ExploreBD` text.

Center/main navigation:

1. Map
2. Guide
3. Planner
4. Passport
5. Games
6. More ▼

“More” contains:

- World Map
- Famous For
- Journal
- Leaderboard
- About

Right:

- global search button,
- `বাংলা / EN` locale switcher,
- light/dark/system theme control,
- account avatar or `Sign in` when accounts are enabled.

Active route must have a clear visual state.

Use accessible dropdown menus with keyboard navigation.

## 7.2 Mobile header

Approximately 56px.

Left:

- compact logo.

Right:

- search,
- menu/profile.

Do not squeeze all desktop navigation into the top bar.

## 7.3 Mobile bottom navigation

Fixed bottom navigation with safe-area padding.

Five primary items:

1. Map
2. Explore
3. Plan
4. Passport
5. Profile/More

Do not cover important CTAs or inputs. Pages with forms should add bottom padding.

---

# 8. HOME PAGE

Home should sell the product without feeling like a marketing landing page disconnected from the utility.

## Hero

Desktop: two-column.

Left:

- eyebrow: `64 districts · 8 divisions`
- strong bilingual-friendly H1
- 2-line explanation
- primary CTA: `আমার ট্রাভেল ম্যাপ বানাই / Build my travel map`
- secondary CTA: `Plan a trip`

Right:

- live mini Bangladesh map preview with sample highlighted districts,
- progress stats card,
- subtle floating badge card.

Do not use a full-screen autoplay video.

## Below hero sections

1. “Your Bangladesh Passport” preview.
2. “Where to go this month” seasonal carousel/grid.
3. Quick Trip Planner card.
4. Explore by interest: Nature, Beach, Hill, Heritage, Food, Family, Adventure.
5. Travel Roulette.
6. Guide preview by divisions.
7. Quiz/map puzzle teaser.
8. Trust/footer section showing open-data/image credits and privacy approach.

For a brand-new guest with no saved data, use tasteful empty-state examples and a clear CTA rather than fake personal statistics.

---

# 9. BANGLADESH MAP PAGE — CORE PRODUCT

This is the most important page.

## Desktop layout

Use a split workspace:

- left panel 340–400px,
- map/preview takes remaining width.

Left panel sections:

1. progress summary,
2. district search,
3. division filter chips,
4. status filter,
5. district list,
6. map customization,
7. export/share.

Map should remain visible while scrolling the left panel when practical.

## Mobile layout

Map first.

Use bottom sheets for:

- district list,
- filters,
- map style,
- share/export.

Avoid tiny 64-item map labels on small screens. Labels can be zoom-dependent or toggled.

## District selection behavior

Clicking an unvisited district defaults to `visited` for speed.

Provide a status edit affordance to set:

- Want to go
- Visited
- Favorite
- Lived here
- Clear

On desktop this can be a small popover. On mobile use a bottom sheet.

## Search

Search both English and Bangla district names.

Examples:

- `cox`
- `কক্স`
- `moulvi`
- `মৌলভী`

Normalize punctuation/apostrophes and common spelling variants where possible.

## Division progress

Show 8 division progress cards or chips:

`Dhaka 6/13`

Clicking filters to that division.

## Map customization

Allow:

- 5 curated map themes,
- labels on/off,
- English/Bangla/both labels,
- name on share card,
- local profile photo,
- title style,
- background texture on/off.

Theme examples:

1. Forest
2. River
3. Sunset
4. Midnight
5. Paper

Do not let arbitrary theme controls destroy readability.

## Export

Exports:

- PNG
- JPG
- PDF
- social square
- story card

Export must include:

- map,
- legend if multi-status is used,
- user display name if enabled,
- progress,
- subtle app attribution/brand,
- optional date.

Export should not include control buttons or browser UI.

---

# 10. WORLD MAP

Lazy-load this feature.

Support approximately 195 countries and the same statuses:

- want to go,
- visited,
- favorite,
- lived here.

Provide continent filters and bilingual country search where data exists.

Do not load world geometry on initial Bangladesh map page.

Keep exports consistent with the Bangladesh map design system.

---

# 11. GUIDE / CONTENT EXPERIENCE

## Guide landing page

Filters:

- district,
- division,
- interest/category,
- best month,
- budget level,
- duration,
- family friendly,
- accessibility information available,
- visited/unvisited relative to local passport.

Sort:

- Recommended
- Near me/start district
- Budget low to high
- Short trip
- Recently verified

Cards should show useful info, not only an image and title.

Suggested card fields:

- place name,
- district,
- category,
- ideal duration,
- approximate budget badge,
- best months,
- “visited” indicator,
- freshness badge.

## District guide page

Example route:

`/guide/dhaka`

Sections:

- overview,
- district map,
- best time,
- top places,
- hidden/less-known places,
- famous foods/products,
- sample 1-day/2-day itinerary,
- transport basics,
- safety/advisory notes,
- nearby districts,
- source/freshness information.

## Place detail page

Example:

`/place/lalbagh-fort`

Structured sections:

- title and hero media,
- district/category breadcrumbs,
- quick facts,
- overview,
- why visit,
- how to go,
- best time,
- expected time needed,
- estimated cost,
- opening schedule if verified,
- transport options,
- where to stay,
- food suggestions,
- activities,
- accessibility notes if known,
- practical tips,
- safety/advisories,
- nearby places,
- add to trip,
- mark visited/wishlist,
- report outdated info,
- source + last verified.

Never fabricate exact prices or opening hours when unavailable. Use `unknown` and explain that the user should verify.

## Content model

At minimum:

```ts
export type Place = {
  id: string;
  slug: string;
  districtId: string;
  upazilaId?: string;

  nameEn: string;
  nameBn: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  descriptionEn?: string;
  descriptionBn?: string;

  lat: number;
  lng: number;

  categories: PlaceCategory[];
  interests: string[];
  bestMonths: number[];
  typicalDurationMinutes?: number;

  cost?: {
    minBdt?: number;
    maxBdt?: number;
    basis?: 'person' | 'group' | 'entry' | 'day';
  };

  transportNotesEn?: string;
  transportNotesBn?: string;
  openingHoursTextEn?: string;
  openingHoursTextBn?: string;
  accessibilityNotesEn?: string;
  accessibilityNotesBn?: string;
  safetyNotesEn?: string;
  safetyNotesBn?: string;

  nearbyPlaceIds: string[];

  media: Array<{
    url: string;
    altEn: string;
    altBn: string;
    author?: string;
    sourceUrl?: string;
    license?: string;
    licenseUrl?: string;
  }>;

  sourceName?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  confidence?: 'high' | 'medium' | 'low';

  published: boolean;
};
```

Do not copy the reference website's place descriptions. Create the content pipeline and seed only a small number of original sample entries unless the repository already contains licensed content.

---

# 12. “FAMOUS FOR” PAGE

Create an original structured discovery feature.

Each district can contain:

- famous foods,
- agricultural products,
- crafts,
- landmarks,
- historical figures/events,
- festivals/culture,
- natural features.

Allow filters:

- Food
- Product
- Nature
- Heritage
- Culture

Clicking an item should lead to the relevant district or place page when available.

---

# 13. TRIP PLANNER — DETAILED BEHAVIOR

## Planner input flow

Use a responsive stepper/wizard but allow users to go backward without losing state.

### Step 1 — Start

- starting district or known place,
- optional exact coordinate if user chooses location permission,
- do not require precise location.

### Step 2 — Destination

- choose districts by list or map,
- choose attractions within districts,
- allow `recommend for me`.

### Step 3 — Dates & pace

- start date + end date OR number of days,
- relaxed / balanced / packed.

### Step 4 — People & interests

- solo / couple / family / friends,
- traveler count,
- children toggle,
- interests.

### Step 5 — Budget & transport

- total budget,
- hotel tier,
- bus/train/car/flight/any,
- round trip.

### Step 6 — Build plan

Produce a route and day plan.

## Route engine

Create a provider interface:

```ts
export interface RoutingProvider {
  matrix(points: GeoPoint[]): Promise<RouteMatrix>;
  route(points: GeoPoint[]): Promise<RouteResult>;
}
```

Providers:

1. `OpenRouteServiceProvider` or current HeiGIT openrouteservice endpoint when API key is configured.
2. `HaversineFallbackProvider` always available.

As of the current resource review, the older `api.openrouteservice.org` endpoint is being deprecated in favor of `api.heigit.org`. Keep the base URL configurable through environment variables rather than hard-coding a legacy endpoint.

Use matrix travel times where possible, then nearest-neighbor + 2-opt improvement for a practical route. Do not claim global optimality.

For a route with only a few destinations, calculate multiple reasonable orderings if inexpensive and choose the lowest travel-time option.

## Itinerary scheduling

Respect:

- estimated attraction duration,
- reasonable daily hours,
- travel time,
- pace,
- opening hours only when known,
- rest/lunch time.

If data is missing, clearly mark estimates.

## Budget model

Use explicit categories:

```text
transport
accommodation
food
entry/activity
local transport
contingency
```

The formula and assumptions should be visible/editable.

Never present approximate budgets as guaranteed prices.

---

# 14. WEATHER PROVIDER

Create a provider abstraction:

```ts
export interface WeatherProvider {
  getForecast(lat: number, lng: number, start?: string, end?: string): Promise<WeatherForecast>;
}
```

Open-Meteo is acceptable for prototype/non-commercial use or via its paid customer endpoint for commercial use, but its free API is currently non-commercial only. Therefore:

- keep weather behind a provider interface,
- proxy requests through the server/Worker when API credentials are involved,
- set the endpoint via environment variable,
- never assume the free public endpoint is allowed for a monetized production product,
- show required attribution,
- allow `WEATHER_PROVIDER=disabled`.

Do not make weather a hard dependency for the planner.

---

# 15. MAP / GEO DATA SOURCES

Prefer open, documented sources.

## Bangladesh administrative hierarchy

Evaluate:

`https://github.com/open-admin-data/bangladesh-administrative-divisions`

It currently documents 8 divisions, 64 districts, upazilas, coordinates, and CC BY 4.0 licensing.

Use attribution when required.

## Bangladesh boundaries

Preferred general source to evaluate:

`https://www.geoboundaries.org/`

Use `gbOpen` Bangladesh boundaries. geoBoundaries documents `gbOpen` as CC BY 4.0 with attribution.

Bangladesh convention is commonly:

- ADM1 → divisions
- ADM2 → districts
- lower admin level → upazila depending on source/year.

Verify the exact unit count and names before integrating. Build a normalization/mapping file so changing boundary sources later does not break user state.

Alternative source already referenced by the starter:

`https://github.com/ifahimreza/bangladesh-geojson`

If this source is used, inspect the exact file's provenance/license. Do not assume every GeoJSON file has the same license merely because the code repository uses MIT.

## Required stable internal IDs

Never use display names as permanent database keys.

Maintain internal IDs such as:

```text
bd-dhaka
bd-coxs-bazar
bd-chattogram
```

Create aliases for spelling variants:

```text
Chittagong -> Chattogram
Jessore -> Jashore
Comilla -> Cumilla
Barisal -> Barishal
```

User state must survive future label corrections.

---

# 16. BASEMAP

Use **MapLibre GL JS** for interactive geographic maps.

Official docs:

`https://maplibre.org/maplibre-gl-js/docs/`

Use a proper Vite worker setup for the installed MapLibre version.

For a no-key OSM-derived hosted style, OpenFreeMap can be evaluated:

`https://openfreemap.org/quick_start/`

Example style documented by OpenFreeMap:

`https://tiles.openfreemap.org/styles/liberty`

OpenFreeMap states commercial usage is allowed, but attribution is required and there is no SLA. Therefore create a configurable `MapTileProvider` and keep the style URL in environment/config.

Never remove attribution.

Do not depend directly on `tile.openstreetmap.org` for a production commercial app. OSM's public tile service has usage restrictions and prohibits bulk/offline downloading. Likewise, do not implement public Nominatim autocomplete. Public Nominatim has strict limits and explicitly does not allow autocomplete.

For place search inside our product, search our own district/place index first.

---

# 17. IMAGES AND MEDIA

Use owned images or open-license media.

Wikimedia Commons may be used as a source, but each file can have different attribution/license requirements.

Store metadata:

- author,
- original file/source page,
- exact license,
- license URL,
- whether modified.

Do not merely hotlink arbitrary images.

If using Wikimedia API at scale, identify the application properly and obey API usage/rate policies.

Create `/credits` that can aggregate image/data credits.

---

# 18. LOCAL-FIRST STORAGE

Guest mode must work without an account.

Use a versioned local data schema in IndexedDB. Use localStorage only for tiny preferences if needed.

Recommended stores:

```text
settings
passportDistricts
passportCountries
tripDrafts
savedPlaces
journalEntries
quizProgress
offlineArticles
```

Use a library such as Dexie or an equivalent lightweight IndexedDB wrapper.

Create migrations for local schema versions.

Do not put raw large images in localStorage.

Photo flow:

1. user selects photo,
2. validate type and size,
3. resize/compress in browser,
4. strip unnecessary metadata where possible,
5. save compressed Blob in IndexedDB,
6. upload only after explicit cloud/share action.

---

# 19. OPTIONAL ACCOUNT / CLOUD SYNC MODEL

Guest-first is non-negotiable.

Add an auth provider abstraction so the application can run without auth in development.

When auth is enabled:

- guest state can be merged into the new account,
- never silently overwrite newer cloud state,
- use `updatedAt` and conflict-aware merges,
- user can sign out without losing their already-downloaded local data unless they choose “clear device data.”

Do not require account creation just to build a map or use the basic planner.

If selecting an authentication vendor/library, prefer one that works cleanly on Cloudflare Workers and document why. Keep auth-specific code behind an adapter so it can be replaced.

---

# 20. BACKEND / CLOUD ARCHITECTURE

Use Cloudflare-oriented architecture because the existing starter already has a Worker example and it is a good fit.

Recommended:

```text
Frontend / SSR or static assets:
Cloudflare Workers static assets or Pages

API:
Cloudflare Workers

SQL:
Cloudflare D1

Object/media storage:
Cloudflare R2

Small cached configuration / rate-limit metadata if needed:
Cloudflare KV

Bot protection:
Cloudflare Turnstile for sensitive public submissions
```

Do not force every local-first feature through the backend.

## D1 tables

Create migrations for at least these server-side concepts when corresponding features are enabled:

```text
profiles
trips
trip_members
trip_votes
trip_expenses
journal_entries
checkins
leaderboard_entries
share_cards
place_reports
place_price_history
admin_audit_log
```

If place content is static files for MVP, keep it static. If admin CMS is enabled, add tables for:

```text
districts
places
place_media
place_sources
advisories
```

## API routes

Suggested API surface:

```text
GET  /api/health
GET  /api/config/public

GET  /api/leaderboard
POST /api/leaderboard

POST /api/share-cards
GET  /api/share-cards/:id

POST /api/place-reports

GET  /api/weather?lat=&lng=&start=&end=
POST /api/route/matrix
POST /api/route

GET  /api/trips/:id
POST /api/trips
PATCH /api/trips/:id
POST /api/trips/:id/invite
POST /api/trips/:id/votes
POST /api/trips/:id/expenses
```

Auth-protected routes must verify authorization server-side.

Never trust an `ownerId` supplied by the client.

---

# 21. LEADERBOARD SECURITY

The starter has a basic leaderboard endpoint. Improve it.

Do not trust a final score blindly from the browser.

For quiz:

- server can issue a challenge/session ID,
- client submits answers/timing summary,
- server validates question IDs and score where practical.

For puzzle:

- obvious impossible times should be rejected,
- store game version/difficulty,
- apply rate limits.

Public submission protections:

- input validation,
- max player name length,
- profanity/moderation hook,
- rate limiting,
- hashed/rotating abuse identifiers,
- Turnstile for suspicious or final leaderboard submission if configured.

Cloudflare Turnstile tokens must be validated server-side with Siteverify. Client-side validation alone is not sufficient.

---

# 22. QUIZ

Quiz categories:

- districts,
- landmarks,
- foods,
- rivers,
- history/culture,
- map recognition.

Modes:

- Quick 10
- Daily Challenge
- Category quiz

Question data should be structured, not hard-coded in JSX.

Example:

```ts
type QuizQuestion = {
  id: string;
  version: number;
  localeData: {
    bn: { prompt: string; explanation: string };
    en: { prompt: string; explanation: string };
  };
  answerIds: string[];
  options: Array<{ id: string; labelBn: string; labelEn: string }>;
  media?: QuizMedia;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
};
```

After answer, show a short educational explanation.

Avoid trivia that is politically contentious or unverifiable unless sourced carefully.

---

# 23. MAP PUZZLE

Modes:

1. Click the correct district.
2. Drag district shape into approximate location.
3. Division-only practice.

Difficulty:

- Easy: labels/hints
- Medium: fewer hints
- Hard: no labels

Track:

- time,
- mistakes,
- accuracy,
- difficulty,
- game version.

Provide keyboard-accessible alternative gameplay where possible; drag-only interactions are not enough.

---

# 24. GLOBAL SEARCH

Create a command/search overlay triggered by:

- search icon,
- `/` keyboard shortcut when not typing,
- `Ctrl/Cmd + K`.

Search local indexed content:

- districts,
- places,
- famous-for entries,
- saved trips.

Support Bangla and English.

Group results by type.

Do not call a geocoding service on every keystroke.

---

# 25. INTERNATIONALIZATION

Use a proper i18n structure, not ternary strings scattered everywhere.

Recommended:

```text
src/i18n/bn.json
src/i18n/en.json
```

All navigation, controls, messages, empty states, errors, export labels, and metadata should be translatable.

Content records have separate Bangla and English fields.

Use Bangladeshi number/currency formatting where appropriate:

- BDT / ৳
- locale-aware dates.

Do not mechanically convert all digits to Bangla if it harms readability in technical contexts. Use locale formatting consistently.

---

# 26. ACCESSIBILITY

Target WCAG 2.2 AA principles.

Requirements:

- keyboard navigation,
- visible focus states,
- semantic landmarks,
- correctly associated form labels,
- screen-reader labels for icon buttons,
- 44px-ish minimum touch target where practical,
- do not convey map status by color only,
- reduced-motion support,
- sufficient contrast,
- dialog focus trapping,
- escape closes modal/dialog,
- bottom sheets have accessible titles,
- map actions have list-based alternatives.

Run automated accessibility tests for key routes.

---

# 27. SEO

The guide is a major organic-search opportunity.

Interactive tools can be client-heavy, but public guide/district/place pages should be server-rendered or prerendered when practical.

If the existing starter is plain Vite SPA, migrate routing/rendering as needed without breaking the local-first app.

A good target architecture is React + TypeScript using a modern React Router framework/SSR approach on Cloudflare, or an equivalent setup that produces crawlable HTML for content pages.

SEO requirements:

- unique `<title>`,
- unique meta description,
- canonical URL,
- Open Graph tags,
- Twitter/social card tags,
- `hreflang` where appropriate,
- clean semantic H1/H2 structure,
- JSON-LD for relevant place/travel content where valid,
- breadcrumbs,
- sitemap index,
- robots.txt,
- image alt text,
- fast initial HTML,
- no content hidden only behind client JS when it is intended for search.

Do not keyword-stuff.

---

# 28. PERFORMANCE

Goals:

- lazy-load MapLibre and large map geometry,
- lazy-load world map,
- split games into separate chunks,
- compress GeoJSON or use TopoJSON/simplified shapes where appropriate,
- use responsive images,
- avoid shipping full guide content in initial bundle,
- virtualize long lists if needed,
- keep home route lightweight.

Aim for strong Lighthouse scores on non-map content routes.

Map pages are allowed a heavier chunk but should remain responsive on mid-range Android devices.

Do not render 500+ complex DOM nodes unnecessarily while a user drags/zooms the map.

---

# 29. PWA

Use a maintained Vite/React-compatible PWA solution or equivalent.

Manifest:

- app name,
- short name,
- theme colors,
- icons,
- standalone display,
- Bangla/English description.

Service worker:

- precache app shell,
- cache-first for versioned static assets,
- stale-while-revalidate for safe static content,
- network-first for dynamic API calls,
- no unauthorized bulk map tile caching.

Show an install CTA only after the user has meaningfully engaged; do not nag on first load.

---

# 30. SECURITY AND PRIVACY

Principles:

- local-first by default,
- collect only needed data,
- clear opt-in before public profile/share upload,
- no precise location without explicit permission,
- no secret API keys in the browser,
- server-side authorization on every private API route,
- Zod or equivalent request validation,
- strict file MIME/type/size checks,
- safe filename generation,
- sanitize user text where rendered,
- secure headers / CSP where compatible,
- protect sensitive forms from bots/rate abuse,
- log moderation/admin changes,
- provide delete/export account data flows if accounts are implemented.

Do not store raw IP addresses for leaderboard abuse controls. If an abuse fingerprint is used, use rotating keyed hashes and document retention.

Do not expose travel journal private entries through public APIs.

---

# 31. DATA MODEL — CLIENT

Suggested core types:

```ts
type TravelStatus =
  | 'unvisited'
  | 'want_to_go'
  | 'visited'
  | 'favorite'
  | 'lived_here';

type PassportEntry = {
  entityType: 'district' | 'upazila' | 'country';
  entityId: string;
  status: TravelStatus;
  visitedAt?: string;
  visitCount?: number;
  note?: string;
  updatedAt: string;
};

type TripDraft = {
  id: string;
  title: string;
  start: GeoPoint | DistrictRef;
  destinationDistrictIds: string[];
  placeIds: string[];
  startDate?: string;
  endDate?: string;
  days?: number;
  travelerCount: number;
  groupType: 'solo' | 'couple' | 'family' | 'friends';
  children: boolean;
  budgetBdt?: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  transportPreferences: string[];
  interests: string[];
  roundTrip: boolean;
  updatedAt: string;
};
```

Centralize schemas with Zod so storage/API validation can share definitions when possible.

---

# 32. PROJECT STACK

Use stable versions available at implementation time and lock them in the package manager lockfile.

Preferred stack:

```text
TypeScript
React
Vite
React Router
MapLibre GL JS
D3 Geo only where useful for static/export map rendering
TanStack Query for server state
Zustand or a small reducer/store for app UI state
Dexie (or equivalent) for IndexedDB
Zod for schemas/validation
React Hook Form for complex forms
Lucide React icons
html-to-image or equivalent for share-card exports
jsPDF for PDF where appropriate
vite-plugin-pwa or maintained equivalent
Vitest + Testing Library
Playwright for end-to-end smoke tests
Cloudflare Wrangler for Workers/D1/R2
```

Use CSS variables/tokens and either:

- a clean CSS module/component strategy, or
- Tailwind if it materially improves implementation speed.

Do not introduce a heavy component framework that makes the product look generic.

If using shadcn/Radix primitives, restyle them into our design system rather than leaving default aesthetics.

---

# 33. REPOSITORY STRUCTURE

Refactor toward something like:

```text
src/
  app/
  components/
    ui/
    navigation/
    maps/
    guide/
    planner/
    passport/
    games/
    sharing/
  config/
    brand.ts
    features.ts
    providers.ts
  data/
    districts/
    places/
    famous/
    quiz/
  db/
    local/
  hooks/
  i18n/
    bn.json
    en.json
  lib/
    geo/
    routing/
    weather/
    export/
    search/
    storage/
    validation/
  pages/ or routes/
  styles/
  types/

public/
  data/
    geo/
  icons/

worker/
  api/
  db/
  middleware/
  providers/

migrations/

tests/
  unit/
  e2e/
```

Adapt for the chosen router/framework rather than forcing this exact structure if the framework convention is better.

---

# 34. ENVIRONMENT CONFIGURATION

Create `.env.example` with documented variables.

Example:

```bash
# Public app
VITE_APP_NAME=ExploreBD
VITE_APP_URL=http://localhost:5173
VITE_DEFAULT_LOCALE=bn-BD

# Map style
VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty

# Routing — server-side key only
ROUTING_PROVIDER=openrouteservice
OPENROUTESERVICE_BASE_URL=https://api.heigit.org
OPENROUTESERVICE_API_KEY=

# Weather
WEATHER_PROVIDER=disabled
OPEN_METEO_BASE_URL=https://api.open-meteo.com
OPEN_METEO_API_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
D1_DATABASE_ID=
R2_BUCKET_NAME=

# Turnstile
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Application security
IP_HASH_SECRET=
SHARE_SIGNING_SECRET=
```

Do not create fake real secrets.

If variables are missing, fail gracefully and show development fallback behavior.

---

# 35. EXTERNAL API / RESOURCE RULES

## MapLibre

Docs:
`https://maplibre.org/maplibre-gl-js/docs/`

Use as the map rendering engine.

## OpenFreeMap

Quick start:
`https://openfreemap.org/quick_start/`

Terms:
`https://openfreemap.org/tos/`

Use only with attribution and a swappable provider configuration.

## geoBoundaries

API:
`https://www.geoboundaries.org/api.html`

Prefer `gbOpen` datasets for clear CC BY 4.0 reuse terms. Save the relevant geometry in our project/build pipeline rather than depending on a third-party API on every map view.

## Bangladesh administrative hierarchy

`https://github.com/open-admin-data/bangladesh-administrative-divisions`

Verify the current license and attribution file at integration time.

## openrouteservice / HeiGIT

Developer docs:
`https://openrouteservice.org/dev/`

Restrictions:
`https://openrouteservice.org/restrictions/`

Keep base URL configurable. Use the current HeiGIT endpoint rather than relying on the deprecated endpoint.

## Open-Meteo

Docs:
`https://open-meteo.com/en/docs`

Pricing/terms:
`https://open-meteo.com/en/pricing`
`https://open-meteo.com/en/terms`

Free endpoint is for non-commercial use under current terms. Use paid/self-hosted/alternative provider for commercial production as appropriate.

## Wikimedia Commons

Reuse guidance:
`https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia`

Every individual file can have its own license/attribution requirements. Store the attribution metadata.

## Cloudflare D1

Docs:
`https://developers.cloudflare.com/d1/`

## Cloudflare R2

Docs:
`https://developers.cloudflare.com/r2/`

## Cloudflare Turnstile

Docs:
`https://developers.cloudflare.com/turnstile/`

Server-side validation:
`https://developers.cloudflare.com/turnstile/get-started/server-side-validation/`

Always validate Turnstile tokens server-side.

## Public OpenStreetMap services

OSM tile policy:
`https://operations.osmfoundation.org/policies/tiles/`

Nominatim policy:
`https://operations.osmfoundation.org/policies/nominatim/`

Do not implement bulk tile download. Do not implement public Nominatim autocomplete.

---

# 36. ADMIN / CMS

Create a simple admin product only after the user-facing core is stable.

Admin capabilities:

- list/search/filter places,
- create/edit place,
- bilingual content fields,
- coordinates with map picker,
- categories/tags,
- estimated cost,
- duration,
- seasonal months,
- image attribution,
- source URLs,
- verified date,
- confidence,
- publish/unpublish,
- view user reports,
- mark report resolved,
- advisory editor,
- price history,
- audit trail.

No public admin registration.

Admin routes must be authorization-protected.

---

# 37. SHARE CARD ENGINE

Create reusable share-card templates instead of screenshotting random UI sections.

Data-driven renderer:

```ts
type ShareCardModel = {
  type: 'passport' | 'trip' | 'quiz' | 'puzzle' | 'milestone';
  locale: 'bn' | 'en';
  title: string;
  subtitle?: string;
  stats: Array<{ label: string; value: string }>;
  themeId: string;
  displayName?: string;
  avatarBlobUrl?: string;
  mapState?: PassportEntry[];
};
```

Use dedicated off-screen render surface with known dimensions so exports are predictable.

Ensure Bangla fonts are loaded before export.

---

# 38. ERROR / EMPTY / LOADING STATES

Every important async feature needs:

- skeleton/loading state,
- meaningful empty state,
- retry action,
- fallback if third-party API is unavailable.

Examples:

Routing API unavailable → show approximate route and label it `Approximate distance-based order`.

Weather unavailable → planner still works and weather block shows `Forecast unavailable`.

Map tiles unavailable → local Bangladesh polygons still function on a neutral background.

No guide result → suggest removing filters.

No passport data → invite the user to mark their first district.

---

# 39. ANALYTICS — PRIVACY-CONSCIOUS

Analytics must be optional and privacy-conscious.

Do not add invasive trackers by default.

If analytics are added later, prefer aggregated event tracking such as:

- map_started,
- first_district_marked,
- map_exported,
- place_saved,
- planner_completed,
- roulette_completed,
- quiz_completed.

Do not send raw journal content, uploaded photos, or precise location to analytics.

---

# 40. TESTING

## Unit tests

At least test:

- Bangla/English district search normalization,
- passport reducer/state transitions,
- progress calculations,
- Haversine distance,
- route heuristic,
- budget calculations,
- local storage migrations,
- itinerary date allocation,
- leaderboard validation helpers.

## Component tests

At least:

- district selector,
- status popover/sheet,
- map legend,
- trip planner inputs,
- locale switch,
- share export control.

## E2E smoke tests

At minimum:

1. open app,
2. mark Dhaka visited,
3. mark Cox's Bazar want-to-go,
4. reload and confirm state persists,
5. search a district in Bangla,
6. create a simple 2-destination trip,
7. switch language,
8. open guide page,
9. open quiz,
10. verify no mobile horizontal overflow at a narrow viewport.

When API credentials are unavailable, mock provider responses in test.

---

# 41. ACCEPTANCE CRITERIA

The application is not “done” until these are true.

## Core map

- All 64 districts are represented.
- Bilingual search works.
- Map click changes travel state.
- State persists after reload.
- Status legend works.
- Division progress works.
- Exports work.
- Mobile controls are usable.

## Guide

- District guide routes work.
- Place routes work.
- Search/filter works.
- Bilingual content structure exists.
- Credits/source/freshness fields exist.
- No copied third-party article text.

## Planner

- Works without paid API key using fallback routing.
- Uses real routing provider when configured.
- Budget estimate is transparent.
- PDF/print output works.
- Save draft works locally.

## Passport

- Multi-status data model works.
- Stats/badges render correctly.
- Guest mode works without login.

## Games

- Quiz is playable.
- Map puzzle is playable.
- Local result history works.
- Leaderboard gracefully disables if backend is unavailable.

## Quality

- TypeScript passes.
- Production build passes.
- Main automated tests pass.
- No exposed secrets.
- No dead primary-nav links.
- No console-breaking errors in normal flows.
- Responsive from 320px to large desktop.
- Keyboard navigation is reasonable.
- Data/image attribution pages exist.

---

# 42. IMPLEMENTATION PHASES

Follow this order. Do not try to build every advanced feature at once.

## Phase 0 — Audit and foundation

- inspect current starter,
- run it,
- document current behavior,
- set up router,
- design tokens,
- i18n,
- feature flags,
- local IndexedDB,
- error boundaries,
- test setup.

## Phase 1 — Best-in-class Bangladesh map/passport

- real licensed district geometry,
- 64 districts,
- multi-status,
- bilingual search,
- division progress,
- themes,
- local photo/name,
- export/share cards,
- responsive navigation,
- PWA shell.

This phase must feel production-quality before continuing.

## Phase 2 — Guide

- guide landing,
- district routes,
- place routes,
- filters,
- content schema,
- sample original content,
- source/credit/freshness system,
- search.

## Phase 3 — Planner

- full planner flow,
- Haversine route fallback,
- routing provider adapter,
- budget engine,
- itinerary,
- save/print/export,
- recommendation engine,
- Travel Roulette.

## Phase 4 — Games

- quiz,
- puzzle,
- local scores,
- server leaderboard.

## Phase 5 — Backend hardening

- D1 migrations,
- R2 share cards/media,
- rate limiting,
- Turnstile integration where needed,
- moderation/report flow.

## Phase 6 — Accounts and collaboration

- auth adapter,
- cloud sync,
- profile,
- collaborative trips,
- expense sharing,
- journal sync.

Keep behind feature flags until complete.

## Phase 7 — Advanced map/world/upazila

- world map,
- upazila mode,
- richer achievements,
- offline saved guide packs.

## Phase 8 — Production polish

- SEO,
- accessibility audit,
- performance audit,
- mobile testing,
- monitoring,
- deployment docs,
- data-license audit.

---

# 43. FEATURE FLAGS

Create a typed configuration such as:

```ts
export const features = {
  worldMap: true,
  upazilaMode: false,
  weather: false,
  accounts: false,
  cloudSync: false,
  publicProfiles: false,
  collaborativeTrips: false,
  expenseSplitter: true,
  travelJournal: true,
  leaderboard: true,
  adminCms: false,
} as const;
```

Do not show unfinished feature flags as broken menu items.

---

# 44. STARTER CODE CONTEXT

If this prompt is bundled with the starter, inspect these existing files first:

```text
starter/
  index.html
  vite.config.ts
  package.json
  tsconfig.json
  README.md
  REVERSE_ENGINEERING_NOTES.md
  src/
    App.tsx
    main.tsx
    styles.css
    data/districts.ts
    components/
      DistrictMap.tsx
      DistrictSelector.tsx
      Guide.tsx
      TravelCard.tsx
      TripPlanner.tsx
    lib/
      export.ts
      route.ts
      storage.ts
  public/data/README.txt
  cloudflare/
    worker.ts
    schema.sql
```

The starter currently contains:

- React + TypeScript + Vite,
- 64 district metadata entries,
- localStorage persistence,
- selectable district list,
- GeoJSON map adapter,
- PNG/JPG/PDF export,
- approximate route heuristic,
- basic Guide component/data model example,
- simple Cloudflare Worker D1 leaderboard,
- R2 scorecard endpoint shape.

Use it as scaffolding, not as a limitation.

Important known starter weaknesses to fix:

1. `localStorage` should become versioned IndexedDB for larger local-first state.
2. Map status is binary; upgrade to multi-status passport.
3. District centroids are approximate; replace with licensed/verified data.
4. No actual district GeoJSON is included; add licensed geometry.
5. The guide is only a basic demo; build proper routes/data model.
6. Planner uses nearest-neighbor centroid distance; add provider abstraction and 2-opt improvement.
7. Worker CORS is overly broad; restrict production origins.
8. Leaderboard trusts too much client data; harden validation.
9. No proper i18n/router/PWA/testing yet.
10. No SEO/prerender/SSR for guide content.

---

# 45. CODE QUALITY RULES

- TypeScript strict mode.
- Avoid `any` except unavoidable external boundaries and validate immediately.
- No giant 1,000-line React components.
- Keep pure calculations separate from components.
- Use semantic names.
- Avoid unnecessary abstractions, but create provider interfaces around external services.
- Do not place API keys in `VITE_*` vars unless they are intentionally public keys such as Turnstile site key.
- Use `AbortController` for cancellable requests.
- Add timeouts to external API calls.
- Cache safe provider results where reasonable.
- Use idempotency where a public mutation may be retried.
- Store times in UTC ISO format; format for user locale.
- Use stable entity IDs.

---

# 46. UI DETAIL CHECKLIST

## Buttons

Primary:

- solid forest green,
- white text,
- 44–48px height desktop/mobile,
- 12px radius,
- clear hover/focus/pressed.

Secondary:

- surface background,
- border,
- dark text.

Danger actions:

- not full red by default unless destructive.

## Inputs

- 46–50px min height,
- visible label above,
- placeholder is not the label,
- inline error below,
- strong focus ring.

## Cards

- border first, subtle shadow second,
- meaningful whitespace,
- no excessive glassmorphism.

## Toasts

Use for temporary confirmation such as:

- saved,
- copied,
- export ready.

Do not use toast for critical errors requiring user action; show inline alert.

## Dialogs

Use for deliberate actions only. Status editing on mobile should be a bottom sheet rather than a tiny modal.

---

# 47. MAP SHARE THEMES

Create five original share themes with centralized tokens.

## Forest

- warm off-white background
- forest green visited
- dark green title
- river-blue accent

## River

- pale blue background
- deep blue visited
- green secondary

## Sunset

- warm cream background
- coral visited
- gold highlights

## Midnight

- near-black green background
- mint visited
- light labels

## Paper

- subtle warm paper texture generated with CSS/SVG, not copyrighted texture image
- muted ink outlines
- classic editorial typography treatment

Ensure every theme remains readable in PNG/JPG output.

---

# 48. TRAVEL RECOMMENDATION SCORING

Implement a deterministic baseline scoring model.

Example components, normalize 0–1:

```text
seasonMatch        0.25
interestMatch      0.25
budgetMatch        0.15
travelTimeMatch    0.15
unvisitedBoost     0.10
weatherMatch       0.05 (only if available)
freshness/confidence 0.05
```

Make weights configurable.

Explain recommendations with deterministic reasons such as:

- “Good for November”
- “Matches your nature + photography interests”
- “Fits a 2-day trip from Dhaka”
- “You have not visited this district yet”

Do not pretend this is AI if it is rule-based.

---

# 49. DATA INGESTION / NORMALIZATION

Create scripts under `scripts/` for importing/normalizing open datasets.

Examples:

```text
scripts/import-admin-data.ts
scripts/import-geoboundaries.ts
scripts/validate-geo.ts
scripts/validate-content.ts
scripts/generate-search-index.ts
scripts/generate-sitemap.ts
```

Validation should catch:

- duplicate IDs,
- unknown district references,
- invalid coordinates,
- invalid month values,
- missing bilingual names,
- missing required image attribution,
- broken nearby-place references,
- invalid source URLs,
- malformed GeoJSON.

Do not fetch external boundary data on every production startup. Vendor/build a versioned copy with attribution and source metadata.

---

# 50. CONTENT SEED STRATEGY

Do not attempt to copy 200+ places from another travel site.

For the first build:

- include all 64 district names and hierarchy,
- seed approximately 10–20 well-known places with short, original, factual demo content,
- include image attribution only where a verified open-license image is actually added,
- build import templates for scaling to hundreds of places.

Provide:

```text
content/templates/places.csv
content/templates/places.example.json
content/CONTENT_GUIDE.md
```

The content guide should explain each field and how to verify costs/hours/sources.

---

# 51. DEPLOYMENT

Provide complete docs for local and production deployment.

Local:

```bash
npm install
npm run dev
npm run test
npm run build
```

Cloudflare:

- `wrangler` configuration,
- D1 creation/migrations,
- R2 bucket creation,
- secrets via `wrangler secret put`,
- Worker deploy command,
- frontend deploy command,
- environment separation for local/staging/production.

Do not include actual credentials in git.

Add `DEPLOYMENT.md`.

---

# 52. PRODUCTION OBSERVABILITY

Add lightweight error/logging hooks.

At minimum:

- structured server errors,
- request IDs,
- external provider timeout/error classification,
- no secrets in logs,
- no raw journal content in logs,
- health endpoint.

If a third-party error-monitoring product is not configured, keep a pluggable interface rather than blocking release.

---

# 53. FINAL DELIVERABLES FROM YOU, OPENCODE

Do not finish with only an explanation.

Produce/modify the actual repository and leave these deliverables:

1. working application source,
2. `README.md`,
3. `DEPLOYMENT.md`,
4. `ARCHITECTURE.md`,
5. `DATA_AND_LICENSES.md`,
6. `CONTENT_GUIDE.md`,
7. `.env.example`,
8. Cloudflare configuration/migrations,
9. automated tests,
10. `IMPLEMENTATION_STATUS.md`.

In `IMPLEMENTATION_STATUS.md`, include:

- completed features,
- feature-flagged features,
- external credentials still required,
- datasets used and licenses,
- known limitations,
- next recommended work.

At the very end of your work, run:

```bash
npm test
npm run build
```

If the project has separate worker checks, run those too.

Fix failures before declaring completion.

---

# 54. FIRST ACTIONS TO TAKE NOW

Start immediately with these actions:

1. Inspect the entire repository.
2. Run the current app and production build.
3. Read `README.md` and `REVERSE_ENGINEERING_NOTES.md` if present.
4. Create `IMPLEMENTATION_STATUS.md` and record the starting state.
5. Create the design tokens and app configuration.
6. Add proper routing and responsive navigation.
7. Replace simple binary visited state with the multi-status local-first Travel Passport model, including migration from the existing `visited: string[]` state.
8. Integrate a licensed Bangladesh district boundary dataset and normalize it to the existing 64 stable district IDs.
9. Make the district map fully functional and polished on desktop/mobile.
10. Build the export/share card engine.
11. Only then proceed through the implementation phases above.

Do not ask me to choose basic implementation details already specified in this prompt. Use your judgment, keep the app running at every step, and prioritize a polished core map/passport/planner experience over half-building every advanced feature.

**Build it.**
