/**
 * Fetches openly-licensed Bangladesh landscape photos from Wikimedia Commons,
 * resizes them for web, and writes a manifest with attribution.
 *
 * Run: npm run scripts:hero-images
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/images/hero');
const UA = 'ExploreBD-HeroFetcher/1.0 (https://explorebd-three.vercel.app)';

interface Query {
  slug: string;
  search: string;
}

const queries: Query[] = [
  { slug: 'ratargul', search: 'Ratargul Swamp Forest' },
  { slug: 'sreemangal-tea', search: 'Sreemangal tea garden' },
  { slug: 'coxs-bazar', search: "Cox's Bazar beach" },
  { slug: 'sundarbans', search: 'Sundarbans mangrove' },
  { slug: 'sajek', search: 'Sajek valley Rangamati' },
  { slug: 'haor', search: 'Tanguar Haor Sunamganj' },
  { slug: 'padma-river', search: 'Padma river Bangladesh' },
  { slug: 'lalbagh-fort', search: 'Lalbagh Fort Dhaka' },
  { slug: 'kaptai-lake', search: 'Kaptai Lake' },
  { slug: 'jaflong', search: 'Jaflong Sylhet' },
];

interface ManifestEntry {
  slug: string;
  src: string;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  width: number;
}

const ACCEPTED = ['cc0', 'public domain', 'cc by', 'cc-by', 'cc by-sa', 'cc-by-sa', 'attribution'];
const REJECTED = ['nc', 'noncommercial', 'non-commercial', 'fair use', 'copyright'];

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function licenseOk(name: string): boolean {
  const n = name.toLowerCase();
  if (REJECTED.some((r) => n.includes(r))) return false;
  return ACCEPTED.some((a) => n.includes(a));
}

async function fetchQuery(query: Query, existing: Set<string>): Promise<ManifestEntry | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search` +
    `&gsrsearch=${encodeURIComponent('filetype:bitmap ' + query.search)}&gsrnamespace=6&gsrlimit=10` +
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1600`;

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`search failed ${res.status} for ${query.search}`);
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { title: string; imageinfo?: Array<Record<string, unknown>> }> };
  };
  const pages = Object.values(data.query?.pages ?? {});

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = String(info.mime ?? '');
    if (!mime.includes('jpeg') && !mime.includes('png')) continue;
    const width = Number(info.width ?? 0);
    const height = Number(info.height ?? 0);
    if (width < 1400 || width < height) continue; // prefer landscape

    const meta = (info.extmetadata ?? {}) as Record<string, { value: string }>;
    const license = stripHtml(meta.LicenseShortName?.value ?? '');
    if (!licenseOk(license)) continue;

    const sourceUrl = String(info.descriptionurl ?? page.title);
    if (existing.has(sourceUrl)) continue;

    const thumb = String(info.thumburl ?? info.url ?? '');
    if (!thumb) continue;

    const imgRes = await fetch(thumb, { headers: { 'User-Agent': UA } });
    if (!imgRes.ok) continue;
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const outFile = resolve(outDir, `${query.slug}.jpg`);
    await sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toFile(outFile);

    const author = stripHtml(meta.Artist?.value ?? 'Wikimedia Commons contributor');
    const licenseUrl = stripHtml(meta.LicenseUrl?.value ?? '') || undefined;
    const description = stripHtml(meta.ImageDescription?.value ?? page.title);

    return {
      slug: query.slug,
      src: `/images/hero/${query.slug}.jpg`,
      title: description.slice(0, 120) || query.search,
      author: author.slice(0, 120),
      license,
      licenseUrl,
      sourceUrl,
      width: 1600,
    };
  }
  return null;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const manifest: ManifestEntry[] = [];
  const usedSources = new Set<string>();

  for (const query of queries) {
    try {
      const entry = await fetchQuery(query, usedSources);
      if (entry) {
        manifest.push(entry);
        usedSources.add(entry.sourceUrl);
        // eslint-disable-next-line no-console
        console.log(`OK  ${query.slug}  ${entry.license}  ${entry.author.slice(0, 40)}`);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`SKIP ${query.slug} (no permissive landscape image found)`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`FAIL ${query.slug}: ${String(error)}`);
    }
  }

  writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  // eslint-disable-next-line no-console
  console.log(`\nWrote ${manifest.length} hero images to public/images/hero`);
  if (!existsSync(resolve(outDir, 'manifest.json'))) throw new Error('manifest write failed');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
