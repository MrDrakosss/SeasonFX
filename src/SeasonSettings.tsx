import type { CSSProperties, HTMLAttributes } from 'react';
import { useSeason } from './context';
import { SeasonButton } from './SeasonButton';
import { SeasonIcon } from './SeasonIcon';
import type { SeasonFeatureName, SeasonIntensity } from './types';

/** Texts shown by {@link SeasonSettings}. Override any of them for translation. */
export interface SeasonSettingsLabels {
  /** Accessible name of the whole panel and its optional title. */
  title: string;
  /** Label of the master switch. */
  enabled: string;
  /** Text before the current season's name. */
  current: string;
  /** Shown when no season is active. */
  noSeason: string;
  /** Label of the intensity control. */
  intensity: string;
  /** Intensity option names. */
  low: string;
  normal: string;
  high: string;
  /** Feature names. */
  clicks: string;
  hover: string;
  ambient: string;
  decorations: string;
  easterEggs: string;
  theme: string;
}

/** The default English texts of {@link SeasonSettings}. */
export const DEFAULT_SETTINGS_LABELS: Readonly<SeasonSettingsLabels> = {
  title: 'Holiday effects',
  enabled: 'Holiday effects',
  current: 'Now:',
  noSeason: 'No holiday right now. Your choice is saved for the next one.',
  intensity: 'Intensity',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  clicks: 'Click effects',
  hover: 'Hover effects',
  ambient: 'Background effect',
  decorations: 'Decorations',
  easterEggs: 'Hidden surprises',
  theme: 'Holiday theme',
};

/** Props of {@link SeasonSettings}. Every other prop goes to the root `<div>`. */
export interface SeasonSettingsProps extends HTMLAttributes<HTMLDivElement> {
  /** Replaces some or all texts (e.g. for translation). */
  labels?: Partial<SeasonSettingsLabels>;
  /**
   * Shows the title line.
   * @defaultValue false
   */
  showTitle?: boolean;
  /**
   * Removes every inline style, so you can style the panel yourself through the
   * `data-part` attributes (`title`, `row`, `label`, `status`, `segmented`, `option`, `checkbox`).
   * @defaultValue false
   */
  unstyled?: boolean;
}

const FEATURE_ORDER: SeasonFeatureName[] = ['clicks', 'hover', 'ambient', 'decorations', 'easterEggs', 'theme'];
const INTENSITIES: SeasonIntensity[] = ['low', 'normal', 'high'];

const css = {
  root: { display: 'grid', gap: 10, font: 'inherit', color: 'inherit' } as CSSProperties,
  title: { fontWeight: 600 } as CSSProperties,
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } as CSSProperties,
  label: { display: 'grid', gap: 2 } as CSSProperties,
  status: { fontSize: '0.85em', opacity: 0.7, display: 'inline-flex', alignItems: 'center', gap: 4 } as CSSProperties,
  segmented: {
    display: 'inline-flex',
    padding: 2,
    gap: 2,
    borderRadius: 8,
    boxShadow: 'inset 0 0 0 1px rgba(127, 127, 127, 0.35)',
  } as CSSProperties,
  option: (selected: boolean, disabled: boolean): CSSProperties => ({
    font: 'inherit',
    fontSize: '0.9em',
    color: 'inherit',
    padding: '4px 10px',
    border: 0,
    borderRadius: 6,
    cursor: disabled ? 'default' : 'pointer',
    background: selected ? 'rgba(127, 127, 127, 0.22)' : 'transparent',
    fontWeight: selected ? 600 : 400,
    opacity: disabled ? 0.5 : 1,
  }),
  checkbox: { width: 16, height: 16, margin: 0, cursor: 'pointer' } as CSSProperties,
};

/**
 * A ready-made settings panel: master switch, intensity, and one checkbox for
 * every feature the developer made available.
 *
 * @remarks
 * Place it on the settings page. It only shows features enabled in the
 * Provider's `features` prop. The panel carries `data-seasonfx-ignore`, so it is
 * never themed and clicking it does not trigger effects.
 *
 * For a fully custom UI, build your own with {@link useSeason}
 * (`enabled`, `setEnabled`, `preferences`, `setPreferences`, `features`).
 *
 * @example
 * ```tsx
 * <SeasonSettings />
 * <SeasonSettings labels={{ enabled: 'Unnepi effektek', intensity: 'Erosseg' }} />
 * <SeasonSettings unstyled className="my-settings" />
 * ```
 */
export function SeasonSettings(props: SeasonSettingsProps) {
  const { labels: labelsProp, showTitle = false, unstyled = false, style, ...rest } = props;
  const { season, enabled, features, preferences, setPreferences } = useSeason();
  const labels = { ...DEFAULT_SETTINGS_LABELS, ...labelsProp };
  const s = <T,>(value: T) => (unstyled ? undefined : value);

  const available = FEATURE_ORDER.filter((name) => !!features[name]);

  return (
    <div
      role="group"
      aria-label={labels.title}
      data-seasonfx-ignore=""
      data-seasonfx-settings=""
      {...rest}
      style={unstyled ? style : { ...css.root, ...style }}
    >
      {showTitle && (
        <div data-part="title" style={s(css.title)}>
          {labels.title}
        </div>
      )}

      <div data-part="row" style={s(css.row)}>
        <span data-part="label" style={s(css.label)}>
          <span>{labels.enabled}</span>
          <span data-part="status" style={s(css.status)}>
            {season ? (
              <>
                {labels.current} <SeasonIcon season={season} size={14} /> {season.name}
              </>
            ) : (
              labels.noSeason
            )}
          </span>
        </span>
        <SeasonButton aria-label={labels.enabled} unstyled={unstyled} />
      </div>

      <div data-part="row" style={s(css.row)}>
        <span data-part="label">{labels.intensity}</span>
        <div role="radiogroup" aria-label={labels.intensity} data-part="segmented" style={s(css.segmented)}>
          {INTENSITIES.map((level) => {
            const selected = preferences.intensity === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!enabled}
                data-part="option"
                data-selected={selected ? 'true' : 'false'}
                onClick={() => setPreferences({ intensity: level })}
                style={s(css.option(selected, !enabled))}
              >
                {labels[level]}
              </button>
            );
          })}
        </div>
      </div>

      {available.map((name) => (
        <label key={name} data-part="row" style={s({ ...css.row, opacity: enabled ? 1 : 0.5 })}>
          <span data-part="label">{labels[name]}</span>
          <input
            type="checkbox"
            data-part="checkbox"
            checked={preferences[name]}
            disabled={!enabled}
            onChange={(e) => setPreferences({ [name]: e.target.checked })}
            style={s(css.checkbox)}
          />
        </label>
      ))}
    </div>
  );
}
