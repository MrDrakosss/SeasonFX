import { describe, expect, it } from 'vitest';
import { dateRange, easterRange, getActiveSeason, getEasterSunday } from '../src/seasons';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('dateRange', () => {
  it('handles a range inside one year, inclusive', () => {
    const r = dateRange('12-01', '12-26');
    expect(r(d(2026, 11, 30))).toBe(false);
    expect(r(d(2026, 12, 1))).toBe(true);
    expect(r(d(2026, 12, 26))).toBe(true);
    expect(r(d(2026, 12, 27))).toBe(false);
  });

  it('handles ranges that wrap the new year', () => {
    const r = dateRange('12-27', '01-02');
    expect(r(d(2026, 12, 31))).toBe(true);
    expect(r(d(2027, 1, 2))).toBe(true);
    expect(r(d(2027, 1, 3))).toBe(false);
    expect(r(d(2026, 12, 26))).toBe(false);
  });

  it('rejects malformed input', () => {
    expect(() => dateRange('2026-12-01', '12-02')).toThrow();
  });
});

describe('easter', () => {
  it('computes known Easter Sundays', () => {
    expect(getEasterSunday(2024)).toEqual(d(2024, 3, 31));
    expect(getEasterSunday(2026)).toEqual(d(2026, 4, 5));
    expect(getEasterSunday(2027)).toEqual(d(2027, 3, 28));
  });

  it('matches days around Easter', () => {
    const r = easterRange(7, 1);
    expect(r(d(2026, 3, 29))).toBe(true);
    expect(r(d(2026, 4, 6))).toBe(true);
    expect(r(d(2026, 4, 7))).toBe(false);
    expect(r(d(2026, 3, 28))).toBe(false);
  });
});

describe('getActiveSeason', () => {
  it('picks the built-in season for the date', () => {
    expect(getActiveSeason(d(2026, 12, 24))?.id).toBe('christmas');
    expect(getActiveSeason(d(2026, 12, 31))?.id).toBe('new-year');
    expect(getActiveSeason(d(2026, 2, 14))?.id).toBe('valentine');
    expect(getActiveSeason(d(2026, 10, 31))?.id).toBe('halloween');
    expect(getActiveSeason(d(2026, 4, 5))?.id).toBe('easter');
    expect(getActiveSeason(d(2026, 9, 29))).toBeNull();
  });
});
