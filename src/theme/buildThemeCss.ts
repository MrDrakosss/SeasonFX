import type { SeasonDefinition, SeasonTheme, SeasonThemeOptions } from '../types';

/**
 * Default selector of the elements the theme's `buttons` part restyles.
 */
export const DEFAULT_THEME_BUTTONS =
  'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]';

/** Theme options with every part resolved. */
export interface ResolvedThemeOptions {
  background: boolean;
  buttons: string | false;
  links: boolean;
  forms: boolean;
  selection: boolean;
  scrollbar: boolean;
  colorScheme: 'light' | 'dark' | 'system';
  darkSelector: string | null;
}

/**
 * Resolves the `theme` feature value into explicit parts.
 *
 * @param value - `true` for every part, an object for selected parts, or `false`.
 * @returns The resolved options, or `null` when the theme is off.
 */
export function resolveThemeOptions(value: boolean | SeasonThemeOptions | undefined): ResolvedThemeOptions | null {
  if (!value) return null;
  const all = value === true;
  const o: SeasonThemeOptions = value === true ? {} : value;
  const buttons = all || o.buttons === true ? DEFAULT_THEME_BUTTONS : typeof o.buttons === 'string' ? o.buttons : false;
  return {
    background: all || !!o.background,
    buttons,
    links: all || !!o.links,
    forms: all || !!o.forms,
    selection: all || !!o.selection,
    scrollbar: all || !!o.scrollbar,
    colorScheme: o.colorScheme ?? 'light',
    darkSelector: o.darkSelector ?? null,
  };
}

/**
 * Builds a neutral theme from a single accent color, for seasons without a `theme`.
 *
 * @param accent - Any CSS color.
 * @returns A complete {@link SeasonTheme}.
 */
