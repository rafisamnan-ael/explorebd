# ExploreBD — Bangladesh Travel Platform

> Track where you have been, discover where to go next, plan the trip, remember it,
> and share your Bangladesh travel story. Bilingual (বাংলা / English), local-first,
> open-data powered.

ExploreBD is a Bangladesh-first travel progress, discovery and planning web app.
Mark the districts you have explored on a real interactive map, build a multi-status
travel passport, discover places with original guide content, plan realistic
day-by-day itineraries with a transparent budget, and play geography games.

This is a **clean-room implementation** built from the public product concept — it does
not reuse any private code, copy, branding or assets from any other travel site.

---

## Highlights

- **64-district interactive map** with real licensed boundaries (CC BY 4.0).
- **Multi-status travel passport** — `want to go`, `visited`, `favorite`, `lived here`,
  with visit dates, counts, notes, division progress, streaks and achievements.
- **Bilingual search** with Bangla/Latin normalisation (`cox`, `কক্স`, `moulvi`, `মৌলভী`).
- **Export & share cards** — PNG, JPG, PDF/print, social square and story, in five
  original map themes.
- **Guide** — district and place pages with quick facts, freshness/source metadata,
  filters and an original sample content set.
- **Trip planner** — wizard, Haversine fallback routing (+ optional openrouteservice),
  nearest-neighbour + 2-opt ordering, day-by-day itinerary and a transparent budget.
- **Recommendation engine & Travel Roulette** — deterministic scoring, no AI required.
- **Games** — bilingual quiz and map puzzle, local score history, optional server leaderboard.
- **World travel map** (~195 countries), travel journal, famous-for discovery.
- **Local-first** — IndexedDB (Dexie), guest mode with no account, versioned local schema
  and migration from the legacy binary `visited` list.
- **PWA** — installable with an offline app shell and no bulk map-tile caching.

## Tech stack

TypeScript · React 18 · Vite · React Router · MapLibre GL JS · Zustand · Dexie (IndexedDB)
· Zod · Lucide · html-to-image · jsPDF · Vitest + Testing Library · Playwright · Cloudflare
Workers/D1/R2.

## Quick start

```bash
npm install
cp .env.example .env     # optional — works with defaults
npm run dev              # http://localhost:5173
```

App defaults: locale `bn-BD`, map theme `Forest`, routing `haversine` (no API key required).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm test` | Run unit + component tests (Vitest) |
| `npm run test:e2e` | Run Playwright smoke tests (needs `npx playwright install`) |
| `npm run scripts:geo` | Re-import admin data + boundaries from open sources |
| `npm run scripts:sitemap` | Regenerate `public/sitemap.xml` |
| `npm run scripts:validate` | Validate GeoJSON + content integrity |
| `npm run worker:dev` | Run the Cloudflare Worker API locally |
| `npm run db:migrate:local` | Apply D1 migrations locally |

## Project structure

```
src/
  app/            app shell, providers, router, error boundary
  components/     ui/, navigation/, maps/, guide/, planner/, passport/, games/, sharing/
  config/         brand.ts, features.ts, providers.ts
  data/           districts, divisions, places, famous, quiz, seasons, countries
  db/local/       Dexie schema, migrations, export/clear
  hooks/          media query, passport selectors
  i18n/           bn.json, en.json, provider
  lib/            geo/, routing/, planner/, export/, search/, map/, images/, validation/, games/
  pages/          route components
  store/          zustand stores (settings, passport, ui)
  styles/         tokens.css, global.css, components.css, pages.css
  types/          shared domain types
worker/           Cloudflare Worker API
migrations/       D1 SQL migrations
public/data/geo/  licensed boundary GeoJSON
tests/            unit/, component/, e2e/
content/          content templates + guide
scripts/          data import, sitemap, validation
```

## Configuration & branding

- Brand name/locales: `src/config/brand.ts`
- Feature flags: `src/config/features.ts`
- Map/routing/weather providers: `src/config/providers.ts`
- Environment variables: `.env.example`

Missing API keys never break the app — routing falls back to Haversine, weather shows
"unavailable", the map falls back to a neutral background, and the leaderboard falls back
to local scores.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — structure, providers, data flow
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — local + Cloudflare deployment
- [`DATA_AND_LICENSES.md`](./DATA_AND_LICENSES.md) — datasets, licenses, attribution
- [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) — how to add and verify content
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — what is done, flagged, needed

## Privacy

Local-first by default. Guest passport, trips and journal stay in your browser's IndexedDB.
Accounts are optional and feature-flagged. Analytics are off by default and never include
journal content, photos or precise location. See `/privacy` in the app.

## License

Application code: see repository license. Bundled data keeps its own licenses — see
[`DATA_AND_LICENSES.md`](./DATA_AND_LICENSES.md).
