import { ParticleEngine } from '../engine/ParticleEngine';
import type { DecorationTarget } from '../engine/ParticleEngine';
import { builtInSeasons, getActiveSeason } from '../seasons';
import { buildThemeCss, resolveThemeOptions } from '../theme/buildThemeCss';
import type {
  DecorationSlot,
  ParticleConfig,
  SeasonDefinition,
  SeasonFeatureName,
  SeasonFeatures,
  SeasonPreferences,
} from '../types';
import { DEFAULT_PREFERENCES, DEFAULT_SELECTOR, DEFAULT_STORAGE_KEY, INTENSITY_SCALE } from './constants';

/**
 * Options of the season feature. Used by `<SeasonProvider>` (as props), by
 * `SeasonFX.init()` in the script-tag build, and by {@link SeasonController}.
 */
export interface SeasonOptions {
  /**
   * Master switch, **controlled mode.** When set, this is the single source of
   * truth: nothing is persisted, changes are reported through
   * {@link SeasonOptions.onEnabledChange}, and the app must pass the new value back.
   *
   * @remarks
   * Use it when the setting lives in the user's profile (backend).
   */
  enabled?: boolean;

  /**
   * Master switch, **uncontrolled mode.** The initial state while the user has
   * not touched the toggle yet (no saved value in `localStorage`).
   *
   * @remarks
   * Reactive: if the app passes a different value later (e.g. after the user
   * has loaded), it takes effect as long as the user has not set the toggle
   * themselves. Has no effect in controlled mode (`enabled` set).
   *
   * @defaultValue false
   */
  defaultEnabled?: boolean;

  /**
   * Called when the master switch changes (both modes).
   * @param enabled - The new value.
   */
  onEnabledChange?: (enabled: boolean) => void;

  /**
   * The features the developer makes available. Only `clicks` is on by default;
   * everything else (hover, ambient, decorations, easter eggs, theme) must be
   * turned on here explicitly.
   *
   * @example
   * ```ts
   * features: { hover: true, ambient: true, decorations: true, easterEggs: true, theme: true }
   * ```
   */
  features?: SeasonFeatures;

  /**
   * User preferences, **controlled mode.** When set, preferences are not saved;
   * changes are reported through `onPreferencesChange`. Missing keys fall back to
   * `defaultPreferences`, then {@link DEFAULT_PREFERENCES}.
   */
  preferences?: Partial<SeasonPreferences>;

  /**
   * User preferences, **uncontrolled mode.** Defaults used until the user
   * changes them (saved in `localStorage`).
   * @defaultValue {@link DEFAULT_PREFERENCES}
   */
  defaultPreferences?: Partial<SeasonPreferences>;

  /**
   * Called when the user changes a preference (both modes).
   * @param preferences - The full, updated preferences.
   */
  onPreferencesChange?: (preferences: SeasonPreferences) => void;

  /**
   * `localStorage` key prefix used in uncontrolled mode. `false` disables saving,
   * so the defaults apply on every page load.
   *
   * @defaultValue `'seasonfx'`
   */
  storageKey?: string | false;

  /**
   * Candidate seasons, in priority order. Define the array outside of render
   * (or memoize it); it is compared by season `id`.
   * @defaultValue {@link builtInSeasons}
   */
  seasons?: readonly SeasonDefinition[];

  /**
   * Forces a season regardless of the date. For testing or custom logic
   * (e.g. the server decides the season).
   *
   * - `undefined` (default): picked by date.
   * - `string`: the season with this `id` in `seasons` (or the built-ins).
   * - {@link SeasonDefinition}: exactly this season.
   * - `null`: no season (everything off).
   */
  season?: string | SeasonDefinition | null;

  /**
   * Overrides the date used to pick the season (for testing).
   * When omitted, the current local date is used and re-evaluated at midnight.
   */
  date?: Date;

  /**
   * CSS selector: clicking or hovering matching elements (or their descendants)
   * triggers an effect. For example `'*'` for every click, or
   * `DEFAULT_SELECTOR + ', a'` to include links.
   *
   * @remarks
   * To exclude elements, add the `data-seasonfx-ignore` attribute
   * (it also applies to all descendants).
   *
   * @defaultValue {@link DEFAULT_SELECTOR}
   */
  selector?: string;

