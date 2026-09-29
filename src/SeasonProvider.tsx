import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { QueueBurstContext, SeasonContext } from './context';
import type { SeasonContextValue } from './context';
import { SeasonController } from './core/SeasonController';
import type { SeasonOptions } from './core/SeasonController';

export { DEFAULT_PREFERENCES, DEFAULT_SELECTOR, DEFAULT_STORAGE_KEY, INTENSITY_SCALE } from './core/constants';

// useLayoutEffect runs before the browser paints, so the theme is applied without a flash.
// On the server it would warn, and nothing needs to run there anyway.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Props of {@link SeasonProvider}: every {@link SeasonOptions} field plus `children`.
 */
export interface SeasonProviderProps extends SeasonOptions {
  /** The app (or the part of it where effects should work). */
  children?: ReactNode;
}

/**
 * Root component of the season feature. Place it once, near the top of the app.
 *
 * @remarks
 * Responsibilities (implemented by the framework-agnostic {@link SeasonController}):
 * - picks the active season from the date;
 * - stores the master switch and the user's preferences (in `localStorage` in
 *   uncontrolled mode, or in the app in controlled mode);
 * - runs the features the developer enabled through `features`: click and hover
 *   bursts, the background effect, decorations, hidden surprises and the page theme.
 *
 * **Non-invasive:** by default only click bursts are available, and nothing runs
 * until the user turns the feature on. It never calls `preventDefault` or
 * `stopPropagation`. Without the theme feature it adds no CSS at all. When
 * nothing is active, there is no canvas in the DOM and no listener.
 *
 * **No flash:** in client-rendered apps the theme is applied before the first
 * paint. With server rendering (e.g. Next.js), also render `<SeasonScript />`
 * in `<head>` with the same options.
 *
 * It renders no DOM element of its own and returns `children` unchanged.
 *
 * @example Uncontrolled mode with every feature available
 * ```tsx
 * <SeasonProvider
 *   defaultEnabled={false}
 *   features={{ hover: true, ambient: true, decorations: true, easterEggs: true, theme: true }}
 * >
 *   <App />
 * </SeasonProvider>
 * ```
 *
 * @example Controlled mode (stored in the user's settings)
 * ```tsx
 * <SeasonProvider
 *   enabled={user.settings.seasonEffects}
 *   onEnabledChange={(v) => updateUserSettings({ seasonEffects: v })}
 *   preferences={user.settings.seasonPreferences}
 *   onPreferencesChange={(p) => updateUserSettings({ seasonPreferences: p })}
 * >
 *   <App />
 * </SeasonProvider>
 * ```
 */
export function SeasonProvider(props: SeasonProviderProps) {
  const { children, ...options } = props;

  const ref = useRef<SeasonController | null>(null);
  if (!ref.current) ref.current = new SeasonController(options);
  const controller = ref.current;

  const [state, setState] = useState(controller.getState);

  useIsomorphicLayoutEffect(() => controller.subscribe(() => setState(controller.getState())), [controller]);

  useIsomorphicLayoutEffect(() => {
    controller.update(options);
  });

  useIsomorphicLayoutEffect(() => {
    controller.start();
    setState(controller.getState());
    return () => controller.stop();
  }, [controller]);

  const value = useMemo<SeasonContextValue>(
    () => ({
      ...state,
      setEnabled: controller.setEnabled,
      toggle: controller.toggle,
      setPreferences: controller.setPreferences,
      burst: controller.burst,
      burstAt: controller.burstAt,
      celebrate: controller.celebrate,
    }),
    [state, controller],
  );

  return (
    <SeasonContext.Provider value={value}>
      <QueueBurstContext.Provider value={controller.queueBurst}>{children}</QueueBurstContext.Provider>
    </SeasonContext.Provider>
  );
}
