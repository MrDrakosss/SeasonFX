import { useState } from 'react';
import { SeasonIcon, builtInSeasons, useSeason } from 'season-ui';

/** Testing controls. Not part of the bakery site; marked with data-season-ignore so it is never themed. */
export function DemoPanel(props: {
  forced: string;
  setForced: (id: string) => void;
  themeButtons: boolean;
  setThemeButtons: (on: boolean) => void;
  dark: boolean;
  setDark: (on: boolean) => void;
}) {
  const { forced, setForced, themeButtons, setThemeButtons, dark, setDark } = props;
  const { season, enabled, setEnabled, running, celebrate } = useSeason();
  // Start collapsed on phones so the panel does not cover the page.
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 720);
  const on = Object.entries(running)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (!open) {
    return (
      <button className="demo-fab" data-season-ignore onClick={() => setOpen(true)}>
        SeasonUI demo
      </button>
    );
  }

  return (
    <aside className="demo-panel" data-season-ignore aria-label="SeasonUI demo controls">
      <div className="demo-head">
        <strong>SeasonUI demo</strong>
        <button className="demo-link" onClick={() => setOpen(false)}>
          Hide
        </button>
      </div>

      <div className="demo-seasons" role="radiogroup" aria-label="Season">
        <button
          role="radio"
          aria-checked={forced === ''}
          className={forced === '' ? 'active' : ''}
          onClick={() => setForced('')}
          title="Pick the season from today's date"
        >
          Today
        </button>
        {builtInSeasons.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={forced === s.id}
            className={forced === s.id ? 'active' : ''}
            onClick={() => setForced(s.id)}
            title={s.name}
          >
            <SeasonIcon season={s} size={18} />
          </button>
        ))}
      </div>

      <label className="demo-row">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Master switch (user turned it on)
      </label>

      <label className="demo-row" title="The bakery's own dark mode (html.dark), followed through theme.darkSelector">
        <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
        Dark site (html.dark)
      </label>

      <label className="demo-row" title="features.theme.buttons">
        <input type="checkbox" checked={themeButtons} onChange={(e) => setThemeButtons(e.target.checked)} />
        Seasonal button skins (theme.buttons)
      </label>
      {!themeButtons && (
        <p className="demo-note">
          Plain buttons keep the bakery style. Buttons that opt in with a season-btn class still get the skin.
        </p>
      )}

      <div className="demo-status">
        <div>
          <span>Season</span>
          <b>{season ? season.name : 'none today'}</b>
        </div>
        <div>
          <span>Running</span>
          <b>{on.length ? on.join(', ') : 'nothing'}</b>
        </div>
      </div>

      <button className="demo-btn" onClick={() => celebrate()} disabled={!season || !enabled}>
        celebrate()
      </button>

      <details className="demo-secrets">
        <summary>Hidden surprises</summary>
        <ul>
          <li>Click buttons 8 times within 2.5 s</li>
          <li>Konami code: up up down down left right left right B A</li>
          <li>
            Type <b>{season?.secret ?? 'the secret word'}</b> outside a text field
          </li>
          <li>Wait a few minutes for a fly-by</li>
        </ul>
      </details>
      <p className="demo-note">
        User preferences: header, Preferences button. Without React: <a href="/vanilla.html">vanilla.html</a>
      </p>
    </aside>
  );
}
