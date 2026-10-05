import type { FeatureCollection, Feature } from 'geojson';
import { districts } from '@/data/districts';
import { countries } from '@/data/countries';

const byGeoName = new Map(districts.map((d) => [d.geoShapeName.toLowerCase(), d]));

export interface DistrictFeatureProps {
  shapeID: string;
  shapeName: string;
  districtId: string;
  nameEn: string;
  nameBn: string;
}

/**
 * Enriches the raw ADM2 GeoJSON with canonical district ids and bilingual
 * names, and promotes a stable feature id (shapeID) for feature-state use.
 */
export function prepareDistrictGeoJson(fc: FeatureCollection): FeatureCollection {
  const features = fc.features.map((feature) => {
    const shapeName = String((feature.properties as { shapeName?: string })?.shapeName ?? '');
    const district = byGeoName.get(shapeName.toLowerCase());
    const props: DistrictFeatureProps = {
      shapeID: String((feature.properties as { shapeID?: string })?.shapeID ?? shapeName),
      shapeName,
      districtId: district?.id ?? '',
      nameEn: district?.nameEn ?? shapeName,
      nameBn: district?.nameBn ?? shapeName,
    };
    return { ...feature, id: props.shapeID, properties: props } as Feature;
  });
  return { type: 'FeatureCollection', features };
}

export interface CountryFeatureProps {
  countryId: string;
  nameEn: string;
  nameBn: string;
  matched: boolean;
}

const countriesByIso = new Map(countries.map((c) => [c.iso2.toUpperCase(), c]));
const countriesByName = new Map(countries.map((c) => [c.nameEn.toLowerCase(), c]));

export function prepareWorldGeoJson(fc: FeatureCollection): FeatureCollection {
  const features = fc.features.map((feature) => {
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const iso2 = String(props.ISO_A2 ?? props.ISO_A2_EH ?? '').toUpperCase();
    const name = String(props.NAME ?? props.NAME_EN ?? '');
    const country =
      (iso2 && iso2 !== '-99' ? countriesByIso.get(iso2) : undefined) ??
      countriesByName.get(name.toLowerCase());
    const shapeId = String(props.ISO_A3 && props.ISO_A3 !== '-99' ? props.ISO_A3 : name);
    const out: CountryFeatureProps = {
      countryId: country?.id ?? '',
      nameEn: country?.nameEn ?? name,
      nameBn: country?.nameBn ?? String(props.NAME_BN ?? name),
      matched: Boolean(country),
    };
    return { ...feature, id: shapeId, properties: out } as Feature;
  });
  return { type: 'FeatureCollection', features };
}
