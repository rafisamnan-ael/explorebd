/**
 * Generates public/sitemap.xml and public/robots.txt.
 * Run with: npm run scripts:sitemap
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const BASE = process.env.SITE_URL ?? 'https://explorebd.example';

async function main() {
  const { districts } = await import('../src/data/districts.ts');
  const { places } = await import('../src/data/places.ts');

  const staticRoutes = ['/', '/map', '/world', '/guide', '/famous', '/planner', '/passport', '/share', '/journal', '/games', '/games/quiz', '/games/map-puzzle', '/leaderboard', '/about', '/credits', '/privacy', '/terms', '/settings'];
  const monthRoutes = Array.from({ length: 12 }, (_, i) => `/season/${i + 1}`);

  const urls: Array<{ loc: string; priority: string; changefreq: string }> = [
    ...staticRoutes.map((r) => ({ loc: r, priority: r === '/' ? '1.0' : '0.8', changefreq: 'weekly' })),
    ...monthRoutes.map((r) => ({ loc: r, priority: '0.5', changefreq: 'monthly' })),
    ...districts.map((d) => ({ loc: `/guide/${d.slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...places.filter((p) => p.published).map((p) => ({ loc: `/place/${p.slug}`, priority: '0.6', changefreq: 'monthly' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url>\n    <loc>${BASE}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;

  writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote sitemap with ${urls.length} urls`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
