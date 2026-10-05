# Architecture

## Overview

ExploreBD is a local-first React SPA with an optional Cloudflare Worker API.

- **Guest-first**: the passport, trips, journal and preferences live in IndexedDB.
  Nothing leaves the device unless the user explicitly chooses a cloud action.
- **Provider adapters** wrap every external dependency (routing, weather, auth, storage)
  so the app keeps working when a key is missing and so vendors can be swapped.
- **Feature flags** (`src/config/features.ts`) hide unfinished or account-gated features
  instead of exposing broken controls.

## Front-end

```
Browser
  ├─ React Router (lazy routes)
  ├─ Zustand stores ── settings / passport / ui
  ├─ Dexie (IndexedDB) ── versioned local schema + migration
  ├─ MapLibre GL JS ── interactive maps (districts + world)
  └─ Provider adapters ── routing / weather / api
```

### Route map

Public: `/`, `/map`, `/world`, `/guide`, `/guide/:districtSlug`, `/place/:placeSlug`,
`/famous`, `/season/:monthSlug`, `/planner`, `/passport`, `/journal`, `/games`,
`/games/quiz`, `/games/map-puzzle`, `/leaderboard`, `/trips`, `/trip/:tripId`,
`/about`, `/credits`, `/privacy`, `/terms`, `/settings`.

Account, collaboration and admin routes are specified in the master prompt but remain
feature-flagged off until those phases are complete.

### State & storage

| Layer | Responsibility |
| --- | --- |
| `settingsStore` | locale, theme, map theme, labels, display name; persists to Dexie + applies to `<html>` |
| `passportStore` | district/country travel statuses, saved places; persists to Dexie |
| `uiStore` | toasts, command-search open state, online/offline |
| `db/local/db.ts` | Dexie schema v1, meta, legacy `visited` migration, export & clear |

Local schema (IndexedDB `explorebd`): `settings`, `passportDistricts`, `passportCountries`,
`tripDrafts`, `savedPlaces`, `journalEntries`, `photos`, `quizProgress`, `localScores`,
`offlineArticles`, `meta`. Migrations are versioned via Dexie’s `.version()`.

### Maps

- `BangladeshMap` renders an inline MapLibre style (neutral background) plus the ADM2
  district source. An optional OpenFreeMap basemap is fetched and applied via `setStyle`;
  if it fails, districts still render (offline-friendly). District labels are HTML markers
  so Bangla renders correctly without a glyph server.
- Status colouring uses MapLibre **feature-state** (`status`, `hover`) with a `match`
  expression, updated when the passport changes.
- `WorldMap` lazy-loads Natural Earth country geometry only on `/world`.

### Export & share

`ShareCard` is a pure data-driven renderer (social 1200×630, square 1080×1080,
story 1080×1920). `ExportMap` renders the district polygons as SVG with a self-contained
equirectangular projection (no canvas tainting, no runtime tile dependency). `html-to-image`
and `jsPDF` produce PNG/JPG/PDF; printing uses a generated image page.

### Routing engine

```
getRoutingProvider(prefs) → ServerRoutingProvider (openrouteservice via Worker) | HaversineFallbackProvider
matrix(points) → optimizeOrder (brute force ≤7 points, else nearest-neighbour + 2-opt) → route()
```

Budgets are computed in `lib/planner/budget.ts` with explicit, documented rates and a
contingency percentage. The itinerary scheduler allocates attractions across days by pace.

### Internationalisation

`src/i18n/{bn,en}.json` with a lightweight provider (`buildI18nValue`) exposing `t`,
`formatNumber`, `formatCurrency` (BDT/৳) and `formatDate`. Content records carry separate
Bangla and English fields.

## Back-end (Cloudflare Worker)

`worker/index.ts` exposes:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | health + request time |
| `/api/config/public` | GET | which providers are configured |
| `/api/leaderboard` | GET/POST | weekly scores; server-side validation + rate limit |
| `/api/place-reports` | POST | moderation queue for outdated-info reports |
| `/api/route`, `/api/route/matrix` | POST | openrouteservice proxy with Haversine fallback |
| `/api/weather` | GET | weather proxy (disabled unless configured) |

Security: restricted CORS, optional KV rate limiting with keyed IP hashes (never raw IPs),
optional Turnstile server-side verification, bounded input validation, secrets as Worker
secrets (never `VITE_*`).

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for provisioning and [`DATA_AND_LICENSES.md`](./DATA_AND_LICENSES.md)
for data provenance.

## Performance

- MapLibre and world geometry are lazy-loaded; route chunks are code-split.
- Games and export libraries (jsPDF, html-to-image) load on demand.
- District GeoJSON is vendored in `public/data/geo` and cached by the service worker
  (stale-while-revalidate). Basemap tiles are **not** bulk-cached.