  /**
   * When `true` and the user's system requests reduced motion
   * (`prefers-reduced-motion: reduce`), no moving effects run. The theme and
   * decorations still work.
   * @defaultValue true
   */
  respectReducedMotion?: boolean;

  /**
   * `z-index` of the effects canvas layer.
   * @defaultValue 2147483000
   */
  zIndex?: number;

  /**
   * When `true`, a `data-seasonfx="<id>"` attribute is set on `<html>` while the
   * feature is active. It changes nothing visually by itself; it only lets you
   * write your own seasonal CSS (e.g. `html[data-seasonfx="christmas"] .logo { ... }`).
   *
   * @defaultValue false
   */
  exposeAttribute?: boolean;
}

/** The features the developer made available, resolved with defaults. */
export type ResolvedFeatures = Required<Omit<SeasonFeatures, 'theme'>> & { theme: SeasonFeatures['theme'] };

/** A snapshot of the season feature's state. */
export interface SeasonState {
  /**
   * The current season, picked by date (or forced by the `season` option).
   * `null` when no season is active.
   *
   * @remarks
   * Independent of whether the user turned the feature on. Always `null` before
   * the controller starts (on the server and on the first client render), unless
   * the `date` or `season` option is set.
   */
  season: SeasonDefinition | null;
  /** Whether the user turned the season feature on (the master switch). */
  enabled: boolean;
  /** `true` when a season is active and the master switch is on. */
  active: boolean;
  /**
   * `true` when the user's system requests reduced motion and it is respected.
   * Motion features (clicks, hover, ambient, easter eggs) are then off; the theme
   * and decorations still work because they do not move.
   */
  reducedMotion: boolean;
  /** The features the developer made available (resolved with defaults). */
  features: ResolvedFeatures;
  /** The user's fine-tuning preferences (resolved with defaults). */
  preferences: SeasonPreferences;
  /**
   * Which features are running right now: made available by the developer,
   * allowed by the user, a season is active, the master switch is on, and
   * (for motion features) reduced motion is not requested.
   */
  running: Record<SeasonFeatureName, boolean>;
}

/** Where a celebration starts: an element's center, a viewport point, or the screen center when omitted. */
export type CelebrateTarget = Element | { x: number; y: number };

interface Effect {
  key: string;
  cleanup?: () => void;
}

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const FRENZY_CLICKS = 8;
const FRENZY_WINDOW_MS = 2500;
const BOOST_MS = 10000;
const FLYBY_DELAY_S: [number, number] = [45, 150];
const HOVER_THROTTLE_MS = 350;
const SLOTS: DecorationSlot[] = ['hat', 'edge', 'corner'];
const FEATURE_NAMES: SeasonFeatureName[] = ['clicks', 'hover', 'ambient', 'decorations', 'easterEggs', 'theme'];

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage: the setting only lasts for this session
  }
}

function msUntilNextMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

function centerOf(element: Element): [number, number] {
  const rect = element.getBoundingClientRect();
  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}

function isEditable(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName);
}

function closestMatch(target: EventTarget | null, selector: string): Element | null {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return null;
  let match: Element | null;
  try {
    match = target.closest(selector);
  } catch {
    return null; // invalid selector
  }
  if (!match || match.closest('[data-seasonfx-ignore]')) return null;
  return match;
}

function hoverConfig(season: SeasonDefinition): ParticleConfig {
  if (season.hover) return season.hover;
  const p = season.particles;
  const [sMin, sMax] = p.size ?? [8, 16];
  return {
    ...p,
    count: 3,
    size: [sMin * 0.6, sMax * 0.6],
    speed: [20, 70],
    lifetime: [0.5, 0.9],
    gravity: (p.gravity ?? 300) * 0.4,
  };
}

function celebrationConfig(season: SeasonDefinition): ParticleConfig {
  const p = season.particles;
  const [vMin, vMax] = p.speed ?? [80, 260];
  return { ...p, count: Math.round((p.count ?? 14) * 2.5), speed: [vMin * 1.3, vMax * 1.5], spread: Math.PI * 2 };
}

