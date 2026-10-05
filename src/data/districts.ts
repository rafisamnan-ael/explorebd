import type { District, Division } from '@/types';
import districtsRaw from './districts.json';
import divisionsRaw from './divisions.json';

export const districts = districtsRaw as District[];
export const divisions = divisionsRaw as Division[];

export const districtById = new Map(districts.map((d) => [d.id, d]));
export const districtBySlug = new Map(districts.map((d) => [d.slug, d]));
export const divisionById = new Map(divisions.map((d) => [d.id, d]));

export const districtsByDivision = divisions.map((division) => ({
  division,
  districts: districts.filter((d) => d.divisionId === division.id),
}));

export function getDistrict(id: string | undefined): District | undefined {
  return id ? districtById.get(id) : undefined;
}

export function getDistrictBySlug(slug: string | undefined): District | undefined {
  return slug ? districtBySlug.get(slug) : undefined;
}

export function getDivision(id: string | undefined): Division | undefined {
  return id ? divisionById.get(id) : undefined;
}

export const TOTAL_DISTRICTS = districts.length;
