# SeasonFX

Non-invasive, **opt-in** seasonal (holiday) effects and page themes for React sites.

During a season (Christmas, New Year, Valentine's Day, Easter, Halloween, or your own),
SeasonFX can add click and hover particles, a background effect (snowfall, falling leaves,
rising hearts), decorations on elements (a Santa hat on the logo, a spider web on a card),
hidden surprises, and a full seasonal page theme with custom button looks. It only does so
**if the developer enables the feature and the user turns it on**.

- **Adds, never breaks:** without the theme feature it adds no CSS at all. Effects are
  drawn on a separate, transparent, click-through canvas layer. The theme only changes
  colors, backgrounds, shadows and corner radius, never sizes, spacing or layout.
- **Existing markup stays as it is:** one global listener watches clicks; decorations are
  requested with a single attribute.
- **Two levels of control:** the developer picks the available features in the Provider,
  the user turns everything on or off and fine-tunes intensity and individual features.
- **Zero cost** when off or out of season: no canvas, no listeners, no styles.
- **Light and dark:** every theme has dark tokens that follow your site's dark mode.
- **No flash:** the theme is applied before the first paint, also with server rendering.
- **React or not:** a React API, and a script-tag build (`window.SeasonFX`) for any site.
- Respects `prefers-reduced-motion`, works with SSR / Next.js (`"use client"`), ships
  TypeScript types with full TSDoc, and has no dependencies besides `react`.

---

## Contents

1. [Installation](#1-installation)
2. [Quick integration](#2-quick-integration)
3. [How it works](#3-how-it-works)
4. [Features overview](#4-features-overview)
5. [State: master switch and preferences](#5-state-master-switch-and-preferences)
6. [Settings UI: `<SeasonSettings>`](#6-settings-ui-seasonsettings)
7. [The toggle: `<SeasonButton>`](#7-the-toggle-seasonbutton)
8. [The `useSeason()` hook](#8-the-useseason-hook)
9. [Click and hover effects](#9-click-and-hover-effects)
10. [Background effect](#10-background-effect)
11. [Decorations](#11-decorations)
12. [Hidden surprises](#12-hidden-surprises)
13. [Page theme](#13-page-theme)
14. [Seasons (built-in and custom)](#14-seasons-built-in-and-custom)
15. [No flash on page load](#15-no-flash-on-page-load)
16. [Without React (script tag)](#16-without-react-script-tag)
17. [API reference](#17-api-reference)
18. [Recipes](#18-recipes)
19. [Guarantees and limitations](#19-guarantees-and-limitations)
20. [Troubleshooting](#20-troubleshooting)
21. [Development and generating API docs](#21-development-and-generating-api-docs)
22. [Integration checklist (for AI assistants)](#22-integration-checklist-for-ai-assistants)

---

## 1. Installation

The package is not on npm (yet). Install it from git; the `prepare` script builds it on install.

```bash
npm install github:MrDrakosss/SeasonFX
```

Requires `react >= 17`.

```ts
import { SeasonProvider, SeasonSettings, SeasonButton, useSeason } from 'seasonfx';
```

Not using React? See [16](#16-without-react-script-tag) for the script-tag build.

---

## 2. Quick integration

**Step 1:** wrap the app root in `SeasonProvider`, once, and pick the features you want
to offer:

```tsx
import { SeasonProvider } from 'seasonfx';

export function Root() {
  return (
    <SeasonProvider
      defaultEnabled={false}
      features={{ hover: true, ambient: true, decorations: true, easterEggs: true, theme: true }}
    >
      <App />
    </SeasonProvider>
  );
}
```

**Step 2:** give users a place to turn it on, e.g. the settings page:

```tsx
import { SeasonSettings } from 'seasonfx';

<SeasonSettings />
```

`<SeasonSettings>` shows the master switch, the intensity control and a checkbox for every
feature you enabled. If you only want the on/off switch, use `<SeasonButton />` instead.

**Step 3 (optional):** mark elements that should wear decorations:

```tsx
<a className="logo" data-seasonfx-decor="hat">Acme</a>
```

That is all. Existing buttons and styles stay unchanged until a season is active and the
user turns the feature on.

---

## 3. How it works

```
 date ------> active season? --+
                               +--> active = season && enabled
 user ------> master switch? --+
                                      |
 developer -> features={...}          |   feature runs = active
 user ------> preferences   ----------+                && features[x]
 OS --------> reduced motion?                          && preferences[x]
                                                       && (no reduced motion, for moving effects)
```

| State | What happens |
|---|---|
| No season | Nothing runs. The toggle is still shown (unless `hideWhenInactive`), so users can set it ahead of time. |
| Season, master switch off | Nothing runs: no listener, no canvas, no styles. |
| Season, master switch on | Every feature that the developer enabled and the user did not turn off runs. |
| `prefers-reduced-motion: reduce` | Moving effects (clicks, hover, background, surprises) are off. The theme and decorations still work. Can be disabled with `respectReducedMotion={false}`. |

The season is picked from the **local date** and re-evaluated automatically at midnight.

---

## 4. Features overview

| Feature (`features.x`) | Default | What it does | Touches the page? |
|---|---|---|---|
| `clicks` | on | Particle burst when a button is clicked | No, canvas layer only |
| `hover` | off | Small burst when the mouse enters a button | No, canvas layer only |
| `ambient` | off | Always-running background effect: snowfall, leaves, hearts, petals, glitter | No, canvas layer only |
| `decorations` | off | Hats, edges and corner pieces on elements with `data-seasonfx-decor` | No, canvas layer only |
| `easterEggs` | off | Hidden surprises: click frenzy, Konami code, secret word, rare fly-bys | No, canvas layer only |
| `theme` | off | Seasonal page theme, button skins, design tokens and component classes | Yes, a `<style>` tag while active |

Every feature can also be turned off by the user through their preferences.

---

## 5. State: master switch and preferences

There are two pieces of user state, and each can be stored by the module (uncontrolled)
or by your app (controlled):

| State | Uncontrolled props | Controlled props | Storage key (uncontrolled) |
|---|---|---|---|
| Master switch (`boolean`) | `defaultEnabled` | `enabled` + `onEnabledChange` | `seasonfx:enabled` (`"1"` / `"0"`) |
| Preferences (`SeasonPreferences`) | `defaultPreferences` | `preferences` + `onPreferencesChange` | `seasonfx:preferences` (JSON) |

`SeasonPreferences`:

```ts
{
  intensity: 'low' | 'normal' | 'high'; // multiplies particle counts and background density (0.5x / 1x / 1.8x)
  clicks: boolean;
  hover: boolean;
  ambient: boolean;
  decorations: boolean;
  easterEggs: boolean;
  theme: boolean;
}
// default: { intensity: 'normal', every feature true }
```

A preference set to `true` means "allowed if the developer enabled it". It never turns on a
feature that is missing from `features`.

### Uncontrolled (the module saves to `localStorage`)

```tsx
<SeasonProvider defaultEnabled={false} defaultPreferences={{ intensity: 'low' }}>
```

- Defaults apply until the user changes something; then the user's choice is saved and
  synced across browser tabs.
- `defaultEnabled` is **reactive**: if user data loads later and you pass a different value,
  it applies as long as the user has not set their own.
- `storageKey="myapp-season"` changes the key prefix; `storageKey={false}` disables saving.

### Controlled (your app stores it, e.g. in the user profile)

```tsx
<SeasonProvider
  enabled={user.settings.seasonEnabled}
  onEnabledChange={(v) => saveSettings({ seasonEnabled: v })}
  preferences={user.settings.seasonPreferences}
  onPreferencesChange={(p) => saveSettings({ seasonPreferences: p })}
>
```

- When `enabled` (or `preferences`) is set, only it counts; the module saves nothing for it.
- The callbacks receive the new value (for preferences, the full object). Your app stores it
  and passes it back. If it does not, the UI does not change (controlled component).
- You can mix: e.g. controlled master switch, uncontrolled preferences.

---

## 6. Settings UI: `<SeasonSettings>`

A ready-made panel: master switch with the current season, intensity (Low / Normal / High)
and one checkbox per feature that the developer enabled.

```tsx
<SeasonSettings />
<SeasonSettings showTitle />
<SeasonSettings labels={{ enabled: 'Unnepi effektek', intensity: 'Erosseg', low: 'Keves' }} />
<SeasonSettings unstyled className="my-settings" />
```

- `labels` replaces any text (all keys: `title`, `enabled`, `current`, `noSeason`,
  `intensity`, `low`, `normal`, `high`, `clicks`, `hover`, `ambient`, `decorations`,
  `easterEggs`, `theme`). Defaults are in `DEFAULT_SETTINGS_LABELS`.
- `unstyled` removes every inline style. Style it through `data-part` attributes:
  `title`, `row`, `label`, `status`, `segmented`, `option` (with `data-selected`), `checkbox`.
- The panel carries `data-seasonfx-ignore`, so it is never themed and clicks in it do not
  trigger effects.
- Other props (`className`, `style`, `id`, ...) go to the root `<div>`.

For a fully custom settings UI, use `useSeason()` (see [8](#8-the-useseason-hook)).

---

## 7. The toggle: `<SeasonButton>`

The **master on/off toggle**. It is not an "effect button". It can be anywhere under
`<SeasonProvider>`, and there can be several (e.g. navbar and settings page).

```tsx
// 1) Default toggle: a small switch with inline styles and the season icon
<SeasonButton aria-label="Holiday effects" />

// 2) Your own styled <button>: the module adds no styling
<SeasonButton className="btn btn-outline">Holiday effects</SeasonButton>

// 3) Render prop: draw it from the state
<SeasonButton className="btn">
  {({ enabled, season }) => `${season?.name ?? 'Holiday effects'}: ${enabled ? 'on' : 'off'}`}
</SeasonButton>

// 4) Custom DOM element or your own component (as)
<SeasonButton as="div" className="my-toggle" />
<SeasonButton as={MyToggle} size="sm" />

// 5) Only visible during a season (e.g. navbar)
<SeasonButton hideWhenInactive />
```

The default look is used only when there is no `as`, no `children` and no `unstyled`.

The rendered element automatically gets:

| Attribute / behavior | Why |
|---|---|
| `role="switch"`, `aria-checked` | accessibility |
| `data-seasonfx-enabled="true"` or `"false"` | your own CSS, e.g. `.pill[data-seasonfx-enabled="true"] { ... }` |
| `data-seasonfx="<id>"` (when a season is active) | per-season CSS |
| `data-seasonfx-ignore` | not themed, and clicking it does not trigger the global effect |
| `type="button"` (when `<button>`) | never submits a surrounding form |
| `tabIndex=0` + Enter/Space (for non-button HTML elements such as `div`) | keyboard support |
| `ref` forwarding | the `ref` points to the rendered element |

- Turning it on starts a small burst from the toggle as feedback.
- Your own `onClick`/`onKeyDown` runs **first**; `event.preventDefault()` cancels the toggle.
- Every other prop (`className`, `style`, `id`, `aria-*`, `data-*`, ...) is passed through.

**UI library switches** (MUI, Chakra, shadcn/ui, Headless UI, ...) expect `checked` /
`onChange`. Wire them with the hook instead of `as`:

```tsx
const { enabled, setEnabled } = useSeason();
<Switch checked={enabled} onCheckedChange={setEnabled} data-seasonfx-ignore />
```

---

## 8. The `useSeason()` hook

Only usable inside `<SeasonProvider>`; throws otherwise.

```ts
const {
  season,         // SeasonDefinition | null: today's (or the forced) season
  enabled,        // boolean: master switch
  active,         // boolean: season && enabled
  reducedMotion,  // boolean: the OS asks for reduced motion (and the Provider respects it)
  features,       // what the developer enabled (resolved with defaults)
  preferences,    // SeasonPreferences (resolved with defaults)
  running,        // { clicks, hover, ambient, decorations, easterEggs, theme }: what runs right now
  setEnabled,     // (v: boolean) => void
  toggle,         // () => void
  setPreferences, // (patch: Partial<SeasonPreferences>) => void
  burst,          // (x, y) => void: manual burst at viewport coordinates
  burstAt,        // (el: Element) => void: manual burst at an element's center
  celebrate,      // (target?: Element | { x, y }) => void: a big celebration
} = useSeason();
```

Examples:

```tsx
// show the current season with its icon
const { season } = useSeason();
{season && <span><SeasonIcon /> {season.name}</span>}

// celebrate a success
const { celebrate } = useSeason();
await placeOrder();
celebrate(); // or celebrate(buttonRef.current!)

// a custom intensity control
const { preferences, setPreferences } = useSeason();
<select value={preferences.intensity} onChange={(e) => setPreferences({ intensity: e.target.value as SeasonIntensity })}>
```

`burst`, `burstAt` and `celebrate` only do something when `active` is `true` and reduced
motion is not requested. They work even if the `clicks` feature is off.

> **SSR note:** `season` is `null` on the server and on the first client render (to avoid a
> hydration mismatch) and updates right after. In uncontrolled mode, stored values are read
> right after the first render too.

---

## 9. Click and hover effects

Clicking (feature `clicks`, on by default) or hovering with a mouse (feature `hover`) an
element matching `selector` starts a burst. Default selector (`DEFAULT_SELECTOR`):

```
button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]
```

The check is `event.target.closest(selector)`, so clicking an icon inside a button counts.

```tsx
<SeasonProvider selector={`${DEFAULT_SELECTOR}, a`}>   // include links
<SeasonProvider selector="*">                          // every click
<SeasonProvider selector="[data-seasonfx-effect]">       // only marked elements
```

**Exclusion:** elements with `data-seasonfx-ignore` **and all their descendants** never
trigger effects and are never themed:

```tsx
<button data-seasonfx-ignore>Delete</button>
<nav data-seasonfx-ignore>...the whole navbar is excluded...</nav>
```

- Disabled buttons fire no `click` event, so no effect.
- Keyboard activation (Enter/Space) starts the burst from the button's center.
- Hover bursts are throttled per element and ignore touch input.
- The listeners are capture-phase and passive; they never alter the event.

---

## 10. Background effect

Feature `ambient`. Particles slowly enter from the top (or bottom) edge and drift across
the screen: snowflakes at Christmas, autumn leaves and a few bats at Halloween, rising
hearts on Valentine's Day, flower petals at Easter, gold glitter and confetti at New Year.
Density scales with the viewport width and the user's intensity.

---

## 11. Decorations

Feature `decorations`. Mark any element with `data-seasonfx-decor`; the decoration is drawn
on the canvas layer at the element's position, so the element itself is not modified.

| Value | Position | Christmas | Halloween | Valentine's Day | Easter | New Year |
|---|---|---|---|---|---|---|
| `hat` (default) | top-left corner | Santa hat | witch hat | bow | bunny ears | party hat |
| `edge` | along the top edge | snow cap | dripping slime | heart garland | grass with flowers | bunting flags |
| `corner` | top-right corner | holly | spider web with spider | heart with arrow | egg | starburst |

```tsx
<a className="logo" data-seasonfx-decor="hat">Acme</a>
<header data-seasonfx-decor="edge">...</header>
<article className="card" data-seasonfx-decor="corner">...</article>
<div data-seasonfx-decor="hat corner">...</div>   // several at once
```

- Elements added later are picked up automatically (MutationObserver).
- A decoration is hidden while its element is covered by something else (e.g. a modal)
  or scrolled out of view.
- Decorations are static, so they also show with reduced motion.

---

## 12. Hidden surprises

Feature `easterEggs`. Nothing is shown to the user about them, they are meant to be found:

| Trigger | Result |
|---|---|
| 8 button clicks within 2.5 seconds | a big celebration at the click |
| Konami code (up, up, down, down, left, right, left, right, B, A) | celebration, a fly-by, and 10 seconds of heavy background effect |
| Typing the season's secret word outside text fields | same as the Konami code |
| Waiting | a rare fly-by every 45 to 150 seconds |

Secret words: `snow` (Christmas), `party` (New Year), `love` (Valentine's Day), `bunny`
(Easter), `boo` (Halloween).

Fly-bys: a shooting star (Christmas), fireworks (New Year), a heart balloon (Valentine's
Day), rolling eggs (Easter), a bat swarm (Halloween).

---

## 13. Page theme

Feature `theme`. While active, a `<style data-seasonfx-style>` tag is added to `<head>` and
`data-seasonfx-theme="<id>"` to `<html>`. Every rule is scoped to that attribute, so turning
the feature off removes everything.

```tsx
features={{ theme: true }}                                    // every part
features={{ theme: { buttons: true, background: true } }}     // only some parts
features={{ theme: { buttons: '.btn-primary, .cta' } }}       // restyle only these buttons
```

### Parts

| Part | Effect |
|---|---|
| `buttons` | Seasonal skin on buttons (`DEFAULT_THEME_BUTTONS`, or your selector): background, text color, ring, glow, radius, hover lift, press, focus ring, disabled look |
| `background` | Subtle seasonal pattern and tint over the page background (`body`) |
| `links` | Seasonal underline color for links that are already underlined |
| `forms` | `accent-color` (checkbox, radio, range), caret color and focus ring on inputs |
| `selection` | Seasonal text selection color |
| `scrollbar` | Seasonal scrollbar color |

Button skins per season:

| Season | Look |
|---|---|
| Christmas | red candy-cane stripes, white inner ring, stripes slide on hover |
| Halloween | deep purple night, orange glowing ring, flickering glow on hover |
| Valentine's Day | pink gradient pill, soft glow, heartbeat on hover |
| Easter | pastel mint, blue and pink gradient that shifts on hover |
| New Year | gold metallic gradient with a moving shimmer on hover |

**What the theme never changes:** width, height, padding, margin, font size, font family,
display or position. Your layout stays exactly the same.

### Component classes

Add these to your own elements for extra seasonal styling. They only have an effect while
the theme is active; outside the season the element keeps its normal look, so combine them
with your regular classes:

| Class | Effect while active |
|---|---|
| `seasonfx-btn` | the season's button skin (even if the `buttons` part is off) |
| `seasonfx-btn-soft` | tinted, low-emphasis button |
| `seasonfx-btn-outline` | outlined button that fills on hover |
| `seasonfx-card` | accent line on top, seasonal border and glow |
| `seasonfx-surface` | seasonal surface background and text color |
| `seasonfx-badge` | tinted pill label |
| `seasonfx-text` | gradient text |
| `seasonfx-banner` | gradient and pattern background with white text |
| `seasonfx-ring` | glowing seasonal ring |
| `seasonfx-divider` | gradient border color |
| `seasonfx-accent` | text in the season's primary color |
| `seasonfx-hide` | hidden while the theme is active |

```tsx
<button className="btn seasonfx-btn">Buy now</button>
<h1>Welcome to <span className="seasonfx-text">Acme</span></h1>
<div className="promo seasonfx-banner">Holiday sale</div>
```

### Design tokens

While active, these CSS custom properties are defined on `<html>` and can be used in your
own CSS:

```
--seasonfx-primary     --seasonfx-secondary    --seasonfx-on-primary
--seasonfx-button-bg   --seasonfx-button-ring  --seasonfx-glow
--seasonfx-ring        --seasonfx-surface      --seasonfx-on-surface
--seasonfx-border      --seasonfx-gradient     --seasonfx-radius
--seasonfx-pattern
```

```css
.hero-title { color: var(--seasonfx-primary, inherit); }
html[data-seasonfx-theme="halloween"] .logo { filter: drop-shadow(0 0 6px var(--seasonfx-glow)); }
```

### Dark mode

Every built-in season has a light and a dark token set. Tell the theme how your site
switches to dark mode:

```tsx
features={{ theme: { ...parts, darkSelector: '.dark' } }}           // a class or attribute (Tailwind, most sites)
features={{ theme: { ...parts, darkSelector: '[data-theme="dark"]' } }}
features={{ theme: { ...parts, colorScheme: 'system' } }}            // follows the OS setting
features={{ theme: { ...parts, colorScheme: 'dark' } }}              // the site is always dark
```

| Option | Default | Meaning |
|---|---|---|
| `colorScheme` | `'light'` | `'light'`, `'dark'` or `'system'` (`prefers-color-scheme`) |
| `darkSelector` | none | selector that matches while the site is dark; may match `<html>` or an ancestor of the content, e.g. `'html.dark'`, `'body.dark-mode'` |

`theme: true` means every part with light tokens, which fits sites without dark mode. With
a dark mode, pass an object and list the parts you want (e.g. `buttons: true,
background: true, ...`) plus `darkSelector` or `colorScheme`.

Custom seasons add a `dark` object to their `theme` with the tokens that differ (usually
`surface`, `onSurface`, `border`). Without it, the light tokens are used in dark mode too.

### Specificity

Theme rules use `html[data-seasonfx-theme="..."]` plus attribute checks, which beats single
class selectors (including utility classes such as Tailwind's `bg-blue-500`). Inline styles
and `!important` rules on your side still win. Exclude an element (and its children) with
`data-seasonfx-ignore`.

---

## 14. Seasons (built-in and custom)

| `id` | Name | Period (local time, inclusive) | Click particles |
|---|---|---|---|
| `christmas` | Christmas | 12-01 to 12-26 | snowflakes, golden stars |
| `new-year` | New Year | 12-27 to 01-02 | confetti, sparks, stars |
| `valentine` | Valentine's Day | 02-07 to 02-14 | hearts |
| `easter` | Easter | Easter - 7 days to Easter Monday (movable) | pastel eggs, flowers |
| `halloween` | Halloween | 10-20 to 10-31 | pumpkins, bats, ghosts |

When several seasons are active on the same day, the one **earlier in the `seasons` array wins**.

### Custom season

Only `id`, `name`, `isActive` and `particles` are required. Any missing part simply does
nothing (e.g. no `ambient` means no background effect for that season). Without `theme`, a
theme is generated from `accent`.

```tsx
import { SeasonProvider, builtInSeasons, dateRange, decorations, svgUrl, type SeasonDefinition } from 'seasonfx';

const stPatricks: SeasonDefinition = {
  id: 'st-patricks',
  name: "St. Patrick's Day",
  icon: { shape: 'star', colors: ['#16a34a'] },
  accent: '#16a34a',
  isActive: dateRange('03-15', '03-17'),
  secret: 'luck',
  particles: {
    shapes: ['confetti', { shape: 'star', colors: ['#facc15'], weight: 0.5 }],
    colors: ['#16a34a', '#22c55e', '#ffffff'],
    count: 18,
  },
  ambient: { shapes: ['confetti'], colors: ['#16a34a', '#86efac'], rate: 3, speed: [30, 60], gravity: 5, drag: 0, wobble: 20 },
  decorations: { hat: decorations.newYear.hat, edge: decorations.newYear.edge },
  theme: {
    primary: '#16a34a',
    secondary: '#facc15',
    onPrimary: '#ffffff',
    buttonBackground: 'linear-gradient(180deg, #22c55e, #15803d)',
    buttonRing: 'rgba(255, 255, 255, 0.35)',
    glow: 'rgba(22, 163, 74, 0.55)',
    ring: '#facc15',
    surface: '#f0fdf4',
    onSurface: '#14532d',
    border: '#bbf7d0',
    gradient: 'linear-gradient(90deg, #16a34a, #facc15)',
    pattern: svgUrl("<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='30' cy='30' r='2' fill='#16a34a' fill-opacity='0.2'/></svg>"),
  },
};

<SeasonProvider seasons={[stPatricks, ...builtInSeasons]}>
```

- Only your own seasons: `seasons={[stPatricks]}`.
- Skip a built-in one: `seasons={builtInSeasons.filter((s) => s.id !== 'valentine')}`.
- Tweak or localize a built-in one: `seasons={[{ ...christmas, name: 'Karacsony' }, ...]}`.
- Any logic: `isActive: (date) => date.getDay() === 5` (every Friday).
- Relative to Easter: `easterRange(daysBefore, daysAfter)`, e.g. Pentecost: `easterRange(-49, 50)`.

### `SeasonDefinition` fields

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | yes | unique id, used in `data-seasonfx*` attributes |
| `name` | `string` | yes | display name |
| `isActive` | `(date: Date) => boolean` | yes | when the season is active |
| `particles` | `ParticleConfig` | yes | click burst |
| `icon` | shape or `ShapeEntry` | no | icon for `SeasonIcon` and the toggle (default: first click shape) |
| `accent` | CSS color | no | toggle color, and the base of a generated theme |
| `hover` | `ParticleConfig` | no | hover burst (default: smaller version of `particles`) |
| `ambient` | `AmbientConfig` | no | background effect |
| `flyby` | `FlybyConfig` | no | rare fly-by (hidden surprise) |
| `decorations` | `{ hat?, edge?, corner? }` of `DecorationDrawer` | no | element decorations |
| `theme` | `SeasonTheme` | no | page theme tokens and extra CSS |
| `secret` | `string` | no | secret word (letters only) |

### Particle settings

`ParticleConfig` (bursts) and `AmbientConfig` (background) share these fields:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `shapes` | `(name or ShapeDrawer or ShapeEntry)[]` | required | shapes; `ShapeEntry = { shape, colors?, weight? }` |
| `colors` | `string[]` | `['#ffffff']` | colors for shapes without their own |
| `size` | `[min, max]` | `[8, 16]` | size in px |
| `speed` | `[min, max]` | `[80, 260]` | initial speed in px/s |
| `gravity` | `number` | `300` | px/s^2; negative values float up |
| `drag` | `number` | `1.5` | slowdown per second (0 = none) |
| `lifetime` | `[min, max]` | `[0.9, 1.6]` | seconds (fades out at the end) |
| `spin` | `number` | `4` | max rotation in rad/s |
| `wobble` | `number` | `0` | sideways sway in px/s |
| `opacity` | `number` | `1` | max opacity (0 to 1) |

Bursts only: `count` (default 14), `angle` (default `-Math.PI / 2`, up), `spread` (default
`2 * Math.PI`). Background only: `rate` (particles per second per 1000 px of width,
required), `from` (`'top'` or `'bottom'`).

`FlybyConfig`: `shapes`, `colors`, `count` (flock size), `size`, `duration` (seconds to
cross), `path` (`'across'` or `'rise'`), `trail` (`ParticleConfig`), `trailRate`,
`finale` (`ParticleConfig` burst at the end, e.g. fireworks).

Built-in shapes: `snowflake`, `star`, `heart`, `confetti`, `spark`, `pumpkin`, `bat`,
`ghost`, `egg`, `flower`, `leaf`.

### Custom shapes and decorations

```ts
import type { DecorationDrawer, ShapeDrawer } from 'seasonfx';

// drawn around the origin; the engine handles position, rotation and opacity
const diamond: ShapeDrawer = (ctx, size, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(size / 2, 0);
  ctx.lineTo(0, size / 2);
  ctx.lineTo(-size / 2, 0);
  ctx.fill();
};

// origin is the element's top-left corner; may draw outside the element
const ribbon: DecorationDrawer = (ctx, width) => {
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(0, -3, width, 6);
};
```

---

## 15. No flash on page load

**Client-rendered apps** (Vite, Create React App, ...): nothing to do. The Provider applies
the theme in a layout effect, before the browser paints the first frame.

**Server-rendered apps** (Next.js, Remix, Gatsby, Astro, a PHP or Rails template): the HTML
is painted before the JavaScript bundle runs, so the page would first appear without the
theme and switch a moment later. Add the early script to `<head>` with the **same options**
as the Provider:

```tsx
// season-config.ts: one shared object
import type { SeasonOptions } from 'seasonfx';
export const seasonConfig: SeasonOptions = {
  defaultEnabled: false,
  features: { ambient: true, decorations: true, theme: { buttons: true, background: true, darkSelector: '.dark' } },
};

// app/layout.tsx (Next.js App Router)
import { SeasonScript } from 'seasonfx';
import { seasonConfig } from './season-config';

<html lang="en" suppressHydrationWarning>
  <head>
    <SeasonScript {...seasonConfig} />
  </head>
  <body>
    <Providers>{children}</Providers>   {/* renders <SeasonProvider {...seasonConfig}> */}
  </body>
</html>
```

- The script is tiny plain JavaScript plus the theme CSS of the candidate seasons (about
  5 to 8 KB each; pass a shorter `seasons` list to reduce it). It renders nothing when the
  `theme` feature is off.
- It reads the same `localStorage` keys, evaluates the season in the visitor's local time,
  and sets `data-seasonfx-theme` on `<html>`. The Provider takes over on start.
- `suppressHydrationWarning` on `<html>` is needed because the attribute is set before React
  hydrates.
- In controlled mode, pass the user's saved values (`enabled`, `preferences`) from the
  server, so the script does not guess.
- Seasons made with `dateRange` / `easterRange` can be evaluated early. A season with a
  custom `isActive` function cannot; if it comes first in priority, the script does nothing
  and the theme appears after hydration.
- Other server templates: `getSeasonScript(config)` returns the script body as a string,
  e.g. `<script>${getSeasonScript(config)}</script>`. A CSP nonce can be passed to
  `<SeasonScript nonce={...} />`.

---

## 16. Without React (script tag)

The package also ships a React-free build that exposes `window.SeasonFX`, for plain HTML,
WordPress, PHP templates and other stacks. It contains the same engine, seasons and theme
(about 49 KB minified).

```html
<head>
  <script src="https://unpkg.com/seasonfx/dist/seasonfx.global.js"></script>
  <script>
    const season = SeasonFX.init({
      defaultEnabled: false,
      features: { hover: true, ambient: true, decorations: true, theme: { buttons: true, background: true } },
    });
  </script>
</head>
<body>
  <button id="holiday-toggle">Holiday effects</button>
  <script>
    season.bindToggle(document.getElementById('holiday-toggle'));
  </script>
</body>
```

Until the package is on npm, copy `dist/seasonfx.global.js` from a build (`npm run build`)
to your site and load it from there. With a bundler, import it as
`import * as SeasonFX from 'seasonfx/global'`.

- Include it in `<head>` without `defer` and call `init()` right away: the theme is applied
  before the first paint, and canvas effects start as soon as `<body>` exists.
- `init(options)` takes the same options as `<SeasonProvider>` and returns a
  `SeasonController`:

| Method | Description |
|---|---|
| `toggle()`, `setEnabled(on)` | master switch |
| `setPreferences(patch)` | user preferences, e.g. `{ intensity: 'high', ambient: false }` |
| `setOptions(patch)` | change options later, e.g. `{ season: 'halloween' }` |
| `getOptions()` | the current options |
| `getState()` | `{ season, enabled, active, reducedMotion, features, preferences, running }` |
| `subscribe(fn)` | called after every state change; returns an unsubscribe function |
| `bindToggle(element)` | turns any element (or checkbox) into the master toggle, keeps `aria-checked` and `data-seasonfx-enabled` in sync |
| `burst(x, y)`, `burstAt(el)`, `celebrate(target?)` | manual effects |
| `stop()`, `start()` | detach everything / attach again |

The `window.SeasonFX` object also has `builtInSeasons`, the individual seasons,
`dateRange`, `easterRange`, `svgUrl`, `shapes`, `decorations`, `ParticleEngine` and
`SeasonController`, so custom seasons work the same way as in React.

---

## 17. API reference

> The full generated API documentation (like Javadoc) is built into `docs/index.html` by
> `npm run docs`. Every export has TSDoc comments, which also show up on hover in the IDE.

### `<SeasonProvider>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | | the app |
| `features` | `SeasonFeatures` | `{ clicks: true }` | features the developer makes available |
| `enabled` | `boolean` | | master switch, controlled |
| `defaultEnabled` | `boolean` | `false` | master switch, uncontrolled default |
| `onEnabledChange` | `(v: boolean) => void` | | master switch changed |
| `preferences` | `Partial<SeasonPreferences>` | | user preferences, controlled |
| `defaultPreferences` | `Partial<SeasonPreferences>` | `DEFAULT_PREFERENCES` | user preferences, uncontrolled defaults |
| `onPreferencesChange` | `(p: SeasonPreferences) => void` | | preferences changed |
| `storageKey` | `string` or `false` | `'seasonfx'` | localStorage key prefix; `false` = no saving |
| `seasons` | `SeasonDefinition[]` | `builtInSeasons` | candidate seasons, in priority order |
| `season` | `string`, `SeasonDefinition` or `null` | | forced season (id or object); `null` = none |
| `date` | `Date` | now | overrides the date (for testing) |
| `selector` | `string` | `DEFAULT_SELECTOR` | which elements trigger click and hover effects |
| `respectReducedMotion` | `boolean` | `true` | no moving effects with `prefers-reduced-motion` |
| `zIndex` | `number` | `2147483000` | z-index of the canvas layer |
| `exposeAttribute` | `boolean` | `false` | sets `data-seasonfx="<id>"` on `<html>` while active |

### `<SeasonButton>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `ElementType` | `'button'` | element or component to render |
| `children` | `ReactNode` or `(state) => ReactNode` | | content; as a function it receives `{ enabled, active, season }` |
| `hideWhenInactive` | `boolean` | `false` | renders nothing outside a season |
| `unstyled` | `boolean` | `false` | never apply the default toggle styling |
| *anything else* | | | passed to the rendered element |

### `<SeasonSettings>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `labels` | `Partial<SeasonSettingsLabels>` | English | texts (translation) |
| `showTitle` | `boolean` | `false` | show the title line |
| `unstyled` | `boolean` | `false` | remove inline styles; style via `data-part` |
| *anything else* | | | passed to the root `<div>` |

### `<SeasonIcon>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `season` | `SeasonDefinition` or `null` | current season | whose icon to draw |
| `size` | `number` | `16` | size in px |
| `shape` | shape or `ShapeEntry` | season icon | draw this shape instead |
| `color` | CSS color | season icon color | override the color |
| *anything else* | | | passed to the `<canvas>` |

### `<SeasonScript>` props

The same options as the Provider (only `enabled`, `defaultEnabled`, `preferences`,
`defaultPreferences`, `storageKey`, `seasons`, `season`, `date` and `features` are used),
plus:

| Prop | Type | Description |
|---|---|---|
| `nonce` | `string` | CSP nonce for the inline script |

### `SeasonController`

The framework-agnostic core used by the Provider and by `SeasonFX.init()`. See
[16](#16-without-react-script-tag) for its methods. `new SeasonController(options)` has no side
effects; call `start()` in the browser.

### Other exports

| Export | Description |
|---|---|
| `useSeason()` | state and controls (see [8](#8-the-useseason-hook)) |
| `SeasonScript`, `getSeasonScript(options)` | early `<head>` script against the flash on load (see [15](#15-no-flash-on-page-load)) |
| `SeasonController` | framework-agnostic core (see [16](#16-without-react-script-tag)) |
| `builtInSeasons`, `christmas`, `newYear`, `valentine`, `easter`, `halloween` | built-in seasons |
| `dateRange(from, to)`, `easterRange(before, after)`, `getEasterSunday(year)`, `getActiveSeason(date, seasons?)` | date helpers |
| `svgUrl(svg)` | SVG markup to a CSS `url()` value, for theme patterns |
| `shapes`, `decorations` | built-in shape and decoration drawers, reusable in custom seasons |
| `buildThemeCss`, `resolveThemeOptions`, `themeFromAccent`, `DEFAULT_THEME_BUTTONS` | theme generation (e.g. to render the CSS on the server) |
| `ParticleEngine` | framework-agnostic engine (usable without React) |
| `DEFAULT_SELECTOR`, `DEFAULT_STORAGE_KEY`, `DEFAULT_PREFERENCES`, `INTENSITY_SCALE`, `DEFAULT_SETTINGS_LABELS` | constants |
| Types | `SeasonOptions`, `SeasonState`, `ResolvedFeatures`, `SeasonScriptProps`, `SeasonScriptOptions`, `SeasonRange`, `RangeFunction`, `SeasonProviderProps`, `SeasonButtonProps`, `SeasonSettingsProps`, `SeasonSettingsLabels`, `SeasonIconProps`, `SeasonContextValue`, `CelebrateTarget`, `SeasonDefinition`, `SeasonTheme`, `SeasonThemeOptions`, `SeasonFeatures`, `SeasonFeatureName`, `SeasonPreferences`, `SeasonIntensity`, `ParticleStyle`, `ParticleConfig`, `AmbientConfig`, `FlybyConfig`, `DecorationSlot`, `DecorationDrawer`, `ParticleShape`, `ShapeEntry`, `ShapeDrawer`, `BuiltInShape`, `ParticleEngineOptions`, `DecorationTarget`, `ResolvedThemeOptions` |

---

## 18. Recipes

### Everything, stored in the user profile (recommended for apps with accounts)

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  const { user, updateSettings } = useUser();
  return (
    <SeasonProvider
      features={{ hover: true, ambient: true, decorations: true, easterEggs: true, theme: true }}
      enabled={user?.settings.seasonEnabled ?? false}
      onEnabledChange={(v) => updateSettings({ seasonEnabled: v })}
      preferences={user?.settings.seasonPreferences}
      onPreferencesChange={(p) => updateSettings({ seasonPreferences: p })}
    >
      {children}
    </SeasonProvider>
  );
}

// SettingsPage.tsx
<SeasonSettings />
```

Note: pass `preferences={undefined}` (not `{}`) while the user is loading if you want the
defaults; any object switches preferences to controlled mode.

### Only a subtle touch: clicks and decorations, no theme

```tsx
<SeasonProvider defaultEnabled features={{ decorations: true }}>
```

### Theme only on the main call-to-action buttons

```tsx
<SeasonProvider features={{ theme: { buttons: '.cta', background: true } }}>
```

### Next.js (App Router)

The bundle starts with `"use client"`. Put the Provider in a client component, and add
`<SeasonScript>` to `<head>` when the theme is on (see [15](#15-no-flash-on-page-load)):

```tsx
// app/providers.tsx
'use client';
import { SeasonProvider } from 'seasonfx';
import { seasonConfig } from './season-config';
export function Providers({ children }: { children: React.ReactNode }) {
  return <SeasonProvider {...seasonConfig}>{children}</SeasonProvider>;
}

// app/layout.tsx
import { SeasonScript } from 'seasonfx';
import { Providers } from './providers';
import { seasonConfig } from './season-config';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SeasonScript {...seasonConfig} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

### Testing a specific season

```tsx
<SeasonProvider season="halloween">            // always Halloween
<SeasonProvider date={new Date(2026, 11, 24)}> // as if it were Dec 24
<SeasonProvider season={null}>                 // never a season
```

Remember the master switch: for a quick test use `defaultEnabled` too, or turn it on in the UI.

### Without React

See [16](#16-without-react-script-tag).

---

## 19. Guarantees and limitations

**Guarantees:**
- Without the theme feature, no CSS is added. With it, all CSS lives in one `<style>` tag
  that exists only while the theme runs, and every rule is scoped to
  `html[data-seasonfx-theme]`.
- The theme never changes sizes, spacing, fonts, display or position.
- Existing elements are never modified: no class, style or DOM changes. `SeasonProvider`
  renders no DOM element of its own.
- Listeners never call `preventDefault` or `stopPropagation`.
- The only other DOM addition is one `<canvas data-seasonfx-canvas aria-hidden="true">` at
  the end of `body`, while active and only once something needs to be drawn. Optionally
  `data-seasonfx` on `<html>` with `exposeAttribute`.
- When nothing moves, the animation loop stops (0% CPU). At most 600 particles are alive at once.
- Every text field is safe: secret words are ignored while typing in inputs, textareas,
  selects and contenteditable elements.
- No flash of the unthemed page: the theme is applied before the first paint (with server
  rendering, together with `<SeasonScript>`).

**Limitations:**
- The canvas `z-index` is very high by default (`2147483000`) so effects show above modals.
  Lower it with `zIndex` if needed.
- Particles are fixed to the viewport; a burst does not scroll with the page (they are
  short-lived, so this is not noticeable).
- Decorations follow their element on scroll and resize, with up to one frame of delay.
- The theme uses `color-mix()` for a few tints (all browsers since 2023).
- Use one `SeasonProvider` per page.

---

## 20. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Error `useSeason() and the seasonfx components must be used inside <SeasonProvider>` | The component is not under the Provider. Move the Provider higher. |
| Nothing happens | 1) Is there a season today? Test with `season="christmas"`. 2) Is the master switch on (`useSeason().enabled`)? 3) Is the feature in `features`? 4) Did the user turn it off (`preferences`)? 5) Is reduced motion on in the OS? Check `useSeason().running`. |
| No effect on a specific button | It does not match `selector`, or it or an ancestor has `data-seasonfx-ignore`. |
| The theme does not restyle a button | The button has an inline style or an `!important` rule, or it is outside the `buttons` selector. Add `seasonfx-btn` to it. |
| The theme restyles something it should not | Add `data-seasonfx-ignore` to it (or a container), or narrow `theme.buttons` to a selector. |
| No decoration | The `decorations` feature is off, the attribute value is not `hat`, `edge` or `corner`, or the element is covered by another element. |
| The toggle does not change (controlled mode) | `onEnabledChange` must update the value you pass to `enabled`. |
| Effects hidden under an overlay | Increase `zIndex`. |

---

## 21. Development and generating API docs

```bash
npm install
npm run dev        # demo: http://localhost:5173, a bakery website with SeasonFX built in
npm test           # unit tests (dates, theme, early script, controller) and the ASCII-only check
npm run typecheck
npm run build      # dist/: ESM + CJS + .d.ts, and seasonfx.global.js (script-tag build)
npm run docs       # Javadoc-like HTML API docs in docs/ (TypeDoc)
```

Source layout:

```
src/
  index.ts                  public exports (React)
  global.ts                 script-tag build entry (window.SeasonFX, no React)
  core/SeasonController.ts  framework-agnostic core: state, storage, features, listeners, theme
  core/constants.ts         defaults
  SeasonProvider.tsx        React wrapper around SeasonController
  SeasonScript.tsx          early <head> script component
  ssr/getSeasonScript.ts    early <head> script builder
  SeasonButton.tsx          the master on/off toggle
  SeasonSettings.tsx        ready-made settings panel
  SeasonIcon.tsx            season icon drawn on a canvas
  context.ts                useSeason() + context
  types.ts                  public types
  seasons/                  built-in seasons (one file each), date helpers, svgUrl
  theme/buildThemeCss.ts    theme stylesheet generator
  engine/ParticleEngine.ts  canvas engine: bursts, background, fly-bys, decorations
  engine/shapes.ts          built-in particle shapes
  engine/decorations.ts     built-in decorations
demo/                       Vite demo: "Crumb & Crust" bakery site (Bakery.tsx), testing panel
                            (DemoPanel.tsx), and vanilla.html (the same features without React)
tests/                      vitest
```

Source files must be plain ASCII (no emoji or typographic symbols); `npm test` enforces it.

---

## 22. Integration checklist (for AI assistants)

If you receive this README in another project, do this:

1. **Install:** `npm install github:MrDrakosss/SeasonFX`.
2. **Provider:** find the app root (`main.tsx`, `App.tsx`, `_app.tsx`, or a `'use client'`
   providers file in the Next.js App Router) and wrap it **once** in `<SeasonProvider>`.
   Keep the options in one shared `seasonConfig` object.
   - **No React?** Use the script-tag build instead: `SeasonFX.init(seasonConfig)` in `<head>`
     and `season.bindToggle(element)` for the toggle (see section 16), then continue from step 6.
3. **Features:** ask or decide which features to offer and pass them in `features`
   (`clicks` is on by default; `hover`, `ambient`, `decorations`, `easterEggs`, `theme` are
   opt-in). If the site's design must not change, leave `theme` off or limit its parts.
   **If the site has a dark mode**, find how it is switched (a class such as `.dark` on
   `<html>`, a `data-theme` attribute, or only the OS setting) and pass an object theme with
   `darkSelector` or `colorScheme: 'system'`.
   **If the site is server-rendered** (Next.js, Remix, ...) and the theme is on, render
   `<SeasonScript {...seasonConfig} />` in `<head>` and add `suppressHydrationWarning` to
   `<html>` (section 15).
4. **Where the state lives:**
   - With user accounts and a settings backend: controlled mode (`enabled` +
     `onEnabledChange`, `preferences` + `onPreferencesChange`). Add a boolean
     (`seasonEnabled`) and a JSON field (`seasonPreferences`) to the user's settings.
   - Otherwise: uncontrolled mode (`defaultEnabled={false}`); the module uses `localStorage`.
5. **Settings UI:** put `<SeasonSettings />` on the settings page (translate with `labels`,
   restyle with `unstyled` + `data-part`), or build a custom one with `useSeason()`.
   For a quick on/off switch elsewhere, use `<SeasonButton />` (navbar: `hideWhenInactive`).
   For a UI library switch, use `useSeason()` and add `data-seasonfx-ignore` to it.
6. **Decorations (if enabled):** add `data-seasonfx-decor="hat"` to the logo, `"edge"` to the
   header, `"corner"` to one or two cards. Do not add it to many elements.
7. **Theme (if enabled):** optionally add `seasonfx-btn` to the main call-to-action,
   `seasonfx-text` to a headline word, `seasonfx-card` to feature cards. Add
   `data-seasonfx-ignore` to areas that must never change (e.g. payment forms, brand logos
   with fixed colors).
8. **Do not modify existing buttons** for click effects, do not add global CSS for the
   module, and do not replace buttons with `SeasonButton` (it is only the on/off toggle).
9. **Success moments (optional):** call `useSeason().celebrate()` after e.g. a purchase.
10. **Verify:** temporarily set `season="christmas"` and `defaultEnabled` on the Provider,
    click a button (snowflakes), check the theme and decorations, then remove both props.
