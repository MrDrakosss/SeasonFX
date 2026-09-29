import { DEFAULT_PREFERENCES, DEFAULT_STORAGE_KEY } from '../core/constants';
import type { SeasonOptions } from '../core/SeasonController';
import { builtInSeasons } from '../seasons';
import type { SeasonRange } from '../seasons/dates';
import { buildThemeCss, resolveThemeOptions } from '../theme/buildThemeCss';
import type { SeasonDefinition } from '../types';

/**
 * The options the early script understands: the same as the Provider's, so you
 * can pass one shared config object to both.
 */
export type SeasonScriptOptions = Pick<
  SeasonOptions,
  'enabled' | 'defaultEnabled' | 'preferences' | 'defaultPreferences' | 'storageKey' | 'seasons' | 'season' | 'date' | 'features'
>;

interface ScriptConfig {
  /** storage key prefix, or false */
  k: string | false;
  /** controlled master switch, or null */
  e: boolean | null;
  /** default master switch */
  d: boolean;
  /** controlled theme preference, or null */
  tp: boolean | null;
  /** default theme preference */
  dtp: boolean;
  /** 1 when the season is picked by date */
  a: 0 | 1;
  /** forced season id (when a = 0) */
  f: string | null;
  /** fixed date in ms, or null */
  t: number | null;
  /** seasons in priority order: id plus range, or n = 1 when not serializable */
  s: Array<{ id: string; r?: [number, number]; x?: [number, number]; n?: 1 }>;
  /** theme CSS by season id */
  c: Record<string, string>;
}

// Plain ES5 on purpose: it runs before any bundle, in every browser.
const RUNTIME = `function(c){try{
var d=document.documentElement,st=null;
function get(k){try{return window.localStorage.getItem(k)}catch(e){return null}}
var en=c.e;if(en===null){var v=c.k?get(c.k+':enabled'):null;en=v==='1'?true:v==='0'?false:c.d}
if(!en)return;
var tp=c.tp;if(tp===null){tp=c.dtp;var p=c.k?get(c.k+':preferences'):null;if(p){try{var o=JSON.parse(p);if(o&&typeof o.theme==='boolean')tp=o.theme}catch(e){}}}
if(!tp)return;
function easter(y){var a=y%19,b=Math.floor(y/100),cc=y%100,dd=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-dd-g+15)%30,i=Math.floor(cc/4),k=cc%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function match(s,n){if(s.r){var md=(n.getMonth()+1)*100+n.getDate();return s.r[0]<=s.r[1]?(md>=s.r[0]&&md<=s.r[1]):(md>=s.r[0]||md<=s.r[1])}
if(s.x){var E=easter(n.getFullYear()),day=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime();return day>=new Date(E.getFullYear(),E.getMonth(),E.getDate()-s.x[0]).getTime()&&day<=new Date(E.getFullYear(),E.getMonth(),E.getDate()+s.x[1]).getTime()}
return null}
var id=c.f;
if(c.a){id=null;var now=c.t?new Date(c.t):new Date();for(var j=0;j<c.s.length;j++){var m=match(c.s[j],now);if(m===null)return;if(m){id=c.s[j].id;break}}}
if(!id||!c.c[id])return;
st=document.createElement('style');st.setAttribute('data-seasonfx-early','');st.textContent=c.c[id];
(document.head||d).appendChild(st);d.setAttribute('data-seasonfx-theme',id);
}catch(e){}}`;

function rangeOf(season: SeasonDefinition): { r?: [number, number]; x?: [number, number]; n?: 1 } {
  const range = (season.isActive as { seasonRange?: SeasonRange }).seasonRange;
  if (range?.kind === 'date') return { r: [range.from, range.to] };
  if (range?.kind === 'easter') return { x: [range.before, range.after] };
  return { n: 1 };
}

/**
 * Builds the inline script that applies the page theme before the first paint.
 *
 * @remarks
 * Only needed with server rendering (Next.js, Remix, Astro, a PHP template, ...):
 * the HTML is painted before the JavaScript bundle runs, so without this script
 * the page would first show without the theme. Put the result in a `<script>`
 * tag in `<head>`. In React, use `<SeasonScript />` instead.
 *
 * The script reads the same `localStorage` keys as the Provider, evaluates the
 * season rules made with `dateRange` / `easterRange` in the visitor's local time,
 * and injects the matching theme CSS. When the Provider starts, it takes over
 * and removes the early style.
 *
 * Returns an empty string when the theme feature is off. Seasons with a custom
 * `isActive` function cannot be evaluated early; if such a season comes first
 * in priority, the script does nothing and the theme appears after hydration.
 *
 * Size: the CSS of every candidate season is embedded (roughly 5 to 8 KB each).
 * Pass a shorter `seasons` list to reduce it.
 *
 * @param options - The same options as the Provider (only the ones listed in {@link SeasonScriptOptions} matter).
 * @returns The script body (without the `<script>` tag), safe to inline in HTML.
 *
 * @example Any server template
 * ```ts
 * const html = `<head><script>${getSeasonScript(config)}</script></head>`;
 * ```
 */
export function getSeasonScript(options: SeasonScriptOptions = {}): string {
  const themeOptions = resolveThemeOptions(options.features?.theme);
  if (!themeOptions) return '';

  const seasons = options.seasons ?? builtInSeasons;
  let forced: SeasonDefinition | null = null;
  if (options.season === null) return '';
  if (typeof options.season === 'object') forced = options.season;
  else if (typeof options.season === 'string') {
    const id = options.season;
    forced = seasons.find((s) => s.id === id) ?? builtInSeasons.find((s) => s.id === id) ?? null;
    if (!forced) return '';
  }

  const list = forced ? [forced] : [...seasons];
  const css: Record<string, string> = {};
  for (const s of list) css[s.id] = buildThemeCss(s, themeOptions);

  const prefs = { ...DEFAULT_PREFERENCES, ...(options.defaultPreferences ?? {}) };
  const config: ScriptConfig = {
    k: options.storageKey ?? DEFAULT_STORAGE_KEY,
    e: options.enabled === undefined ? null : !!options.enabled,
    d: !!options.defaultEnabled,
    tp: options.preferences === undefined ? null : options.preferences.theme ?? prefs.theme,
    dtp: prefs.theme,
    a: forced ? 0 : 1,
    f: forced ? forced.id : null,
    t: options.date ? options.date.getTime() : null,
    s: forced ? [] : list.map((s) => ({ id: s.id, ...rangeOf(s) })),
    c: css,
  };

  // Escape "<" so the JSON can never close the surrounding <script> tag.
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  return `(${RUNTIME})(${json});`;
}
