export interface Env {
  DB: D1Database;
  SCORECARDS: R2Bucket;
  IP_HASH_SECRET: string;
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });

async function hashIp(ip: string, secret: string) {
  const bytes = new TextEncoder().encode(`${new Date().toISOString().slice(0,10)}:${secret}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).slice(0,12).map(b => b.toString(16).padStart(2,'0')).join('');
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' } });

    if (url.pathname === '/api/leaderboard' && req.method === 'GET') {
      const game = url.searchParams.get('game') || 'quiz';
      const week = url.searchParams.get('week') || new Date().toISOString().slice(0,10);
      const rows = await env.DB.prepare('SELECT player_name,score,duration_ms,mistakes,created_at FROM leaderboard WHERE game=? AND week_key=? ORDER BY score DESC, duration_ms ASC LIMIT 100').bind(game, week).all();
      return json(rows.results);
    }

    if (url.pathname === '/api/leaderboard' && req.method === 'POST') {
      const body: any = await req.json();
      if (!body.deviceId || !body.name || !body.game) return json({ error: 'missing fields' }, 400);
      const ip = req.headers.get('cf-connecting-ip') || '';
      const ipHash = await hashIp(ip, env.IP_HASH_SECRET);
      const weekKey = body.weekKey || new Date().toISOString().slice(0,10);
      await env.DB.prepare(`INSERT INTO leaderboard(game,player_name,score,duration_ms,mistakes,device_id,ip_hash,week_key)
        VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(game,device_id,week_key) DO UPDATE SET
        player_name=excluded.player_name,
        score=MAX(leaderboard.score, excluded.score),
        duration_ms=CASE WHEN excluded.score >= leaderboard.score THEN MIN(leaderboard.duration_ms, excluded.duration_ms) ELSE leaderboard.duration_ms END,
        mistakes=CASE WHEN excluded.score >= leaderboard.score THEN MIN(leaderboard.mistakes, excluded.mistakes) ELSE leaderboard.mistakes END`).bind(body.game, body.name.slice(0,40), body.score ?? 0, body.durationMs ?? 0, body.mistakes ?? 0, body.deviceId, ipHash, weekKey).run();
      return json({ ok: true });
    }

    if (url.pathname === '/api/scorecards' && req.method === 'POST') {
      const id = crypto.randomUUID();
      const blob = await req.blob();
      if (blob.size > 4_000_000) return json({ error: 'image too large' }, 413);
      await env.SCORECARDS.put(`${id}.png`, blob, { httpMetadata: { contentType: 'image/png', cacheControl: 'public, max-age=86400' }, customMetadata: { expiresAt: String(Date.now() + 90*86400_000) } });
      return json({ id, url: `${url.origin}/share/${id}` });
    }

    return json({ error: 'not found' }, 404);
  }
};
