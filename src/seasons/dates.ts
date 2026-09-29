/**
 * A serializable description of a date rule, attached to the functions returned by
 * {@link dateRange} and {@link easterRange}. It lets the early `<head>` script
 * (see `getSeasonScript`) evaluate the rule before the page is painted.
 *
 * - `{ kind: 'date', from, to }`: month-day numbers such as `1201` for December 1.
 * - `{ kind: 'easter', before, after }`: days around Easter Sunday.
 */
export type SeasonRange =
  | { kind: 'date'; from: number; to: number }
  | { kind: 'easter'; before: number; after: number };

/** An `isActive` function that also carries its serializable {@link SeasonRange}. */
export type RangeFunction = ((date: Date) => boolean) & { seasonRange: SeasonRange };

function parseMonthDay(value: string): number {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(value);
  if (!match) throw new Error(`seasonfx: invalid date "${value}", expected "MM-DD" (e.g. "12-24").`);
  return Number(match[1]) * 100 + Number(match[2]);
}

/**
 * Creates a yearly recurring range from `from` to `to` (both days inclusive).
 *
 * @remarks
 * Ranges that wrap the new year also work, e.g. `dateRange('12-27', '01-02')`.
 * Dates are evaluated in local time. The returned function carries a
 * `seasonRange` description, so the early `<head>` script can evaluate it too.
 *
 * @param from - First day as `"MM-DD"` (month-day), e.g. `"12-01"`.
 * @param to - Last day as `"MM-DD"`, e.g. `"12-26"`.
 * @returns A `SeasonDefinition.isActive` function.
 * @throws Error if a value is not in `"MM-DD"` format.
 *
 * @example
 * ```ts
 * isActive: dateRange('10-20', '10-31')
 * ```
 */
export function dateRange(from: string, to: string): RangeFunction {
  const start = parseMonthDay(from);
  const end = parseMonthDay(to);
  const fn = (date: Date) => {
    const md = (date.getMonth() + 1) * 100 + date.getDate();
    return start <= end ? md >= start && md <= end : md >= start || md <= end;
  };
  return Object.assign(fn, { seasonRange: { kind: 'date', from: start, to: end } as SeasonRange });
}

/**
 * Returns Western (Gregorian) Easter Sunday for the given year.
 *
 * @param year - The year, e.g. `2027`.
 * @returns Easter Sunday at local midnight.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * A range relative to Easter Sunday (a movable feast).
 *
 * @param daysBefore - Days before Easter Sunday the range starts.
 * @param daysAfter - Days after Easter Sunday the range ends (1 = Easter Monday).
 * @returns A `SeasonDefinition.isActive` function.
 *
 * @example
 * ```ts
 * isActive: easterRange(7, 1) // Palm Sunday through Easter Monday
 * ```
 */
export function easterRange(daysBefore: number, daysAfter: number): RangeFunction {
  const fn = (date: Date) => {
    const easter = getEasterSunday(date.getFullYear());
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const start = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - daysBefore).getTime();
    const end = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + daysAfter).getTime();
    return day >= start && day <= end;
  };
  return Object.assign(fn, { seasonRange: { kind: 'easter', before: daysBefore, after: daysAfter } as SeasonRange });
}
