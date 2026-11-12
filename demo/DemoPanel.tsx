import { useState } from 'react';
import { SeasonIcon, builtInSeasons, useSeason } from 'seasonfx';

/** Testing controls. Not part of the bakery site; marked with data-seasonfx-ignore so it is never themed. */
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
      <button className="demo-fab" data-seasonfx-ignore onClick={() => setOpen(true)}>
        SeasonFX demo
      </button>
    );
  }

  return (
    <aside className="demo-panel" data-seasonfx-ignore aria-label="SeasonFX demo controls">
      <div className="demo-head">
        <strong>SeasonFX demo</strong>
        <button className="demo-link" onClick={() => setOpen(false)}>
          Hide
        </button>
      </div>

      <div className="demo-section">
        <span className="demo-label">Theme</span>
        <div className="demo-seasons" role="radiogroup" aria-label="Theme">
          <button
            role="radio"
            aria-checked={forced === ''}
            className={forced === '' ? 'active' : ''}
            onClick={() => setForced('')}
            title="Pick the season from today's date, like a real site"
          >
            <span className="demo-dot" aria-hidden="true" />
            Today's date
          </button>
          <button
            role="radio"
            aria-checked={forced === 'none'}
            className={forced === 'none' ? 'active' : ''}
            onClick={() => setForced('none')}
            title="No season: how the site looks out of season"
          >
            <span className="demo-dot off" aria-hidden="true" />
            None
          </button>
          {builtInSeasons.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={forced === s.id}
              className={forced === s.id ? 'active' : ''}
              onClick={() => setForced(s.id)}
            >
              <SeasonIcon season={s} size={16} />
              {s.name}
            </button>
          ))}
        </div>
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
          Plain buttons keep the bakery style. Buttons that opt in with a seasonfx-btn class still get the skin.
        </p>
      )}

      <div className="demo-status">
        <div>
          <span>Season</span>
          <b>{season ? season.name : 'none'}</b>
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
