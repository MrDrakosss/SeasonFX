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
  return `  --seasonfx-primary: ${t.primary};
  --seasonfx-secondary: ${t.secondary};
  --seasonfx-on-primary: ${t.onPrimary};
  --seasonfx-button-bg: ${t.buttonBackground};
  --seasonfx-button-ring: ${t.buttonRing};
  --seasonfx-glow: ${t.glow};
  --seasonfx-ring: ${t.ring};
  --seasonfx-surface: ${t.surface};
  --seasonfx-on-surface: ${t.onSurface};
  --seasonfx-border: ${t.border};
  --seasonfx-gradient: ${t.gradient};
  --seasonfx-radius: ${t.radius ?? '10px'};
  --seasonfx-pattern: ${t.pattern ?? 'none'};`;
}

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/**
 * Generates the theme stylesheet of a season.
 *
 * @remarks
 * Every rule is scoped to `html[data-seasonfx-theme="<id>"]`, so nothing applies
 * unless that attribute is present. Elements with `data-seasonfx-ignore` (and
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
  const S = `html[data-seasonfx-theme="${safeId(season.id)}"]`;
  const not = ':not([data-seasonfx-ignore], [data-seasonfx-ignore] *)';
  const skin = [`${S} .seasonfx-btn${not}`];
  if (options.buttons) skin.push(`${S} :is(${options.buttons})${not}:not(.seasonfx-btn-soft):not(.seasonfx-btn-outline)`);
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
  background: var(--seasonfx-button-bg);
  color: var(--seasonfx-on-primary);
  border-color: transparent;
  border-radius: var(--seasonfx-radius);
  box-shadow: inset 0 0 0 1px var(--seasonfx-button-ring), 0 1px 2px rgba(15, 23, 42, 0.18), 0 6px 16px -8px var(--seasonfx-glow);
  text-shadow: none;
  transition: transform 150ms ease, box-shadow 200ms ease, filter 200ms ease, background-position 600ms ease;
  ${t.buttonExtra ?? ''}
}
${each(':not(:disabled):hover')} {
  transform: translateY(-1px);
  filter: brightness(1.06) saturate(1.08);
  box-shadow: inset 0 0 0 1px var(--seasonfx-button-ring), 0 2px 4px rgba(15, 23, 42, 0.18), 0 12px 26px -8px var(--seasonfx-glow);
  ${t.buttonHoverExtra ?? ''}
}
${each(':not(:disabled):active')} {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.97);
}
${each(':focus-visible')} {
  outline: 2px solid var(--seasonfx-ring);
  outline-offset: 2px;
}
${each(':disabled')} {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  filter: grayscale(0.35);
}`);

  rules.push(`${S} .seasonfx-btn-soft${not} {
  background: color-mix(in srgb, var(--seasonfx-primary) 14%, transparent);
  color: var(--seasonfx-primary);
  border-color: transparent;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--seasonfx-primary) 30%, transparent);
  border-radius: var(--seasonfx-radius);
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
${S} .seasonfx-btn-soft${not}:hover {
  background: color-mix(in srgb, var(--seasonfx-primary) 22%, transparent);
}
${S} .seasonfx-btn-outline${not} {
  background: transparent;
  color: var(--seasonfx-primary);
  border-color: var(--seasonfx-primary);
  border-radius: var(--seasonfx-radius);
  box-shadow: 0 0 0 1px var(--seasonfx-primary);
  transition: background-color 150ms ease, color 150ms ease;
}
${S} .seasonfx-btn-outline${not}:hover {
  background: var(--seasonfx-primary);
  color: var(--seasonfx-on-primary);
}
${S} .seasonfx-card${not} {
  border-color: var(--seasonfx-border);
  box-shadow: inset 0 3px 0 0 var(--seasonfx-primary), 0 0 0 1px var(--seasonfx-border), 0 14px 34px -16px var(--seasonfx-glow);
}
${S} .seasonfx-surface${not} {
  background-color: var(--seasonfx-surface);
  color: var(--seasonfx-on-surface);
}
${S} .seasonfx-badge${not} {
  background: color-mix(in srgb, var(--seasonfx-primary) 14%, transparent);
  color: var(--seasonfx-primary);
  border-color: transparent;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--seasonfx-primary) 35%, transparent);
  border-radius: 999px;
}
${S} .seasonfx-text${not} {
  background-image: var(--seasonfx-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
${S} .seasonfx-banner${not} {
  background-image: var(--seasonfx-pattern), var(--seasonfx-gradient);
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
${S} .seasonfx-ring${not} {
  box-shadow: 0 0 0 2px var(--seasonfx-ring), 0 0 22px -4px var(--seasonfx-glow);
}
${S} .seasonfx-divider${not} {
  border-color: var(--seasonfx-primary);
  border-image: var(--seasonfx-gradient) 1;
}
${S} .seasonfx-accent${not} {
  color: var(--seasonfx-primary);
}
${S} .seasonfx-hide {
  display: none !important;
}`);

  if (options.background) {
    rules.push(`${S} body {
  background-image: var(--seasonfx-pattern);
  background-attachment: fixed;
}`);
  }

  if (options.links) {
    rules.push(`${S} a[href]${not} {
  text-decoration-color: var(--seasonfx-primary);
  text-underline-offset: 0.2em;
}
${S} a[href]${not}:hover {
  text-decoration-color: var(--seasonfx-secondary);
}`);
  }

  if (options.forms) {
    rules.push(`${S} :is(input, textarea, select, progress, meter)${not} {
  accent-color: var(--seasonfx-primary);
}
${S} :is(input, textarea)${not} {
  caret-color: var(--seasonfx-primary);
}
${S} :is(input, textarea, select)${not}:focus-visible {
  outline: 2px solid var(--seasonfx-ring);
  outline-offset: 1px;
}`);
  }

  if (options.selection) {
    rules.push(`${S} ::selection {
  background: color-mix(in srgb, var(--seasonfx-primary) 28%, transparent);
}`);
  }

  if (options.scrollbar) {
    rules.push(`${S} {
  scrollbar-color: var(--seasonfx-primary) transparent;
}`);
  }

  if (t.css) rules.push(t.css.split('{button}').join(`:is(${skin.join(', ')})`));

  return rules.join('\n\n');
}
