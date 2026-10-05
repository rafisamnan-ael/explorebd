export type PersistedState = {
  visited: string[];
  theme: string;
  displayName: string;
};

const KEY = 'bd-travel-app:v1';

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { visited: [], theme: 'emerald', displayName: '' };
    return { visited: [], theme: 'emerald', displayName: '', ...JSON.parse(raw) };
  } catch {
    return { visited: [], theme: 'emerald', displayName: '' };
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
