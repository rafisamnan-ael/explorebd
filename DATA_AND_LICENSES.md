# Data & Licenses

ExploreBD only bundles open-licensed data and requires attribution where the licence says so.
Every source is recorded here and on the in-app `/credits` page.

## Bangladesh administrative attributes

- **Source:** [open-admin-data/bangladesh-administrative-divisions](https://github.com/open-admin-data/bangladesh-administrative-divisions)
- **Used for:** 8 divisions, 64 districts, Bangla names, slugs, approximate coordinates.
- **License:** as declared in that repository (verify at integration time). No licence
  changes are made by ExploreBD.
- **Consumed by:** `scripts/import-admin-data.ts` → `src/data/districts.json`, `divisions.json`.

## Bangladesh district boundaries (ADM2)

- **Source:** geoBoundaries `gbOpen` Bangladesh ADM2 (simplified), commit `9469f09`.
- **Used for:** the interactive 64-district map and SVG export.
- **License:** **CC BY 4.0**.
- **Required attribution:** “Boundaries © geoBoundaries (geoboundaries.org), CC BY 4.0.
  Underlying: Bangladesh Bureau of Statistics (BBS) / OCHA ROAP.”
- **Consumed by:** `public/data/geo/bd-districts.geojson` (+ `.meta.json`).

## World country boundaries

- **Source:** Natural Earth 1:110m Admin 0 – Countries (public domain), via the
  `nvkelso/natural-earth-vector` repository.
- **Used for:** the `/world` travel map.
- **License:** Public domain.
- **Note:** small states can be omitted at the 1:110m scale.
- **Consumed by:** `public/data/geo/world-countries.geojson` (+ `.meta.json`).

## Basemap & fonts

- **OpenFreeMap** — optional vector basemap + glyph fonts. Commercial use allowed with
  attribution; no SLA. Configured via `VITE_MAP_STYLE_URL`; the map works without it.
- **OpenStreetMap contributors** — underlying data for basemap tiles (ODbL). Attribution is
  always shown on the map.
- **Not used:** `tile.openstreetmap.org` public tiles (bulk/offline use prohibited), and
  Nominatim public autocomplete.

## Routing & weather (server-side only)

- **openrouteservice / HeiGIT** — optional route/duration matrix, proxied through the Worker.
  Base URL configurable (`OPENROUTESERVICE_BASE_URL`). Check current restrictions/terms.
- **Open-Meteo** — optional weather; free endpoint is non-commercial under current terms.
  Disabled by default; enable only with an appropriate plan.

## Images

No third-party images are bundled. The sample `places` intentionally use empty `media`
arrays. If images are added they must be owned or open-licensed, and each entry must include
`author`, `sourceUrl`, `license` and `licenseUrl`; `scripts/validate-content.ts` enforces this.

## Reproducing the data import

```bash
npm run scripts:geo        # re-download attributes + ADM2 boundaries
npm run scripts:sitemap    # regenerate sitemap from current content
npm run scripts:validate   # verify coordinates, refs, months, attribution
```

Attribution text is also rendered in the map corner and the site footer, satisfying the
CC BY 4.0 requirement.