/**
 * The framework-agnostic core of SeasonFX. `<SeasonProvider>` and the
 * script-tag build (`SeasonFX.init()`) are thin wrappers around it.
 *
 * @remarks
 * Lifecycle:
 * - `new SeasonController(options)` has no side effects (safe on the server).
 * - {@link SeasonController.start} reads storage and the date, attaches listeners
 *   and applies the features. The theme is applied synchronously, so calling
 *   `start()` before the first paint avoids a flash of the unthemed page.
 * - {@link SeasonController.update} replaces the options (e.g. on every React render).
 * - {@link SeasonController.stop} detaches everything; `start()` can be called again.
 *
 * Read the state with {@link SeasonController.getState} and listen for changes
 * with {@link SeasonController.subscribe}.
 *
 * @example Plain JavaScript
 * ```ts
 * const season = new SeasonController({ defaultEnabled: true, features: { ambient: true } });
 * season.start();
 * document.querySelector('#holiday-toggle')?.addEventListener('click', () => season.toggle());
 * ```
 */
export class SeasonController {
  private options: SeasonOptions;
  private started = false;
  private storedEnabled: boolean | null = null;
  private storedPrefs: Partial<SeasonPreferences> | null = null;
  private now: Date | null = null;
  private prefersReduced = false;
  private boost = false;
  private boostTimer: ReturnType<typeof setTimeout> | undefined;
  private engine: ParticleEngine | null = null;
  private engineGen = 0;
  private pending: Element | null = null;
  private state: SeasonState;
  private listeners = new Set<() => void>();
  private effects = new Map<string, Effect>();
  private applying = false;
  private again = false;

  /** @param options - Initial options. */
  constructor(options: SeasonOptions = {}) {
    this.options = options;
    this.state = this.compute(null);
  }

  /** Returns the current state snapshot. The object only changes when the state changes. */
  getState = (): SeasonState => this.state;

  /**
   * Registers a listener called after every state change.
   * @param listener - The callback.
   * @returns A function that removes the listener.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Replaces the options and re-applies the features. Cheap to call often.
   * @param options - The new options (not merged with the previous ones).
   */
  update = (options: SeasonOptions): void => {
    this.options = options;
    this.refresh();
  };

  /**
   * Merges some options into the current ones and re-applies the features.
   * @param patch - The options to change, e.g. `{ season: 'halloween' }`.
   *
   * @example
   * ```ts
   * season.setOptions({ features: { ...season.getOptions().features, ambient: false } });
   * ```
   */
  setOptions = (patch: Partial<SeasonOptions>): void => {
    this.update({ ...this.options, ...patch });
  };

  /** Returns the current options. */
  getOptions = (): SeasonOptions => this.options;

  /** Reads storage and the date, attaches listeners and applies the features. Browser only. */
  start = (): void => {
    if (this.started || !isBrowser()) return;
    this.started = true;
    // Remove what the early <head> script (getSeasonScript) applied; the theme effect re-applies it synchronously.
    document.querySelectorAll('style[data-seasonfx-early]').forEach((el) => el.remove());
    document.documentElement.removeAttribute('data-seasonfx-theme');
    if (!document.body) document.addEventListener('DOMContentLoaded', this.refresh, { once: true });
    this.refresh();
  };

  /** Detaches every listener, removes the canvas, styles and attributes. `start()` may be called again. */
  stop = (): void => {
    if (!this.started) return;
    this.started = false;
    document.removeEventListener('DOMContentLoaded', this.refresh);
    const names = Array.from(this.effects.keys()).reverse();
    for (const name of names) this.effects.get(name)?.cleanup?.();
    this.effects.clear();
    clearTimeout(this.boostTimer);
    this.boost = false;
    this.pending = null;
  };

  /**
   * Turns the season feature on or off (master switch). Calls `onEnabledChange`.
   * @param enabled - The new value.
   */
  setEnabled = (enabled: boolean): void => {
    if (this.options.enabled === undefined) {
      this.storedEnabled = enabled;
      const key = this.storageKey();
      if (key) writeStorage(`${key}:enabled`, enabled ? '1' : '0');
    }
    this.options.onEnabledChange?.(enabled);
    this.refresh();
  };

  /** Flips the master switch. */
  toggle = (): void => this.setEnabled(!this.state.enabled);

