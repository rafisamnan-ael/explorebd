# Content Guide

See the full guide at [`../CONTENT_GUIDE.md`](../CONTENT_GUIDE.md).

Templates included here:

- `templates/places.csv` — spreadsheet columns for bulk place entry.
- `templates/places.example.json` — a single fully-populated example place.

Workflow:

1. Write original bilingual descriptions.
2. Record source + `verifiedAt` + `confidence` for freshness.
3. Add image attribution (`author`, `sourceUrl`, `license`, `licenseUrl`) for any media.
4. Validate with `npm run scripts:validate-content`.
