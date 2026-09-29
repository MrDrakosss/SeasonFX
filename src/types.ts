/**
 * Draws a single particle shape.
 *
 * @remarks
 * When called, the canvas context is already translated to the particle's
 * center, rotated, and has `globalAlpha` applied. The function only has to
 * draw a shape roughly `size` pixels wide around the origin (0, 0).
 * The engine wraps the call in `ctx.save()` / `ctx.restore()`, so the
 * function does not need to restore the context.
 *
 * @param ctx - The 2D canvas context.
 * @param size - The shape's diameter in CSS pixels.
 * @param color - The color picked for this particle (any CSS color).
 *
 * @example
 * ```ts
 * const square: ShapeDrawer = (ctx, size, color) => {
 *   ctx.fillStyle = color;
 *   ctx.fillRect(-size / 2, -size / 2, size, size);
 * };
 * ```
 */
export type ShapeDrawer = (ctx: CanvasRenderingContext2D, size: number, color: string) => void;

/**
 * Names of the built-in particle shapes.
 *
 * - `snowflake`: six-armed snowflake
 * - `star`: five-pointed star
 * - `heart`: heart
 * - `confetti`: rectangular confetti piece
 * - `spark`: glowing dot
 * - `pumpkin`: jack-o'-lantern
 * - `bat`: bat
 * - `ghost`: ghost
 * - `egg`: decorated Easter egg
 * - `flower`: five-petal flower
 * - `leaf`: autumn leaf
 */
export type BuiltInShape =
  | 'snowflake'
  | 'star'
  | 'heart'
  | 'confetti'
  | 'spark'
  | 'pumpkin'
  | 'bat'
  | 'ghost'
  | 'egg'
  | 'flower'
  | 'leaf';

/**
 * A particle shape: either the name of a built-in shape or a custom {@link ShapeDrawer}.
 */
export type ParticleShape = BuiltInShape | ShapeDrawer;

/**
 * A shape entry with per-shape settings.
 *
 * @example
 * ```ts
 * { shape: 'pumpkin', colors: ['#f97316'], weight: 2 }
 * ```
 */
export interface ShapeEntry {
  /** The shape (built-in name or custom drawer). */
  shape: ParticleShape;
  /**
   * Colors used for this shape. Falls back to the config's `colors`.
   */
  colors?: string[];
  /**
   * Relative frequency compared to the other shapes.
   * @defaultValue 1
   */
  weight?: number;
}

/**
 * Physics and look shared by every kind of particle.
 *
 * @remarks
 * Velocities are in CSS pixels per second, accelerations in pixels per
 * second squared, and times in seconds.
 */
export interface ParticleStyle {
  /**
   * The shapes to use. Each entry is a name, a drawer, or a {@link ShapeEntry}
   * (with its own colors and weight). Every particle gets a random shape,
   * picked by weight.
   */
  shapes: Array<ParticleShape | ShapeEntry>;
  /**
   * Default colors for shapes that do not define their own.
   * @defaultValue `['#ffffff']`
   */
  colors?: string[];
  /**
   * Size range `[min, max]` in CSS pixels.
   * @defaultValue `[8, 16]`
   */
  size?: [number, number];
  /**
   * Initial speed range `[min, max]` (px/s).
   * @defaultValue `[80, 260]`
   */
  speed?: [number, number];
  /**
   * Gravity (px/s^2). Positive values fall down, negative values float up.
   * @defaultValue 300
   */
  gravity?: number;
  /**
   * Air resistance: how quickly the particle slows down, per second.
   * 0 = no slowdown.
   * @defaultValue 1.5
   */
  drag?: number;
  /**
   * Lifetime range `[min, max]` in seconds. Particles fade out during the
   * last third of their life.
   * @defaultValue `[0.9, 1.6]`
   */
  lifetime?: [number, number];
  /**
   * Maximum rotation speed (radians/s). The direction is random.
   * @defaultValue 4
   */
  spin?: number;
  /**
   * Amplitude of the sideways sway (px/s). Suits snowflakes and hearts.
   * @defaultValue 0
   */
  wobble?: number;
  /**
   * Maximum opacity, between 0 and 1.
   * @defaultValue 1
   */
  opacity?: number;
}