  /**
   * Updates some of the user's preferences. Calls `onPreferencesChange` with the full result.
   * @param patch - The preferences to change.
   */
  setPreferences = (patch: Partial<SeasonPreferences>): void => {
    const next = { ...this.state.preferences, ...patch };
    if (this.options.preferences === undefined) {
      this.storedPrefs = { ...(this.storedPrefs ?? {}), ...patch };
      const key = this.storageKey();
      if (key) writeStorage(`${key}:preferences`, JSON.stringify(this.storedPrefs));
    }
    this.options.onPreferencesChange?.(next);
    this.refresh();
  };

  /**
   * Starts a particle burst at viewport coordinates. Does nothing unless the
   * feature is active and reduced motion is not requested.
   * @param x - Horizontal position (`clientX`).
   * @param y - Vertical position (`clientY`).
   */
  burst = (x: number, y: number): void => {
    const s = this.state.season;
    if (this.engine && s && this.motion()) this.engine.burst(x, y, s.particles, this.scale());
  };

  /**
   * Starts a particle burst at the center of an element. Same conditions as `burst`.
   * @param element - The element the burst starts from.
   */
  burstAt = (element: Element): void => {
    const [x, y] = centerOf(element);
    this.burst(x, y);
  };

  /**
   * A big celebration: several large bursts in a row. Same conditions as `burst`.
   * @param target - Element or point to start from. The screen center when omitted.
   */
  celebrate = (target?: CelebrateTarget): void => {
    const s = this.state.season;
    if (!this.engine || !s || !this.motion()) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (target instanceof Element) [x, y] = centerOf(target);
    else if (target) ({ x, y } = target);
    const cfg = celebrationConfig(s);
    const k = this.scale();
    this.engine.burst(x, y, cfg, k);
    setTimeout(() => this.engine?.burst(x - 70, y + 20, cfg, k * 0.6), 180);
    setTimeout(() => this.engine?.burst(x + 70, y + 20, cfg, k * 0.6), 360);
  };

  /**
   * Makes a toggle out of any element: clicking it flips the master switch.
   * The element gets `role="switch"` (unless it is a checkbox), `aria-checked`,
   * `data-seasonfx-enabled` and `data-seasonfx-ignore`, kept in sync with the state.
   *
   * @param element - The element to bind (e.g. a button in the site's own style).
   * @returns A function that unbinds it.
   *
   * @example
   * ```ts
   * season.bindToggle(document.querySelector('#holiday-toggle')!);
   * ```
   */
  bindToggle = (element: HTMLElement): (() => void) => {
    const isCheckbox = element instanceof HTMLInputElement && element.type === 'checkbox';
    if (!isCheckbox && !element.hasAttribute('role')) element.setAttribute('role', 'switch');
    element.setAttribute('data-seasonfx-ignore', '');
    const sync = () => {
      const { enabled, season } = this.state;
      if (isCheckbox) (element as HTMLInputElement).checked = enabled;
      else element.setAttribute('aria-checked', String(enabled));
      element.setAttribute('data-seasonfx-enabled', String(enabled));
      if (season) element.setAttribute('data-seasonfx', season.id);
      else element.removeAttribute('data-seasonfx');
    };
    const onClick = () => {
      const next = !this.state.enabled;
      this.setEnabled(next);
      if (next) this.queueBurst(element);
    };
    sync();
    element.addEventListener('click', onClick);
    const unsubscribe = this.subscribe(sync);
    return () => {
      element.removeEventListener('click', onClick);
      unsubscribe();
    };
  };

  /**
   * @internal
   * Requests a burst from an element once effects are running (used by toggles
   * right after they turn the feature on).
   */
  queueBurst = (element: Element): void => {
    this.pending = element;
    this.flushPending();
  };

  // state

  private storageKey(): string | false {
    return this.options.storageKey ?? DEFAULT_STORAGE_KEY;
  }

  private motion(): boolean {
    return this.state.active && !this.state.reducedMotion;
  }

  private scale(): number {
    return INTENSITY_SCALE[this.state.preferences.intensity] ?? 1;
  }

