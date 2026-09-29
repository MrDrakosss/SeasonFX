import type { SeasonDefinition } from '../types';
import { christmas } from './christmas';
import { easter } from './easter';
import { halloween } from './halloween';
import { newYear } from './newYear';
import { valentine } from './valentine';

export { christmas, easter, halloween, newYear, valentine };
export { dateRange, easterRange, getEasterSunday } from './dates';
export { svgUrl } from './pattern';

/**
 * The built-in seasons in priority order (if two overlap, the earlier one wins).
 *
 * @remarks
 * Adding your own season next to the built-in ones:
 * ```tsx
 * <SeasonProvider seasons={[stPatricks, ...builtInSeasons]}>
 * ```
 */
export const builtInSeasons: readonly SeasonDefinition[] = [christmas, newYear, valentine, easter, halloween];

/**
 * Returns the season that is active on the given day.
 *
 * @param date - The date to check (local time).
 * @param seasons - Candidate seasons in priority order.
 * @returns The first season whose `isActive(date)` returns `true`, or `null`.
 */
export function getActiveSeason(
  date: Date,
  seasons: readonly SeasonDefinition[] = builtInSeasons,
): SeasonDefinition | null {
  return seasons.find((s) => s.isActive(date)) ?? null;
}
