# Bangladesh Travel App Starter

A clean-room starter for a Bangladesh travel-map product inspired by common travel-map patterns. It does **not** contain or copy private source code from any third-party site.

## Included

- 64-district searchable selector, bilingual names
- localStorage persistence
- theme + name customization
- clickable GeoJSON map adapter
- PNG / JPG / PDF export
- simple trip planner using district centroids + nearest-neighbor route heuristic
- guide/CMS data model example
- Cloudflare Worker + D1 leaderboard API example
- R2 scorecard-upload endpoint shape

## Run

```bash
npm install
npm run dev
```

## Add the real Bangladesh district map

1. Obtain a properly licensed 64-district GeoJSON.
2. Save it as `public/data/bangladesh-districts.geojson`.
3. Open `src/components/DistrictMap.tsx` and adjust the property mapping if your file uses a different field for district names/slugs.

Recommended source to evaluate: `ifahimreza/bangladesh-geojson` on GitHub. It documents Bangladesh divisions, districts, upazilas and boundary data with licensing notes. Preserve attribution required by the specific file you use.

## Architecture

### Browser-first data
Use localStorage or IndexedDB for:
- visited districts/countries
- user display name and local photo
- theme and map labels
- trip drafts
- quiz/puzzle local progress

This keeps the app fast, cheap and privacy-friendly.

### Static content / CMS
Create structured content for districts and places:

```ts
Place {
  id, districtId, slug, nameBn, nameEn,
  lat, lng,
  summary, details,
  bestMonths: number[], expectedHours,
  cost: { min, max, currency },
  transport[], hotels[], foods[], safetyNotes[],
  tags[], nearbyPlaceIds[],
  image: { url, author, license, sourceUrl }
}
```

For a larger product, use a headless CMS (Sanity/Strapi/Directus) or Postgres/Supabase for editorial workflows and search indexing.

### Server-only features
Use a small backend only for data that must be shared across users:
- leaderboard
- share links / public scorecard images
- optional accounts and cloud sync
- collaborative trips
- moderation and admin actions

Cloudflare Pages + Workers + D1 + R2 is a natural low-cost stack for this pattern.

## Better feature roadmap

1. PWA offline mode with cached maps and guides.
2. Optional account sync while keeping guest mode local-first.
3. AI itinerary generation from days, budget, interests, season and group type.
4. Real road-route optimization via OSRM / GraphHopper / Directions API instead of centroid distance.
5. Live weather, government travel advisories and closure notices.
6. Collaborative group-trip planning with voting on places.
7. Expense tracker and per-person split.
8. Travel journal with photos, check-ins and private/public visibility.
9. Badges and achievements for districts, divisions and categories.
10. Smart recommendations for unvisited nearby districts.
11. Upazila-level maps and progress.
12. Accessibility mode, dark mode and English/Bangla toggle.
13. Admin CMS for place data, images, seasonal pricing and verification dates.
14. Versioned cost data with “last verified” dates instead of static forever-prices.
15. Shareable public profile/map URL and social-card generator.

## Trip routing

The starter uses Haversine distance + nearest-neighbor ordering. That is fine for a quick approximation. For production itineraries, optimize on actual driving/travel time and optionally support bus/train/flight legs.

## Android app

For a simple wrapper, use Trusted Web Activity (preferred for a PWA) or a minimal WebView. For Play Store quality, PWA/TWA avoids maintaining two independent UIs. If you need native camera, notifications, offline downloads, location and deep links, use Capacitor or React Native instead of a bare WebView.

## Important production notes

- Validate and sanitize public leaderboard names.
- Rate-limit score submissions and use server-side score validation when possible.
- Do not trust a client-submitted score blindly.
- Keep photo processing local unless the user explicitly creates a public share link.
- If you store public share cards, set deletion/expiry jobs.
- Keep image attribution and licenses in the content model.
- Do not copy another site's text, photos, branding, or private/minified implementation; recreate behavior with your own design and licensed/open data.