  private resolveSeason(): SeasonDefinition | null {
    const o = this.options;
    const seasons = o.seasons ?? builtInSeasons;
    if (o.season === null) return null;
    if (typeof o.season === 'object') return o.season;
    if (typeof o.season === 'string') {
      const id = o.season;
      return seasons.find((s) => s.id === id) ?? builtInSeasons.find((s) => s.id === id) ?? null;
    }
    const d = o.date ?? this.now;
    return d ? getActiveSeason(d, seasons) : null;
  }

  private compute(prev: SeasonState | null): SeasonState {
    const o = this.options;
    const enabled = o.enabled !== undefined ? !!o.enabled : this.storedEnabled ?? !!o.defaultEnabled;
    const preferences: SeasonPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(o.defaultPreferences ?? {}),
      ...(o.preferences !== undefined ? o.preferences : this.storedPrefs ?? {}),
    };
    const f = o.features ?? {};
    const features: ResolvedFeatures = {
      clicks: f.clicks ?? true,
      hover: !!f.hover,
      ambient: !!f.ambient,
      decorations: !!f.decorations,
      easterEggs: !!f.easterEggs,
      theme: f.theme ?? false,
    };
    const season = this.resolveSeason();
    const reducedMotion = (o.respectReducedMotion ?? true) && this.prefersReduced;
    const active = season !== null && enabled;
    const motion = active && !reducedMotion;
    const running: Record<SeasonFeatureName, boolean> = {
      clicks: motion && features.clicks && preferences.clicks,
      hover: motion && features.hover && preferences.hover,
      ambient: motion && features.ambient && preferences.ambient && !!season?.ambient,
      easterEggs: motion && features.easterEggs && preferences.easterEggs,
      decorations: active && features.decorations && preferences.decorations && !!season?.decorations,
      theme: active && !!features.theme && preferences.theme,
    };

    if (!prev) return { season, enabled, active, reducedMotion, features, preferences, running };

