import type { SeasonIntensity, SeasonPreferences } from '../types';

/**
 * The default CSS selector: clicking (or hovering) these elements or their
 * descendants triggers an effect.
 */
export const DEFAULT_SELECTOR =
  'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]';

/**
 * The default `localStorage` key prefix. The master switch is saved under
 * `<prefix>:enabled`, the preferences under `<prefix>:preferences`.
 */
export const DEFAULT_STORAGE_KEY = 'seasonfx';

/** The default user preferences: normal intensity, every feature allowed. */
export const DEFAULT_PREFERENCES: Readonly<SeasonPreferences> = {
  intensity: 'normal',
  clicks: true,
  hover: true,
  ambient: true,
  decorations: true,
  easterEggs: true,
  theme: true,
};

/** Multipliers applied to particle counts and ambient density for each intensity. */
export const INTENSITY_SCALE: Readonly<Record<SeasonIntensity, number>> = {
  low: 0.5,
  normal: 1,
  high: 1.8,
};