/**
 * Settings for a particle burst (click, hover, celebration).
 */
export interface ParticleConfig extends ParticleStyle {
  /**
   * Number of particles per burst. Scaled by the user's intensity preference.
   * @defaultValue 14
   */
  count?: number;
  /**
   * Main launch direction in radians. `-Math.PI / 2` points up.
   * @defaultValue `-Math.PI / 2`
   */
  angle?: number;
  /**
   * Spread in radians around `angle`. `2 * Math.PI` means every direction.
   * @defaultValue `2 * Math.PI`
   */
  spread?: number;
}

/**
 * Settings for the always-running background effect (e.g. snowfall).
 *
 * @remarks
 * Particles enter from the top or bottom edge of the viewport at random
 * horizontal positions and travel across the screen. `speed` is the initial
 * vertical speed; keep `gravity` and `drag` low for a calm drift.
 */
export interface AmbientConfig extends ParticleStyle {
  /**
   * Particles spawned per second for every 1000 CSS pixels of viewport width.
   * Scaled by the user's intensity preference.
   */
  rate: number;
  /**
   * The edge particles enter from.
   * @defaultValue `'top'`
   */
  from?: 'top' | 'bottom';
}

/**
 * A rare "fly-by" event (one of the hidden surprises), e.g. a shooting star
 * or a bat swarm crossing the screen.
 */
export interface FlybyConfig {
  /** Shapes of the flying objects. */
  shapes: Array<ParticleShape | ShapeEntry>;
  /** Default colors for shapes that do not define their own. */
  colors?: string[];
  /**
   * How many objects fly together (a flock).
   * @defaultValue 1
   */
  count?: number;
  /**
   * Size range `[min, max]` of the flying objects in CSS pixels.
   * @defaultValue `[18, 26]`
   */
  size?: [number, number];
  /**
   * Seconds it takes to cross the screen.
   * @defaultValue 5
   */
  duration?: number;
  /**
   * Route of the fly-by. `'across'` flies horizontally through the upper part
   * of the screen, `'rise'` goes from the bottom to the top.
   * @defaultValue `'across'`
   */
  path?: 'across' | 'rise';
  /** Particles continuously emitted behind every flying object. */
  trail?: ParticleConfig;
  /**
   * Trail particles emitted per second per object.
   * @defaultValue 30
   */
  trailRate?: number;
  /** Optional burst at the point where each object finishes (e.g. a firework). */
  finale?: ParticleConfig;
}

/** The three places a decoration can be attached to an element. */
export type DecorationSlot = 'hat' | 'edge' | 'corner';

/**
 * Draws a decoration attached to an element.
 *
 * @remarks
 * The context origin is the element's top-left corner (in viewport pixels).
 * `width` and `height` are the element's size. Decorations may draw outside
 * the element's box (a hat sits above it, for example).
 *
 * @param ctx - The 2D canvas context.
 * @param width - The element's width in CSS pixels.
 * @param height - The element's height in CSS pixels.
 */
export type DecorationDrawer = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

/**
 * Visual tokens and extra CSS of a season's page theme.
 *
 * @remarks
 * Used only when the developer turns on the `theme` feature. Every color is a
 * CSS color. The tokens become CSS custom properties on
 * `html[data-season-theme="<id>"]`, e.g. `primary` becomes `--season-primary`.
 */
