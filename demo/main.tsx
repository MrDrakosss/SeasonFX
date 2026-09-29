import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SeasonProvider } from 'season-ui';
import { Bakery } from './Bakery';
import { DemoPanel } from './DemoPanel';

function Root() {
  // A real site would not force a season; the demo does so that every theme can be tried any day.
  const [forced, setForced] = useState('christmas');
  const [themeButtons, setThemeButtons] = useState(true);
  const [dark, setDark] = useState(false);

  // The bakery's own dark mode: a class on <html>, like most sites (e.g. Tailwind's `dark` class).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <SeasonProvider
      season={forced || undefined}
      defaultEnabled
      features={{
        hover: true,
        ambient: true,
        decorations: true,
        easterEggs: true,
        theme: {
          buttons: themeButtons,
          background: true,
          links: true,
          forms: true,
          selection: true,
          scrollbar: true,
          darkSelector: 'html.dark',
        },
      }}
    >
      <Bakery />
      <DemoPanel
        forced={forced}
        setForced={setForced}
        themeButtons={themeButtons}
        setThemeButtons={setThemeButtons}
        dark={dark}
        setDark={setDark}
      />
    </SeasonProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
