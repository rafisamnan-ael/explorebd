# Content Guide

This guide explains how to add and verify ExploreBD content. Everything is original:
**never copy text, images or datasets from another travel site.**

## Where content lives

| Content | File |
| --- | --- |
| Districts & divisions | `src/data/districts.json`, `src/data/divisions.json` (generated) |
| Places | `src/data/places.ts` |
| “Famous for” entries | `src/data/famous.ts` |
| Quiz questions | `src/data/quiz.ts` |
| Seasonal picks | `src/data/seasons.ts` |
| Countries (world map) | `src/data/countries.ts` |
| Templates | `content/templates/places.csv`, `content/templates/places.example.json` |

## Place fields

See `src/types/index.ts` (`Place`) and `content/templates/places.example.json`.

Key rules:

- **Bilingual**: every place needs `nameEn`/`nameBn` and short descriptions in both languages.
- **Coordinates**: `lat`/`lng`, validated in range by `scripts/validate-content.ts`.
- **Categories/interests**: reuse the vocabularies in `PlaceCategory` and `src/data/seasons.ts`.
- **Best months**: integers 1–12.
- **Cost**: use `cost.minBdt`/`maxBdt` + `basis` (`person` | `group` | `entry` | `day`).
  When unknown, omit — the UI shows “Unknown” rather than fabricating a price.
- **Opening hours**: only include when actually verified; otherwise omit.
- **Media**: each image must carry `author`, `sourceUrl`, `license`, `licenseUrl`. Prefer owned
  or clearly licensed media. The validator rejects media missing attribution.
- **Freshness**: set `verifiedAt` (ISO date), `confidence` (`high`|`medium`|`low`) and `sourceName`.
  These drive the “Verified N days ago / may have changed” badges.
- **Published flag**: keep `published: false` while drafting.

## Verification workflow

1. Pick a place and confirm the facts from at least one reliable source (official site,
   government/university source, reputable reference — not another travel blog).
2. Write original descriptions in both Bangla and English.
3. Record `sourceName`, `sourceUrl`, `verifiedAt` and `confidence`.
4. For prices/hours, prefer a range and mark `confidence: 'low'` if you could not confirm.
5. Run the validator:

   ```bash
   npm run scripts:validate-content
   ```

6. Open the place page locally to confirm layout and freshness display.

## Scaling with the CSV template

`content/templates/places.csv` shows the column layout for bulk import. Convert CSV rows to
`Place` objects (splitting `|`-delimited multi-values) before adding to `places.ts`. A future
`scripts/import-places.ts` can automate this; keep the validator in the loop.

## Editorial principles

- Estimates are labelled estimates; never present them as guaranteed prices.
- Do not invent accessibility or safety information — omit or state it is not yet verified.
- Avoid politically contentious or unverifiable trivia in quizzes.
- Keep Bangla first-class: write natural Bangla, not machine-translated UI text.
