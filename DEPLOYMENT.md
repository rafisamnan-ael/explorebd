# Deployment

ExploreBD is a static SPA (`dist/`) plus an optional Cloudflare Worker API (`worker/`).

## Local development

```bash
npm install
cp .env.example .env      # optional
npm run dev               # http://localhost:5173
npm test                  # unit + component tests
npm run build             # type-check + production build
npm run preview           # serve dist/ at http://localhost:4173
```

The app runs with **no credentials**: routing uses Haversine, weather is disabled, the
basemap is optional and the leaderboard falls back to local scores.

### Run the API locally

```bash
npx wrangler d1 create explorebd         # once; copy the id into wrangler.toml
npm run db:migrate:local
npm run worker:dev                       # http://localhost:8787
```

Set `VITE_API_BASE_URL=http://localhost:8787/api` in `.env` and point
`ALLOWED_ORIGINS` at your dev origin so CORS allows it.

## Production build

```bash
npm run build            # outputs dist/
npm run scripts:validate # optional pre-deploy data/content check
```

`dist/` contains the SPA, the two GeoJSON files under `data/geo/`, the service worker
(`sw.js`), manifest, sitemap, robots and `_redirects` (SPA fallback).

## Cloudflare Pages (front-end)

1. Connect the repository.
2. Build command: `npm run build`; output directory: `dist`.
3. Add environment variables from `.env.example` (only `VITE_*` values are public).
4. `public/_redirects` already provides the SPA fallback.

## Cloudflare Workers (API)

1. Create resources:

   ```bash
   npx wrangler d1 create explorebd
   npx wrangler r2 bucket create explorebd-share-cards        # optional
   npx wrangler kv namespace create RATE_LIMIT                # optional, for rate limits
   ```

2. Update `wrangler.toml` with the returned `database_id` and, if used, uncomment the R2/KV
   bindings and paste their ids.

3. Apply migrations:

   ```bash
   npm run db:migrate:remote
   ```

4. Set secrets (never commit these):

   ```bash
   npx wrangler secret put OPENROUTESERVICE_API_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put IP_HASH_SECRET
   npx wrangler secret put SHARE_SIGNING_SECRET
   ```

5. Set non-secret vars in `wrangler.toml` `[vars]` (e.g. `ALLOWED_ORIGINS`, `ENVIRONMENT`).

6. Deploy:

   ```bash
   npm run worker:deploy
   ```

### Environment separation

Use separate D1 databases / KV namespaces / R2 buckets per environment (dev, staging,
production) and set `ENVIRONMENT` accordingly. Enable Turnstile in production by setting
`VITE_TURNSTILE_SITE_KEY` (public) and `TURNSTILE_SECRET_KEY` (secret).

## Post-deploy checklist

- [ ] `/api/health` returns `{ ok: true }`.
- [ ] `ALLOWED_ORIGINS` matches the deployed front-end origin (CORS).
- [ ] `robots.txt` / `sitemap.xml` resolve and `SITE_URL` was set before generating the sitemap.
- [ ] No secrets in the client bundle (`grep` the build for key names).
- [ ] Turnstile validated server-side where public submissions are enabled.
- [ ] D1 migrations applied for every environment.

## Rollback

Static hosting: redeploy the previous `dist/`. Worker: `wrangler rollback` or redeploy a
previous version. D1 migrations are additive (`CREATE TABLE IF NOT EXISTS`), so rolling
back the Worker is safe for the current schema.
