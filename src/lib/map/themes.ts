import type { TravelStatus } from '@/types';

export interface MapTheme {
  id: string;
  labelEn: string;
  labelBn: string;
  background: string;
  panel: string;
  districtStroke: string;
  districtStrokeActive: string;
  labelColor: string;
  titleColor: string;
  subtitleColor: string;
  attributionColor: string;
  accent: string;
  texture: boolean;
  status: Record<TravelStatus, string>;
}

export const mapThemes: MapTheme[] = [
  {
    id: 'forest',
    labelEn: 'Forest',
    labelBn: 'অরণ্য',
    background: '#F4F7F2',
    panel: '#FFFFFF',
    districtStroke: '#D7E4DB',
    districtStrokeActive: '#0B3D2E',
    labelColor: '#1F3B30',
    titleColor: '#0B3D2E',
    subtitleColor: '#4B6B5C',
    attributionColor: '#7C9186',
    accent: '#2563EB',
    texture: true,
    status: {
      unvisited: '#DCE6E0',
      want_to_go: '#7DA9F5',
      visited: '#116149',
      favorite: '#E87546',
      lived_here: '#C98A0A',
    },
  },
  {
    id: 'river',
    labelEn: 'River',
    labelBn: 'নদী',
    background: '#EAF2FD',
    panel: '#FFFFFF',
    districtStroke: '#C6D9F5',
    districtStrokeActive: '#14396E',
    labelColor: '#153A6B',
    titleColor: '#0E2A55',
    subtitleColor: '#4A6285',
    attributionColor: '#7E92AD',
    accent: '#0FA36B',
    texture: false,
    status: {
      unvisited: '#D4E3F7',
      want_to_go: '#2563EB',
      visited: '#155E9E',
      favorite: '#0FA36B',
      lived_here: '#C98A0A',
    },
  },
  {
    id: 'sunset',
    labelEn: 'Sunset',
    labelBn: 'সূর্যাস্ত',
    background: '#FDF3EC',
    panel: '#FFFFFF',
    districtStroke: '#F2D8C8',
    districtStrokeActive: '#8A3D1E',
    labelColor: '#6B3520',
    titleColor: '#7A3418',
    subtitleColor: '#9A6247',
    attributionColor: '#B08C79',
    accent: '#C98A0A',
    texture: true,
    status: {
      unvisited: '#F0DED3',
      want_to_go: '#E87546',
      visited: '#C25A30',
      favorite: '#E87546',
      lived_here: '#C98A0A',
    },
  },
  {
    id: 'midnight',
    labelEn: 'Midnight',
    labelBn: 'মধ্যরাত',
    background: '#0C1512',
    panel: '#13201B',
    districtStroke: '#24382F',
    districtStrokeActive: '#7FE0B6',
    labelColor: '#CDE7DB',
    titleColor: '#EAF6F0',
    subtitleColor: '#9AB4A8',
    attributionColor: '#6E8579',
    accent: '#48B58A',
    texture: false,
    status: {
      unvisited: '#233830',
      want_to_go: '#75A4FF',
      visited: '#48B58A',
      favorite: '#F09A73',
      lived_here: '#F1C45E',
    },
  },
  {
    id: 'paper',
    labelEn: 'Paper',
    labelBn: 'কাগজ',
    background: '#F7F2E7',
    panel: '#FCF9F1',
    districtStroke: '#D8CDB6',
    districtStrokeActive: '#3B3427',
    labelColor: '#3B3427',
    titleColor: '#2A2419',
    subtitleColor: '#6A5F4A',
    attributionColor: '#94886F',
    accent: '#9A5B2A',
    texture: true,
    status: {
      unvisited: '#E3DAC6',
      want_to_go: '#8A6BB5',
      visited: '#5C6B4A',
      favorite: '#B4632C',
      lived_here: '#9A7B1E',
    },
  },
];

export const defaultMapTheme = mapThemes[0]!;

export function getMapTheme(id: string): MapTheme {
  return mapThemes.find((t) => t.id === id) ?? defaultMapTheme;
}

export const statusOrder: TravelStatus[] = ['visited', 'want_to_go', 'favorite', 'lived_here', 'unvisited'];
