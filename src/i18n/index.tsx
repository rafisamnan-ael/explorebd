import { createContext, useContext } from 'react';
import { brand, toShortLocale, type ShortLocale, type SupportedLocale } from '@/config/brand';
import en from './en.json';
import bn from './bn.json';

export type Dictionary = Record<string, unknown>;

const dictionaries: Record<ShortLocale, Dictionary> = { en, bn };

export const localeShortNames: Record<ShortLocale, string> = { bn: 'বাংলা', en: 'EN' };

function resolve(dict: Dictionary, path: string): string | undefined {
  const parts = path.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_m, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export interface I18nContextValue {
  locale: SupportedLocale;
  shortLocale: ShortLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslateFn;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | number | Date) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function createTranslator(shortLocale: ShortLocale, fallback: ShortLocale = 'en'): TranslateFn {
  const primary = dictionaries[shortLocale];
  const secondary = dictionaries[fallback];
  return (key, params) => {
    const value = resolve(primary, key) ?? resolve(secondary, key) ?? key;
    return interpolate(value, params);
  };
}

export function buildI18nValue(
  locale: SupportedLocale,
  setLocale: (locale: SupportedLocale) => void,
): I18nContextValue {
  const shortLocale = toShortLocale(locale);
  const t = createTranslator(shortLocale);
  return {
    locale,
    shortLocale,
    setLocale,
    t,
    formatNumber: (value, options) =>
      new Intl.NumberFormat(shortLocale === 'bn' ? 'bn-BD' : 'en-BD', options).format(value),
    formatCurrency: (value) =>
      new Intl.NumberFormat(shortLocale === 'bn' ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
      }).format(value),
    formatDate: (value) =>
      new Intl.DateTimeFormat(shortLocale === 'bn' ? 'bn-BD' : 'en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(value)),
  };
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}

/** Loads a namespaced dictionary slice, useful outside React. */
export function getDictionary(short: ShortLocale): Dictionary {
  return dictionaries[short];
}

export { brand };
export type { ShortLocale, SupportedLocale };