export interface SeasonTheme {
  /** Main brand color of the season. */
  primary: string;
  /** Second color, used for hover states and gradients. */
  secondary: string;
  /** Text color on top of `buttonBackground`. */
  onPrimary: string;
  /** Background of themed buttons (any CSS background, gradients allowed). */
  buttonBackground: string;
  /** Color of the thin inner ring on themed buttons. */
  buttonRing: string;
  /** Color of the soft glow under themed buttons. */
  glow: string;
  /** Focus ring color. */
  ring: string;
  /** Background of `.season-card` surfaces. */
  surface: string;
  /** Text color on `surface`. */
  onSurface: string;
  /** Border color of surfaces and badges. */
  border: string;
  /** Gradient used by `.season-text` and `.season-banner`. */
  gradient: string;
  /**
   * Corner radius of themed buttons.
   * @defaultValue `'10px'`
   */
  radius?: string;
  /**
   * Page background layer (a CSS `background-image` value). It is drawn on top of
   * the page's own background color, so it should be mostly transparent.
   */
  pattern?: string;
  /** Extra CSS declarations for themed buttons (without selector or braces). */
  buttonExtra?: string;
  /** Extra CSS declarations for themed buttons on hover. */
  buttonHoverExtra?: string;
  /** Extra CSS rules appended to the theme stylesheet (full rules, with selectors). */
  css?: string;
  /**
   * Token overrides used when the page is in dark mode (see
   * {@link SeasonThemeOptions.colorScheme} and {@link SeasonThemeOptions.darkSelector}).
   * Usually only `surface`, `onSurface`, `border` and sometimes `pattern` need to change.
   */
  dark?: Partial<Omit<SeasonTheme, 'dark' | 'css' | 'buttonExtra' | 'buttonHoverExtra'>>;
}

/**
 * Definition of a season (holiday theme).
 *
 * @remarks
 * The built-in seasons are listed in {@link builtInSeasons}. Pass your own
 * through {@link SeasonProviderProps.seasons}. If several seasons match the
 * same day, the one that comes first in the array wins.
 *
 * Only `id`, `name`, `isActive` and `particles` are required. A feature whose
 * config is missing simply does nothing for that season.
 *
 * @example
 * ```ts
 * const stPatricks: SeasonDefinition = {
 *   id: 'st-patricks',
 *   name: "St. Patrick's Day",
 *   accent: '#16a34a',
 *   isActive: dateRange('03-15', '03-17'),
 *   particles: {
 *     shapes: ['confetti', 'star'],
 *     colors: ['#16a34a', '#22c55e', '#facc15'],
 *   },
 * };
 * ```
 */
export interface SeasonDefinition {
  /** Unique identifier (e.g. `'christmas'`). Used in `data-season` attributes. */
  id: string;
  /** Human-readable name (e.g. `'Christmas'`). */
  name: string;
  /**
   * Shape drawn as the season's icon (by `SeasonIcon` and the default toggle).
   * @defaultValue the first shape of `particles.shapes`
   */
  icon?: ParticleShape | ShapeEntry;
  /**
   * Accent color (CSS color). Used as the default toggle's "on" background.
   * @defaultValue `'#6366f1'`
   */
  accent?: string;
  /**
   * Decides whether the season is active on a given day (local time).
   * Helpers: {@link dateRange}, {@link easterRange}.
   */
  isActive: (date: Date) => boolean;
  /** Particle burst on click. */
  particles: ParticleConfig;
  /**
   * Small burst when the pointer enters a button.
   * @defaultValue a smaller, slower version of `particles`
   */
  hover?: ParticleConfig;
  /** Always-running background effect (e.g. snowfall). */
  ambient?: AmbientConfig;
  /** Rare fly-by event, part of the hidden surprises. */
  flyby?: FlybyConfig;
  /** Decorations attached to elements marked with `data-season-decor`. */
  decorations?: Partial<Record<DecorationSlot, DecorationDrawer>>;
  /** Page theme tokens, used when the `theme` feature is on. */
  theme?: SeasonTheme;
  /**
   * A word that triggers a surprise when typed anywhere on the page (outside
   * text fields), part of the hidden surprises. Case-insensitive, letters only.
   */
  secret?: string;
}

/** How strong the effects are. Multiplies particle counts and ambient density. */
export type SeasonIntensity = 'low' | 'normal' | 'high';

