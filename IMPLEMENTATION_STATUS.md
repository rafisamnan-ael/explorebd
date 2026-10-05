# Implementation Status

_Last updated: 2026-10-05_

ExploreBD is a working, production-oriented build covering Phase 0–4 of the master prompt
with strong Phase 1/2/3 depth, plus the Phase 5/6/7 foundations. The core map, passport,
guide, planner, games and PWA are functional end to end. Details below.

## Verification snapshot

| Check | Status |
| --- | --- |
| `tsc --noEmit` | ✅ passing |
| `npm test` (Vitest) | ✅ 38 tests passing |
| `npm run build` | ✅ production build passing |
| `npm run scripts:validate` | ✅ GeoJSON + content valid |
| Browser smoke test (home, map) | ✅ no console errors; 64 labels, 64 list rows |
| Playwright e2e | ⚠️ provided; requires `npx playwright install` |

## Completed

### Foundation (Phase 0)
- Vite + React 18 + TypeScript (strict), React Router with lazy routes, error boundary.
- Semantic design tokens (`tokens.css`) with light/dark themes and travel-status colours.
- Bilingual i18n (`bn.json`/`en.json`) with number/currency/date formatting; Bangla-first.
- Typed feature flags and a central brand config. Custom provider config.
- Dexie IndexedDB schema with versioning, migration from legacy `visited: string[]`.
- Vitest + Testing Library + Playwright configured. Self-hosted Fontsource fonts.

### Core map & passport (Phase 1)
- Real 64-district ADM2 geometry (CC BY 4.0), enriched with canonical ids + Bangla names.
- MapLibre map with feature-state status colouring, hover, selected outline, optional
  schema-validated share/export surface.
- Multi-status passport: `want_to_go`, `visited`, `favorite`, `lived_here` (+ unvisited),
  visit date/count/note support.
- Bilingual district search, division progress cards, status filters, select all / clear all.
- Five original map themes, label on/off, EN/BN/both labels (HTML markers → Bangla-safe),
  background texture toggle, display name.
- Export & share card engine: PNG/JPG/PDF/print + social square + story, legend & date
  options, off-screen capture surface.
- Responsive navigation (desktop header + More menu, mobile header, bottom nav, sheets).

### Guide (Phase 2)
- Guide landing with search, division/district/category/month/budget/duration/family/visited
  filters and sorting.
- District guide pages and place detail pages with quick facts, sources and freshness badges.
- Original sample content (26 places across many districts) with cost estimates marked as
  estimates; “report outdated info” flow posts to the API (best-effort offline).
- “Famous for” page with type/district filters; seasonal picks pages.
- Credits page listing all data sources and licenses.

### Planner (Phase 3)
- 6-step wizard (start, destinations, dates/pace, people/interests, budget/transport, build).
- Routing provider interface + `HaversineFallbackProvider` + server `openrouteservice` proxy.
- Route ordering via brute force (≤7 points) or nearest-neighbour + 2-opt.
- Day-by-day itinerary scheduler and transparent budget engine with visible assumptions.
- Save drafts locally, print/PDF, copy summary, saved-trips list and trip detail rebuild.
- Deterministic recommendation engine and Travel Roulette with reasons and save-to-trip.

### Games (Phase 4)
- Bilingual quiz (Quick 10, daily challenge, category) with explanations and local scores.
- Map puzzle (click-the-district) with difficulty levels and a keyboard-accessible list mode.
- Leaderboard with graceful local fallback when the API is unavailable.

### Additional
- World map (~195 countries) with statuses, lazy-loaded geometry, continent filters.
- Travel journal with client-side image compression and IndexedDB photo blobs.
- Passport dashboard: stats, division progress, achievements/badges, next milestone.
- PWA manifest, service worker (app shell + GeoJSON stale-while-revalidate, no bulk tiles),
  offline banner, `robots.txt`, generated `sitemap.xml`, SPA `_redirects`.
- Cloudflare Worker API (health, config, leaderboard, place-reports, route proxy) with CORS
  restriction, rate limiting, optional Turnstile, plus D1 migrations for all planned tables.

## Feature-flagged (not shown as broken UI)

| Flag | State | Notes |
| --- | --- | --- |
| `worldMap` | on | implemented |
| `travelJournal` | on | implemented |
| `expenseSplitter` | on (UI partial) | expense model + D1 tables present; trip UI pending |
| `leaderboard` | on | server + local fallback |
| `upazilaMode` | off | data model + flag ready; boundary source not vendored |
| `weather` | off | provider adapter ready; disabled by default |
| `accounts`, `cloudSync`, `publicProfiles` | off | adapters/tables planned; guest-first |
| `collaborativeTrips` | off | D1 tables present; UI pending |
| `adminCms` | off | D1 tables present; UI pending |

## External credentials still required

| Capability | Variable(s) | Behaviour without it |
| --- | --- | --- |
| Real routing | `OPENROUTESERVICE_API_KEY`, `OPENROUTESERVICE_BASE_URL` | Haversine estimate (labelled approximate) |
| Weather | `OPEN_METEO_API_KEY`, `WEATHER_PROVIDER` | “Forecast unavailable” |
| Server leaderboard | D1 binding (`DB`) | local score history only |
| Bot protection | `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` | submissions accepted without captcha (dev) |
| Rate limiting | KV binding (`RATE_LIMIT`), `IP_HASH_SECRET` | no rate limit |
| Share-card/media storage | R2 binding (`SHARE_CARDS`) | exports generated client-side only |

All are optional: the app builds and runs fully without any of them.

## Datasets used and licenses

- **geoBoundaries gbOpen BGD ADM2** — district boundaries, **CC BY 4.0**.
- **open-admin-data/bangladesh-administrative-divisions** — names/coords (repo licence).
- **Natural Earth 1:110m Admin 0** — world countries, **public domain**.
- **OpenFreeMap / OpenStreetMap** — optional basemap (attribution shown).
- No third-party images bundled. Full detail in [`DATA_AND_LICENSES.md`](./DATA_AND_LICENSES.md).

## Known limitations

- Sample guide content is intentionally small (26 original places); all 64 districts have
  hierarchy but most lack place pages yet.
- World geometry is 1:110m, so a few small states are omitted; ~190 of ~195 countries match.
- The openrouteservice `/route` proxy returns total distance/duration (not per-leg geometry)
  when the external API is used; the fallback returns per-leg details.
- Expense splitter and collaboration are modelled in D1 but not yet surfaced in the trip UI.
- E2E tests need `npx playwright install` before they can run.
- Account/cloud sync, admin CMS and upazila mode are not implemented (flagged off).

## Next recommended work

1. Scale guide content via `content/templates/places.csv` and `scripts/validate-content.ts`.
2. Add an expense-splitter UI on the trip page and wire `trip_expenses`.
3. Turn on collaborative trips behind auth (auth adapter + `trip_members`/`trip_votes`).
4. Vendor upazila boundaries and enable `upazilaMode`.
5. Add Open-Meteo behind the Worker for weather-aware itineraries.
6. Build the admin CMS for places/reports/price history with audit logging.
7. Add SSR/prerender for guide pages for stronger SEO.
8. Run `npx playwright install` in CI and gate deploys on the e2e suite.
