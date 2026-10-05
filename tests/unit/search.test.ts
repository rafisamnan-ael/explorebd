import { describe, expect, it } from 'vitest';
import { normalizeText, compact, scoreMatch, matchesQuery } from '@/lib/search/normalize';
import { searchAll } from '@/lib/search';

describe('search normalisation', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalizeText("Cox's Bazar")).toBe('cox s bazar');
    expect(compact("Cox's Bazar")).toBe('coxsbazar');
  });

  it('normalises latin diacritics', () => {
    expect(normalizeText('Côte')).toContain('cote');
  });

  it('keeps Bangla characters', () => {
    expect(normalizeText('কক্সবাজার')).toBe('কক্সবাজার');
  });
});

describe('bilingual district matching', () => {
  const coxs = { primary: ["Cox's Bazar", 'কক্সবাজার'], secondary: ["Cox's Bazar", 'Coxs Bazar'] };

  it('matches English prefix', () => {
    expect(scoreMatch('cox', coxs)).toBeGreaterThan(0.6);
  });

  it('matches Bangla prefix', () => {
    expect(scoreMatch('কক্স', coxs)).toBeGreaterThan(0.6);
  });

  it('matches loose compact form', () => {
    expect(matchesQuery('coxsbazar', coxs)).toBe(true);
  });

  it('does not match unrelated queries', () => {
    expect(matchesQuery('sylhet', coxs)).toBe(false);
  });
});

describe('searchAll', () => {
  it('finds Cox’s Bazar district in both languages', () => {
    const en = searchAll('cox');
    const bn = searchAll('কক্স');
    expect(en.some((r) => r.type === 'district' && r.id === 'bd-coxs-bazar')).toBe(true);
    expect(bn.some((r) => r.type === 'district' && r.id === 'bd-coxs-bazar')).toBe(true);
  });

  it('finds Moulvibazar from a partial Bangla query', () => {
    const results = searchAll('মৌলভী');
    expect(results.some((r) => r.id === 'bd-moulvibazar')).toBe(true);
  });
});