/**
 * Which parts of the page the theme styles.
 *
 * @remarks
 * Passing `theme: true` in {@link SeasonFeatures} turns on every part. Passing an
 * object turns on only the parts set to `true` (or to a selector string).
 * The `season-*` component classes (`season-btn`, `season-card`, ...) and the
 * `--season-*` tokens are always included when the theme is on, because they only
 * affect elements that opt in.
 */
export interface SeasonThemeOptions {
  /** Seasonal pattern over the page background (`body`). */
  background?: boolean;
  /**
   * Seasonal look for buttons. `true` uses {@link DEFAULT_THEME_BUTTONS}; a string is
   * a custom CSS selector (e.g. `'.btn-primary'`). Elements with
   * `data-season-ignore` are never styled.
   */
  buttons?: boolean | string;
  /** Seasonal underline color for links that are already underlined. */
  links?: boolean;
  /** Accent color, caret and focus ring for form controls. */
  forms?: boolean;
  /** Seasonal text selection color. */
  selection?: boolean;
  /** Seasonal scrollbar color. */
  scrollbar?: boolean;
  /**
   * Which token set to use.
   * - `'light'`: light tokens only (for sites without dark mode).
   * - `'dark'`: dark tokens only (for sites that are always dark).
   * - `'system'`: follows the visitor's OS setting (`prefers-color-scheme`).
   *
   * Combine `'light'` with {@link SeasonThemeOptions.darkSelector} when the site
   * switches dark mode with a class or attribute.
   *
   * @defaultValue `'light'`
   */
  colorScheme?: 'light' | 'dark' | 'system';
  /**
   * CSS selector that matches when the site is in dark mode, e.g. `'.dark'`
   * (Tailwind), `'[data-theme="dark"]'` or `'html.dark-mode'`. It may match
   * `<html>` or any ancestor of the themed content (usually `<html>` or `<body>`).
   * While it matches, the dark tokens are used.
   */
  darkSelector?: string;
}

/**
 * Features the developer makes available. Every feature except `clicks` is off
 * by default, so nothing unexpected happens to the site.
 *
 * @remarks
 * A feature runs only if it is enabled here, the user has not turned it off
 * in their {@link SeasonPreferences}, a season is active, and the master switch
 * (`enabled`) is on. Motion features also respect `prefers-reduced-motion`.
 */
export interface SeasonFeatures {
  /**
   * Particle burst when a matching element is clicked.
   * @defaultValue true
   */
  clicks?: boolean;
  /**
   * Small burst when the mouse enters a matching element.
   * @defaultValue false
   */
  hover?: boolean;
  /**
   * Always-running background effect (snowfall, falling leaves, rising hearts, ...).
   * @defaultValue false
   */
  ambient?: boolean;
  /**
   * Decorations on elements marked with `data-season-decor`.
   * @defaultValue false
   */
  decorations?: boolean;
  /**
   * Hidden surprises: click frenzy, Konami code, secret words, rare fly-bys.
   * @defaultValue false
   */
  easterEggs?: boolean;
  /**
   * Full page theme. `true` turns on every part (light tokens), an object picks
   * parts and dark mode handling.
   * @defaultValue false
   */
  theme?: boolean | SeasonThemeOptions;
}

/**
 * The end user's fine-tuning preferences. Every feature flag defaults to `true`,
 * meaning "allowed if the developer enabled it".
 */
export interface SeasonPreferences {
  /**
   * Effect strength.
   * @defaultValue `'normal'`
   */
  intensity: SeasonIntensity;
  /** Click bursts. */
  clicks: boolean;
  /** Hover bursts. */
  hover: boolean;
  /** Background effect. */
  ambient: boolean;
  /** Element decorations. */
  decorations: boolean;
  /** Hidden surprises. */
  easterEggs: boolean;
  /** Page theme. */
  theme: boolean;
}

/** Names of the features a user can turn off. */
export type SeasonFeatureName = Exclude<keyof SeasonPreferences, 'intensity'>;
