/* Cloudflare Worker API for ExploreBD. Bundled by Wrangler (esbuild). */

interface Env {
  DB: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        all: <T = unknown>() => Promise<{ results: T[] }>;
        first: <T = unknown>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
      all: <T = unknown>() => Promise<{ results: T[] }>;
    };
  };
  RATE_LIMIT?: { get: (key: string) => Promise<string | null>; put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void> };
  SHARE_CARDS?: { put: (key: string, value: ArrayBuffer, opts?: unknown) => Promise<unknown>; get: (key: string) => Promise<{ body: ReadableStream } | null> };
  OPENROUTESERVICE_BASE_URL?: string;
  OPENROUTESERVICE_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  IP_HASH_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
}

const GAME_TYPES = ['quiz', 'puzzle'];
const REPORT_TYPES = ['price', 'hours', 'closed', 'wrong', 'other'];

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  const allowOrigin = origin && (allowed.includes(origin) || allowed.includes('*')) ? origin : allowed[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function hashIp(ip: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

async function rateLimited(env: Env, key: string, limit = 20, windowSec = 60): Promise<boolean> {
  if (!env.RATE_LIMIT) return false;
  const bucketKey = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
  const current = Number((await env.RATE_LIMIT.get(bucketKey)) ?? '0');
  if (current >= limit) return true;
  await env.RATE_LIMIT.put(bucketKey, String(current + 1), { expirationTtl: windowSec * 2 });
  return false;
}

async function verifyTurnstile(env: Env, token: string | undefined, ip: string | null): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true; // not configured → allow in dev
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371.0088;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function haversineRoute(points: Array<{ lat: number; lng: number }>) {
  const legs = [];
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i]!;
    const to = points[i + 1]!;
    const km = haversineKm([from.lng, from.lat], [to.lng, to.lat]) * 1.28;
    const minutes = Math.round(12 + (km / 45) * 60);
    totalDistanceKm += km;
    totalDurationMinutes += minutes;
    legs.push({ from, to, distanceKm: km, durationMinutes: minutes });
  }
  return { points, legs, totalDistanceKm, totalDurationMinutes, approximate: true, provider: 'haversine' };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(env, origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const path = url.pathname.replace(/\/$/, '') || '/';
    const ip = request.headers.get('CF-Connecting-IP');

    try {
      if (path === '/api/health' && request.method === 'GET') {
        return json({ ok: true, time: new Date().toISOString(), env: env.ENVIRONMENT ?? 'unknown' }, 200, headers);
      }

      if (path === '/api/config/public' && request.method === 'GET') {
        return json(
          {
            routingProvider: env.OPENROUTESERVICE_API_KEY ? 'openrouteservice' : 'haversine',
            weatherProvider: env.OPEN_METEO_API_KEY ? 'open-meteo' : 'disabled',
          },
          200,
          headers,
        );
      }

      if (path === '/api/leaderboard' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          "SELECT name, score, game, created_at FROM leaderboard_entries WHERE created_at > datetime('now', '-7 days') ORDER BY score DESC, created_at ASC LIMIT 50",
        ).all<{ name: string; score: number; game: string; created_at: string }>();
        const entries = results.map((row, index) => ({ rank: index + 1, name: row.name, score: row.score, game: row.game, createdAt: row.created_at }));
        return json({ entries }, 200, headers);
      }

      if (path === '/api/leaderboard' && request.method === 'POST') {
        if (ip && env.IP_HASH_SECRET && (await rateLimited(env, await hashIp(ip, env.IP_HASH_SECRET)))) {
          return json({ error: 'rate_limited' }, 429, headers);
        }
        const body = (await request.json()) as Record<string, unknown>;
        const game = String(body.game ?? '');
        const name = String(body.name ?? '').trim().slice(0, 24);
        const score = Number(body.score ?? -1);
        const total = body.total === undefined ? null : Number(body.total);
        const timeMs = body.timeMs === undefined ? null : Number(body.timeMs);
        const difficulty = body.difficulty ? String(body.difficulty).slice(0, 16) : null;

        if (!GAME_TYPES.includes(game) || name.length < 1 || !Number.isInteger(score) || score < 0 || score > 1000) {
          return json({ error: 'invalid_submission' }, 400, headers);
        }
        if (game === 'puzzle' && timeMs !== null && timeMs < 1500) {
          return json({ error: 'implausible_time' }, 400, headers);
        }
        if (!(await verifyTurnstile(env, body.turnstileToken as string | undefined, ip))) {
          return json({ error: 'captcha_failed' }, 403, headers);
        }

        await env.DB.prepare(
          'INSERT INTO leaderboard_entries (game, name, score, total, time_ms, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(game, name, score, total, timeMs, difficulty, new Date().toISOString())
          .run();
        return json({ ok: true }, 201, headers);
      }

      if (path === '/api/place-reports' && request.method === 'POST') {
        const body = (await request.json()) as Record<string, unknown>;
        const placeId = String(body.placeId ?? '').slice(0, 120);
        const type = String(body.type ?? '');
        const details = String(body.details ?? '').slice(0, 1000);
        if (!placeId || !REPORT_TYPES.includes(type) || details.length < 3) {
          return json({ error: 'invalid_report' }, 400, headers);
        }
        if (!(await verifyTurnstile(env, body.turnstileToken as string | undefined, ip))) {
          return json({ error: 'captcha_failed' }, 403, headers);
        }
        await env.DB.prepare(
          'INSERT INTO place_reports (place_id, type, details, status, created_at) VALUES (?, ?, ?, ?, ?)',
        )
          .bind(placeId, type, details, 'open', new Date().toISOString())
          .run();
        return json({ ok: true }, 201, headers);
      }

      if ((path === '/api/route' || path === '/api/route/matrix') && request.method === 'POST') {
        const body = (await request.json()) as { points?: Array<{ lat: number; lng: number }> };
        const points = Array.isArray(body.points) ? body.points : [];
        if (points.length < 2) return json({ error: 'need_at_least_two_points' }, 400, headers);

        if (path === '/api/route/matrix') {
          const durations: number[][] = [];
          const distances: number[][] = [];
          for (let i = 0; i < points.length; i += 1) {
            durations[i] = [];
            distances[i] = [];
            for (let j = 0; j < points.length; j += 1) {
              if (i === j) {
                durations[i]![j] = 0;
                distances[i]![j] = 0;
              } else {
                const km = haversineKm([points[i]!.lng, points[i]!.lat], [points[j]!.lng, points[j]!.lat]) * 1.28;
                distances[i]![j] = km;
                durations[i]![j] = Math.round(12 + (km / 45) * 60);
              }
            }
          }
          return json({ durations, distances, approximate: true, provider: 'haversine' }, 200, headers);
        }

        if (env.OPENROUTESERVICE_API_KEY && env.OPENROUTESERVICE_BASE_URL) {
          try {
            const res = await fetch(`${env.OPENROUTESERVICE_BASE_URL}/v2/directions/driving-car/geojson`, {
              method: 'POST',
              headers: { Authorization: env.OPENROUTESERVICE_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ coordinates: points.map((p) => [p.lng, p.lat]) }),
            });
            if (res.ok) {
              const data = (await res.json()) as { features?: Array<{ properties?: { summary?: { distance: number; duration: number } } }> };
              const summary = data.features?.[0]?.properties?.summary;
              if (summary) {
                return json(
                  {
                    points,
                    legs: [],
                    totalDistanceKm: summary.distance / 1000,
                    totalDurationMinutes: summary.duration / 60,
                    approximate: false,
                    provider: 'openrouteservice',
                  },
                  200,
                  headers,
                );
              }
            }
          } catch {
            /* fall through to haversine */
          }
        }
        return json(haversineRoute(points), 200, headers);
      }

      if (path === '/api/weather' && request.method === 'GET') {
        if (!env.OPEN_METEO_API_KEY && env.WEATHER_PROVIDER_DISABLED !== 'false') {
          return json({ available: false }, 200, headers);
        }
        return json({ available: false, reason: 'provider_not_configured' }, 200, headers);
      }

      return json({ error: 'not_found' }, 404, headers);
    } catch (error) {
      if (env.ENVIRONMENT !== 'production') {
        return json({ error: 'internal_error', message: String(error) }, 500, headers);
      }
      return json({ error: 'internal_error' }, 500, headers);
    }
  },
};
