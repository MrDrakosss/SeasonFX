/**
 * SeasonUI: non-invasive, opt-in seasonal (holiday) effects and themes for React sites.
 *
 * @remarks
 * Minimal integration:
 * ```tsx
 * import { SeasonProvider, SeasonSettings } from 'season-ui';
 *
 * <SeasonProvider defaultEnabled={false} features={{ ambient: true, theme: true }}>
 *   <App />            // existing buttons stay untouched
 * </SeasonProvider>
 *
 * // somewhere (e.g. a settings page):
 * <SeasonSettings />
 * ```
 *
 * @packageDocumentation
 */

export {
  SeasonProvider,
  DEFAULT_SELECTOR,
  DEFAULT_STORAGE_KEY,
  DEFAULT_PREFERENCES,
  INTENSITY_SCALE,
} from './SeasonProvider';
export type { SeasonProviderProps } from './SeasonProvider';

export { SeasonButton } from './SeasonButton';
export type {
  SeasonButtonProps,
  SeasonButtonOwnProps,
  SeasonButtonRenderState,
  SeasonButtonComponent,
} from './SeasonButton';

export { SeasonSettings, DEFAULT_SETTINGS_LABELS } from './SeasonSettings';
export type { SeasonSettingsProps, SeasonSettingsLabels } from './SeasonSettings';

export { SeasonIcon } from './SeasonIcon';
export type { SeasonIconProps } from './SeasonIcon';

export { SeasonScript } from './SeasonScript';
export type { SeasonScriptProps } from './SeasonScript';
export { getSeasonScript } from './ssr/getSeasonScript';
export type { SeasonScriptOptions } from './ssr/getSeasonScript';

export { SeasonController } from './core/SeasonController';
export type { SeasonOptions, SeasonState, ResolvedFeatures } from './core/SeasonController';

export { useSeason } from './context';
export type { SeasonContextValue, CelebrateTarget } from './context';

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
export type { SeasonRange, RangeFunction } from './seasons/dates';

export { buildThemeCss, resolveThemeOptions, themeFromAccent, DEFAULT_THEME_BUTTONS } from './theme/buildThemeCss';
export type { ResolvedThemeOptions } from './theme/buildThemeCss';

export { ParticleEngine } from './engine/ParticleEngine';
export type { ParticleEngineOptions, DecorationTarget } from './engine/ParticleEngine';
export { shapes } from './engine/shapes';
export { decorations } from './engine/decorations';

export type {
  SeasonDefinition,
  SeasonTheme,
  SeasonThemeOptions,
  SeasonFeatures,
  SeasonFeatureName,
  SeasonPreferences,
  SeasonIntensity,
  ParticleStyle,
  ParticleConfig,
  AmbientConfig,
  FlybyConfig,
  DecorationSlot,
  DecorationDrawer,
  ParticleShape,
  ShapeEntry,
  ShapeDrawer,
  BuiltInShape,
} from './types';