export function themeFromAccent(accent: string): SeasonTheme {
  const mix = (pct: number) => `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
  return {
    primary: accent,
    secondary: accent,
    onPrimary: '#ffffff',
    buttonBackground: `linear-gradient(180deg, color-mix(in srgb, ${accent} 85%, #ffffff) 0%, ${accent} 100%)`,
    buttonRing: 'rgba(255, 255, 255, 0.3)',
    glow: mix(55),
    ring: accent,
    surface: '#ffffff',
    onSurface: '#111827',
    border: mix(35),
    gradient: `linear-gradient(90deg, ${accent} 0%, color-mix(in srgb, ${accent} 60%, #ffffff) 100%)`,
    dark: {
      surface: '#111827',
      onSurface: '#f9fafb',
      border: mix(45),
      buttonRing: 'rgba(255, 255, 255, 0.2)',
    },
  };
}

function tokens(t: SeasonTheme): string {
  return `  --season-primary: ${t.primary};
  --season-secondary: ${t.secondary};
  --season-on-primary: ${t.onPrimary};
  --season-button-bg: ${t.buttonBackground};
  --season-button-ring: ${t.buttonRing};
  --season-glow: ${t.glow};
  --season-ring: ${t.ring};
  --season-surface: ${t.surface};
  --season-on-surface: ${t.onSurface};
  --season-border: ${t.border};
  --season-gradient: ${t.gradient};
  --season-radius: ${t.radius ?? '10px'};
  --season-pattern: ${t.pattern ?? 'none'};`;
}

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/**
 * Generates the theme stylesheet of a season.
 *
 * @remarks
 * Every rule is scoped to `html[data-season-theme="<id>"]`, so nothing applies
 * unless that attribute is present. Elements with `data-season-ignore` (and
 * everything inside them) are never styled. The theme changes colors, backgrounds, borders colors, shadows,
 * radius and transitions only; it never changes sizes, spacing, fonts or display,
 * so the page layout stays the same.
 *
 * @param season - The season to build the theme for.
 * @param options - The parts to include.
 * @returns The CSS text.
 */
export function buildThemeCss(season: SeasonDefinition, options: ResolvedThemeOptions): string {
  const t = season.theme ?? themeFromAccent(season.accent ?? '#6366f1');
  const S = `html[data-season-theme="${safeId(season.id)}"]`;
  const not = ':not([data-season-ignore], [data-season-ignore] *)';
  const skin = [`${S} .season-btn${not}`];
  if (options.buttons) skin.push(`${S} :is(${options.buttons})${not}:not(.season-btn-soft):not(.season-btn-outline)`);
  const B = skin.join(',\n');
  const each = (suffix: string) => skin.map((s) => `${s}${suffix}`).join(',\n');

  const rules: string[] = [];

  const dark: SeasonTheme = { ...t, ...t.dark };
  rules.push(`${S} {
${tokens(options.colorScheme === 'dark' ? dark : t)}
}`);
  if (options.colorScheme === 'system') {
    rules.push(`@media (prefers-color-scheme: dark) {
${S} {
${tokens(dark)}
}
}`);
  }
  if (options.darkSelector) {
    const ds = options.darkSelector;
    rules.push(`${S}:is(${ds}),
${S} :is(${ds}) {
${tokens(dark)}
}`);
  }

  rules.push(`${B} {
  background: var(--season-button-bg);
  color: var(--season-on-primary);
  border-color: transparent;
  border-radius: var(--season-radius);
  box-shadow: inset 0 0 0 1px var(--season-button-ring), 0 1px 2px rgba(15, 23, 42, 0.18), 0 6px 16px -8px var(--season-glow);
  text-shadow: none;
  transition: transform 150ms ease, box-shadow 200ms ease, filter 200ms ease, background-position 600ms ease;
  ${t.buttonExtra ?? ''}
}
${each(':not(:disabled):hover')} {
  transform: translateY(-1px);
  filter: brightness(1.06) saturate(1.08);
  box-shadow: inset 0 0 0 1px var(--season-button-ring), 0 2px 4px rgba(15, 23, 42, 0.18), 0 12px 26px -8px var(--season-glow);
  ${t.buttonHoverExtra ?? ''}
}
${each(':not(:disabled):active')} {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.97);
}
${each(':focus-visible')} {
  outline: 2px solid var(--season-ring);
  outline-offset: 2px;
}
${each(':disabled')} {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  filter: grayscale(0.35);
}`);

  rules.push(`${S} .season-btn-soft${not} {
  background: color-mix(in srgb, var(--season-primary) 14%, transparent);
  color: var(--season-primary);
  border-color: transparent;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--season-primary) 30%, transparent);
  border-radius: var(--season-radius);
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
${S} .season-btn-soft${not}:hover {
  background: color-mix(in srgb, var(--season-primary) 22%, transparent);
}
${S} .season-btn-outline${not} {
  background: transparent;
  color: var(--season-primary);
  border-color: var(--season-primary);
  border-radius: var(--season-radius);
  box-shadow: 0 0 0 1px var(--season-primary);
  transition: background-color 150ms ease, color 150ms ease;
}
${S} .season-btn-outline${not}:hover {
  background: var(--season-primary);
  color: var(--season-on-primary);
}
${S} .season-card${not} {
  border-color: var(--season-border);
  box-shadow: inset 0 3px 0 0 var(--season-primary), 0 0 0 1px var(--season-border), 0 14px 34px -16px var(--season-glow);
}
${S} .season-surface${not} {
  background-color: var(--season-surface);
  color: var(--season-on-surface);
}
${S} .season-badge${not} {
  background: color-mix(in srgb, var(--season-primary) 14%, transparent);
  color: var(--season-primary);
  border-color: transparent;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--season-primary) 35%, transparent);
  border-radius: 999px;
}
${S} .season-text${not} {
  background-image: var(--season-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
${S} .season-banner${not} {
  background-image: var(--season-pattern), var(--season-gradient);
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
${S} .season-ring${not} {
  box-shadow: 0 0 0 2px var(--season-ring), 0 0 22px -4px var(--season-glow);
}
${S} .season-divider${not} {
  border-color: var(--season-primary);
  border-image: var(--season-gradient) 1;
}
${S} .season-accent${not} {
  color: var(--season-primary);
}
${S} .season-hide {
  display: none !important;
}`);

  if (options.background) {
    rules.push(`${S} body {
  background-image: var(--season-pattern);
  background-attachment: fixed;
}`);
  }

  if (options.links) {
    rules.push(`${S} a[href]${not} {
  text-decoration-color: var(--season-primary);
  text-underline-offset: 0.2em;
}
${S} a[href]${not}:hover {
  text-decoration-color: var(--season-secondary);
}`);
  }

  if (options.forms) {
    rules.push(`${S} :is(input, textarea, select, progress, meter)${not} {
  accent-color: var(--season-primary);
}
${S} :is(input, textarea)${not} {
  caret-color: var(--season-primary);
}
${S} :is(input, textarea, select)${not}:focus-visible {
  outline: 2px solid var(--season-ring);
  outline-offset: 1px;
}`);
  }

  if (options.selection) {
    rules.push(`${S} ::selection {
  background: color-mix(in srgb, var(--season-primary) 28%, transparent);
}`);
  }

  if (options.scrollbar) {
    rules.push(`${S} {
  scrollbar-color: var(--season-primary) transparent;
}`);
  }

  if (t.css) rules.push(t.css.split('{button}').join(`:is(${skin.join(', ')})`));

  return rules.join('\n\n');
}