    const same = <T,>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);
    const next: SeasonState = {
      season: prev.season?.id === season?.id ? prev.season : season,
      enabled,
      active,
      reducedMotion,
      features: same(prev.features, features) ? prev.features : features,
      preferences: same(prev.preferences, preferences) ? prev.preferences : preferences,
      running: FEATURE_NAMES.every((n) => prev.running[n] === running[n]) ? prev.running : running,
    };
    const changed =
      next.season !== prev.season ||
      next.enabled !== prev.enabled ||
      next.active !== prev.active ||
      next.reducedMotion !== prev.reducedMotion ||
      next.features !== prev.features ||
      next.preferences !== prev.preferences ||
      next.running !== prev.running;
    return changed ? next : prev;
  }

  private refresh = (): void => {
    if (this.applying) {
      this.again = true;
      return;
    }
    const before = this.state;
    let guard = 0;
    do {
      this.again = false;
      this.state = this.compute(this.state);
      if (this.started) {
        this.applying = true;
        try {
          this.applyEffects();
        } finally {
          this.applying = false;
        }
      }
    } while (this.again && ++guard < 5);
    if (this.state !== before) this.listeners.forEach((l) => l());
  };

  // effects

  /** Runs `run` when `key` changes (cleaning up the previous run); `null` stops the effect. */
  private effect(name: string, key: string | null, run: () => (() => void) | void): void {
    const current = this.effects.get(name);
    if (current && current.key === key) return;
    if (current) {
      this.effects.delete(name);
      current.cleanup?.();
    }
    if (key === null) return;
    const cleanup = run() || undefined;
    this.effects.set(name, { key, cleanup });
  }

  private flushPending(): void {
    if (!this.pending) return;
    if (!this.state.active) {
      this.pending = null;
      return;
    }
    if (!this.engine || !this.motion()) return;
    const el = this.pending;
    this.pending = null;
    if (el.isConnected) this.burstAt(el);
  }

  private surprise = (): void => {
    const s = this.state.season;
    this.celebrate();
    if (s?.flyby) this.engine?.flyby(s.flyby);
    this.boost = true;
    clearTimeout(this.boostTimer);
    this.boostTimer = setTimeout(() => {
      this.boost = false;
      this.refresh();
    }, BOOST_MS);
    this.refresh();
  };

  private applyEffects(): void {
    const o = this.options;
    const s = this.state;
    const season = s.season;
    const hasBody = !!document.body;
    const motion = s.active && !s.reducedMotion;
    const selector = o.selector ?? DEFAULT_SELECTOR;
    const storageKey = this.storageKey();

    // stored values (uncontrolled mode)
    const storageMode = `${storageKey}|${o.enabled === undefined}|${o.preferences === undefined}`;
    this.effect('storage', storageKey ? storageMode : null, () => {
      const key = storageKey as string;
      const load = () => {
        const enabled = readStorage(`${key}:enabled`);
        this.storedEnabled = enabled === '1' ? true : enabled === '0' ? false : null;
        const prefs = readStorage(`${key}:preferences`);
        try {
          const parsed: unknown = prefs ? JSON.parse(prefs) : null;
          this.storedPrefs = parsed && typeof parsed === 'object' ? (parsed as Partial<SeasonPreferences>) : null;
        } catch {
          this.storedPrefs = null;
        }
      };
      load();
      this.refresh();
      const onStorage = (e: StorageEvent) => {
        if (e.key && e.key.startsWith(`${key}:`)) {
          load();
          this.refresh();
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    });

    // clock: pick the season from today's date, re-check at midnight
    this.effect('clock', o.date || o.season !== undefined ? null : 'on', () => {
      this.now = new Date();
      this.refresh();
      let timer: ReturnType<typeof setTimeout>;
      const schedule = () => {
        timer = setTimeout(() => {
          this.now = new Date();
          this.refresh();
          schedule();
        }, msUntilNextMidnight());
      };
      schedule();
      return () => clearTimeout(timer);
    });

    // prefers-reduced-motion
    const respect = o.respectReducedMotion ?? true;
    this.effect('motion', respect && typeof window.matchMedia === 'function' ? 'on' : null, () => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => {
        this.prefersReduced = mq.matches;
        this.refresh();
      };
      update();
      mq.addEventListener?.('change', update);
      return () => {
        mq.removeEventListener?.('change', update);
        this.prefersReduced = false;
      };
    });

    // page theme (needs only <head>, so it applies even before <body> exists)
    const themeOptions = s.running.theme && season ? resolveThemeOptions(s.features.theme) : null;
    const css = themeOptions && season ? buildThemeCss(season, themeOptions) : null;
    this.effect('theme', css && season ? `${season.id}|${css}` : null, () => {
      const style = document.createElement('style');
      style.setAttribute('data-seasonfx-style', season!.id);
      style.textContent = css;
      document.head.appendChild(style);
      const root = document.documentElement;
      root.setAttribute('data-seasonfx-theme', season!.id);
      return () => {
        style.remove();
        root.removeAttribute('data-seasonfx-theme');
      };
    });

    // optional data-seasonfx attribute
    this.effect('expose', o.exposeAttribute && s.active && season ? season.id : null, () => {
      const root = document.documentElement;
      root.setAttribute('data-seasonfx', season!.id);
      return () => root.removeAttribute('data-seasonfx');
    });

    // effects engine (canvas layer)
    this.effect('engine', s.active && hasBody ? `z${o.zIndex ?? ''}` : null, () => {
      const engine = new ParticleEngine({ zIndex: o.zIndex });
      this.engine = engine;
      this.engineGen++;
      return () => {
        engine.destroy();
        if (this.engine === engine) this.engine = null;
      };
    });
    const engine = this.engine;
    const gen = this.engineGen;
    this.flushPending();

    // click listener (bursts and click frenzy)
    this.effect('clicks', engine && (s.running.clicks || s.running.easterEggs) ? `${gen}|${selector}` : null, () => {
      let clicks: number[] = [];
      const onClick = (e: MouseEvent) => {
        const match = closestMatch(e.target, selector);
        if (!match) return;
        // Keyboard activation (Enter/Space) has no pointer position.
        let x = e.clientX;
        let y = e.clientY;
        if (e.detail === 0 && x === 0 && y === 0) [x, y] = centerOf(match);
        if (this.state.running.clicks) this.burst(x, y);
        if (this.state.running.easterEggs) {
          const t = performance.now();
          clicks = clicks.filter((c) => t - c < FRENZY_WINDOW_MS);
          clicks.push(t);
          if (clicks.length >= FRENZY_CLICKS) {
            clicks = [];
            this.celebrate({ x, y });
          }
        }
      };
      document.addEventListener('click', onClick, { capture: true, passive: true });
      return () => document.removeEventListener('click', onClick, { capture: true });
    });

    // hover listener
    this.effect('hover', engine && s.running.hover ? `${gen}|${selector}` : null, () => {
      const last = new WeakMap<Element, number>();
      const onOver = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const match = closestMatch(e.target, selector);
        if (!match) return;
        const related = e.relatedTarget;
        if (related instanceof Node && match.contains(related)) return;
        const t = performance.now();
        if (t - (last.get(match) ?? -Infinity) < HOVER_THROTTLE_MS) return;
        last.set(match, t);
        const current = this.state.season;
        if (current) this.engine?.burst(e.clientX, e.clientY, hoverConfig(current), this.scale());
      };
      document.addEventListener('pointerover', onOver, { capture: true, passive: true });
      return () => document.removeEventListener('pointerover', onOver, { capture: true });
    });

    // ambient background effect (also used by the surprise boost)
    const ambientOn = engine && season?.ambient && (s.running.ambient || (this.boost && motion));
    const boostScale = this.boost ? 4 : 1;
    this.effect('ambient', ambientOn ? `${gen}|${season!.id}|${this.scale() * boostScale}` : null, () => {
      engine!.setAmbient(season!.ambient!, this.scale() * boostScale);
      return () => engine!.setAmbient(null);
    });

    // decorations
    const drawers = season?.decorations;
    this.effect('decor', engine && hasBody && s.running.decorations && drawers ? `${gen}|${season!.id}` : null, () => {
      const scan = () => {
        const targets: DecorationTarget[] = [];
        document.querySelectorAll('[data-seasonfx-decor]').forEach((element) => {
          const value = (element.getAttribute('data-seasonfx-decor') || 'hat').toLowerCase();
          for (const slot of value.split(/\s+/)) {
            const draw = SLOTS.includes(slot as DecorationSlot) ? drawers![slot as DecorationSlot] : undefined;
            if (draw) targets.push({ element, slot: slot as DecorationSlot, draw });
          }
        });
        engine!.setDecorations(targets);
      };
      scan();
      let scanTimer: ReturnType<typeof setTimeout> | undefined;
      const observer = new MutationObserver(() => {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(scan, 100);
      });
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-seasonfx-decor'],
      });
      let frame = 0;
      const refreshDecor = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          engine!.refreshDecorations();
        });
      };
      document.addEventListener('scroll', refreshDecor, { capture: true, passive: true });
      window.addEventListener('resize', refreshDecor);
      const poll = setInterval(refreshDecor, 1000);
      return () => {
        observer.disconnect();
        clearTimeout(scanTimer);
        cancelAnimationFrame(frame);
        clearInterval(poll);
        document.removeEventListener('scroll', refreshDecor, { capture: true });
        window.removeEventListener('resize', refreshDecor);
        engine!.setDecorations([]);
      };
    });

    // hidden surprises: Konami code, secret word, rare fly-bys
    this.effect('eggs', engine && s.running.easterEggs ? `${gen}` : null, () => {
      let konami = 0;
      let typed = '';
      const onKey = (e: KeyboardEvent) => {
        if (isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
        const key = e.key.toLowerCase();
        konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
        if (konami === KONAMI.length) {
          konami = 0;
          this.surprise();
          return;
        }
        if (/^[a-z]$/.test(key)) {
          typed = (typed + key).slice(-24);
          const secret = this.state.season?.secret?.toLowerCase();
          if (secret && typed.endsWith(secret)) {
            typed = '';
            this.surprise();
          }
        }
      };
      document.addEventListener('keydown', onKey, { passive: true });
      let timer: ReturnType<typeof setTimeout>;
      const schedule = () => {
        const [min, max] = FLYBY_DELAY_S;
        timer = setTimeout(() => {
          const flyby = this.state.season?.flyby;
          if (flyby && document.visibilityState === 'visible') this.engine?.flyby(flyby);
          schedule();
        }, (min + Math.random() * (max - min)) * 1000);
      };
      schedule();
      return () => {
        document.removeEventListener('keydown', onKey);
        clearTimeout(timer);
      };
    });
  }
}
