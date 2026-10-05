# Public-app reverse engineering notes

## Verified public behavior

Observed from the rendered public site and its published privacy policy:

- Bangladesh travel-progress map: 64 districts / 8 divisions.
- Search, select-all, clear-all and direct district-map interaction.
- Theme selection, optional name and photo.
- PNG, JPG and PDF export.
- World travel map: 195 countries / 6 continents.
- Bangladesh destination guide covering 64 districts and 240+ places.
- District guide pages and individual place detail pages.
- Guide fields include descriptions, best time, duration, approximate costs, transportation, stay, food, tips, nearby places and Google Maps links.
- “Famous for” content covering district foods/products.
- Trip planner: origin, selected districts, selected places, route ordering, days, budget, party size, return-to-start and print/PDF.
- Quiz, district map puzzle and leaderboard.
- No mandatory account/sign-up.
- District/country selections, name, photo, theme/labels and trip settings are kept in browser local storage.
- Local PNG/JPG/PDF generation is device-side.
- Leaderboard records are server-side only after explicit submission.
- Optional quiz scorecard share images are uploaded only when a share link is created and the published policy says they expire after 90 days.
- Cloudflare is identified by the site's privacy policy as the host/server platform.
- The Android app is described as opening the same website.

## Likely internal design (inference, not extracted source)

- SVG or GeoJSON district shapes keyed to district IDs/slugs.
- Browser state synchronizes the list, map and selected count.
- Canvas/DOM-to-image style export pipeline for PNG/JPG and a PDF library or print pipeline for PDF.
- Static structured district/place dataset, likely JSON/JS or generated pages.
- Route ordering can be implemented client-side with district centroids and Haversine distance; a road-routing service is not necessary for the behavior currently exposed.
- Leaderboards fit a Cloudflare Worker + D1/KV pattern, while share images fit R2/object storage.

## What cannot be recovered from a normal public crawl

- Original unminified/private repository source.
- Build-time environment variables or secrets.
- Private Cloudflare Worker code.
- Database schema if it is not exposed publicly.
- Admin tools, deployment credentials or internal editorial workflow.

A clean-room rebuild should reproduce product behavior without copying the site's proprietary branding, written guide copy or private implementation.
