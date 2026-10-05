function env(key: string, fallback = ''): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key];
  return raw === undefined || raw === '' ? fallback : raw;
}

export const mapConfig = {
  styleUrl: env('VITE_MAP_STYLE_URL', 'https://tiles.openfreemap.org/styles/liberty'),
  attribution: '© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors',
  initialCenter: [90.3563, 23.685] as [number, number],
  initialZoom: 6.2,
  bounds: [
    [87.8, 20.3],
    [92.9, 26.9],
  ] as [[number, number], [number, number]],
};

export const routeConfig = {
  provider: env('VITE_ROUTING_PROVIDER', 'haversine') === 'openrouteservice' ? 'openrouteservice' : 'haversine',
  baseUrl: env('VITE_API_BASE_URL', '/api'),
  averages: {
    busKmph: 35,
    carKmph: 45,
    trainKmph: 50,
    flightFixedMinutes: 75,
  },
};

export const weatherConfig = {
  provider: env('VITE_WEATHER_PROVIDER', 'disabled') === 'open-meteo' ? 'open-meteo' : 'disabled',
  baseUrl: env('VITE_API_BASE_URL', '/api'),
};

export const apiConfig = {
  baseUrl: env('VITE_API_BASE_URL', '/api'),
};

export const turnstileConfig = {
  siteKey: env('VITE_TURNSTILE_SITE_KEY', ''),
  enabled: env('VITE_TURNSTILE_SITE_KEY', '') !== '',
};
