/**
 * Imports Bangladesh administrative data from open licensed sources and writes:
 *  - src/data/districts.json   (64 districts, bilingual, with division + centroid)
 *  - src/data/divisions.json   (8 divisions, bilingual)
 *  - public/data/geo/bd-districts.geojson  (64 ADM2 polygons)
 *  - public/data/geo/bd-districts.meta.json (attribution + provenance)
 *
 * Sources (see DATA_AND_LICENSES.md):
 *  - Attributes: open-admin-data/bangladesh-administrative-divisions (CC-see repo)
 *  - Boundaries: geoBoundaries gbOpen BGD ADM2 (CC BY 4.0)
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const ADMIN_BASE = 'https://raw.githubusercontent.com/open-admin-data/bangladesh-administrative-divisions/main/data';
const GEO_URL =
  'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/BGD/ADM2/geoBoundaries-BGD-ADM2_simplified.geojson';

interface AdminNode {
  id: string;
  name: { en: string; local: string; slug: string };
  parent: { id: string; name: { en: string; local: string; slug: string } } | null;
  geo: { lat: string; lon: string };
}

interface GeoFeature {
  type: 'Feature';
  properties: { shapeName: string; shapeID: string; shapeGroup: string; shapeType: string };
  geometry: unknown;
}

/** geoBoundaries uses legacy district names; map them to canonical modern names. */
const GEO_ALIASES: Record<string, string> = {
  Barisal: 'Barishal',
  Bogra: 'Bogura',
  Brahamanbaria: 'Brahmanbaria',
  Chittagong: 'Chattogram',
  Comilla: 'Cumilla',
  Jessore: 'Jashore',
  Maulvibazar: 'Moulvibazar',
  Nawabganj: 'Chapainababganj',
};

const EXTRA_ALIASES: Record<string, string[]> = {
  Barishal: ['Barisal'],
  Bogura: ['Bogra'],
  Brahmanbaria: ['Brahamanbaria', 'B.Baria'],
  Chattogram: ['Chittagong'],
  Cumilla: ['Comilla'],
  Jashore: ['Jessore'],
  Moulvibazar: ['Maulvibazar', 'Moulavibazar'],
  Chapainababganj: ['Nawabganj', 'Chapainawabganj'],
  Netrakona: ['Netrokona'],
  CoxsBazar: ["Cox's Bazar", 'Coxs Bazar'],
  Jhalokati: ['Jhalokathi'],
  Khagrachhari: ['Khagrachari'],
  Rangamati: ['Rangamati'],
  Munshiganj: ['Munshigonj'],
  Narayanganj: ['Narayangonj'],
  Narsingdi: ['Narsingdi'],
  Panchagarh: ['Panchagar'],
  Thakurgaon: ['Thakurgaon'],
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': 'ExploreBD-data-import' } });
  if (!res.ok) throw new Error(`Failed ${res.status} for ${url}`);
  return (await res.json()) as T;
}

async function main() {
  console.log('Fetching open-admin-data district & division metadata…');
  const [adminDistricts, adminDivisions, geo] = await Promise.all([
    fetchJson<AdminNode[]>(`${ADMIN_BASE}/all-district.json`),
    fetchJson<AdminNode[]>(`${ADMIN_BASE}/all-division.json`),
    fetchJson<{ features: GeoFeature[] }>(GEO_URL),
  ]);

  const geoByName = new Map<string, string>();
  for (const f of geo.features) geoByName.set(f.properties.shapeName, f.properties.shapeID);

  const divisions = adminDivisions.map((d) => ({
    id: `bd-div-${slugify(d.name.en)}`,
    code: d.id,
    nameEn: d.name.en,
    nameBn: d.name.local,
    slug: slugify(d.name.en),
    lat: Number(d.geo.lat),
    lng: Number(d.geo.lon),
  }));
  const divisionByCode = new Map(divisions.map((d) => [d.code, d]));

  const districts = adminDistricts.map((d) => {
    const nameEn = d.name.en;
    const geoKey = Object.entries(GEO_ALIASES).find(([, modern]) => modern === nameEn)?.[0] ?? nameEn;
    const aliases = new Set<string>([
      nameEn,
      geoKey,
      ...(EXTRA_ALIASES[nameEn.replace(/\s|'/g, '')] ?? []),
      ...(EXTRA_ALIASES[nameEn] ?? []),
    ]);
    const parent = d.parent ? divisionByCode.get(d.parent.id) : undefined;
    return {
      id: `bd-${slugify(nameEn)}`,
      code: d.id,
      slug: slugify(nameEn),
      nameEn,
      nameBn: d.name.local,
      divisionId: parent?.id ?? '',
      divisionNameEn: parent?.nameEn ?? '',
      divisionNameBn: parent?.nameBn ?? '',
      lat: Number(d.geo.lat),
      lng: Number(d.geo.lon),
      geoShapeName: geoKey,
      aliases: [...aliases],
    };
  });

  const missingGeo = districts.filter((d) => !geoByName.has(d.geoShapeName));
  if (missingGeo.length) {
    console.warn('Districts without matching geometry:', missingGeo.map((d) => d.nameEn));
  }

  const outDir = resolve(root, 'src/data');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'districts.json'), JSON.stringify(districts, null, 2) + '\n', 'utf8');
  writeFileSync(resolve(outDir, 'divisions.json'), JSON.stringify(divisions, null, 2) + '\n', 'utf8');

  const geoDir = resolve(root, 'public/data/geo');
  mkdirSync(geoDir, { recursive: true });
  writeFileSync(resolve(geoDir, 'bd-districts.geojson'), JSON.stringify(geo), 'utf8');
  writeFileSync(
    resolve(geoDir, 'bd-districts.meta.json'),
    JSON.stringify(
      {
        source: 'geoBoundaries gbOpen Bangladesh ADM2',
        sourceUrl: GEO_URL,
        sourceLicense: 'CC BY 4.0',
        sourceAttribution:
          'Boundaries © geoBoundaries (geoboundaries.org), CC BY 4.0. Underlying: Bangladesh Bureau of Statistics (BBS) / OCHA ROAP.',
        attributeSource: 'open-admin-data/bangladesh-administrative-divisions',
        featureCount: geo.features.length,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(`Wrote ${districts.length} districts, ${divisions.length} divisions, ${geo.features.length} features.`);
  if (!existsSync(resolve(geoDir, 'bd-districts.geojson'))) throw new Error('GeoJSON write failed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
