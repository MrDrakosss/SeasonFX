/**
 * Script-tag build: exposes `window.SeasonUI` for sites without React
 * (plain HTML, WordPress, PHP templates, ...). It contains no React code.
 *
 * @example
 * ```html
 * <script src="season-ui.global.js"></script>
 * <script>
 *   const season = SeasonUI.init({ defaultEnabled: false, features: { ambient: true, theme: true } });
 *   season.bindToggle(document.getElementById('holiday-toggle'));
 * </script>
 * ```
 *
 * @packageDocumentation
 */
import { SeasonController } from './core/SeasonController';
import type { SeasonOptions } from './core/SeasonController';

export { SeasonController } from './core/SeasonController';
export { DEFAULT_PREFERENCES, DEFAULT_SELECTOR, DEFAULT_STORAGE_KEY, INTENSITY_SCALE } from './core/constants';
export {
  builtInSeasons,
  christmas,
  newYear,
  valentine,
  easter,
  halloween,
  getActiveSeason,
  dateRange,
  easterRange,
  getEasterSunday,
  svgUrl,
} from './seasons';
export { ParticleEngine } from './engine/ParticleEngine';
export { shapes } from './engine/shapes';
export { decorations } from './engine/decorations';
export { buildThemeCss, themeFromAccent } from './theme/buildThemeCss';

/**
 * Creates and starts a {@link SeasonController}. Call it once per page.
 *
 * @remarks
 * Include the script in `<head>` (without `defer`) and call `init()` right away to
 * apply the theme before the first paint. Canvas effects start as soon as
 * `<body>` exists.
 *
 * @param options - The same options as `<SeasonProvider>`.
 * @returns The running controller: `toggle()`, `setEnabled()`, `setPreferences()`,
 * `celebrate()`, `bindToggle()`, `getState()`, `subscribe()`, `stop()`.
 */
export function init(options: SeasonOptions = {}): SeasonController {
  const controller = new SeasonController(options);
  controller.start();
  return controller;
}
