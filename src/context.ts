import { createContext, useContext } from 'react';
import type { CelebrateTarget, SeasonState } from './core/SeasonController';
import type { SeasonPreferences } from './types';

export type { CelebrateTarget };

/**
 * Return value of {@link useSeason}: the full state ({@link SeasonState}) plus
 * the actions that control the season feature.
 */
export interface SeasonContextValue extends SeasonState {
  /** Turns the season feature on or off (master switch). Calls `onEnabledChange`. */
  setEnabled: (enabled: boolean) => void;
  /** Flips the master switch. */
  toggle: () => void;
  /**
   * Updates some of the user's preferences. Calls `onPreferencesChange` with the full result.
   * @param patch - The preferences to change.
   */
  setPreferences: (patch: Partial<SeasonPreferences>) => void;
  /**
   * Manually starts a particle burst at viewport coordinates. Does nothing unless
   * `active` is `true` and reduced motion is not requested.
   * @param x - Horizontal position (`clientX`).
   * @param y - Vertical position (`clientY`).
   */
  burst: (x: number, y: number) => void;
  /**
   * Manually starts a particle burst at the center of an element. Same conditions as `burst`.
   * @param element - The DOM element the burst starts from.
   */
  burstAt: (element: Element) => void;
  /**
   * A big celebration: several large bursts in a row. Great after a purchase,
   * a completed form or any success moment. Same conditions as `burst`.
   * @param target - Element or point to start from. The screen center when omitted.
   */
  celebrate: (target?: CelebrateTarget) => void;
}

/** @internal */
export const SeasonContext = createContext<SeasonContextValue | null>(null);

/**
 * @internal
 * The toggle uses this to request a burst from its own position when it turns
 * the feature on. The engine is not running yet at that moment, so the
 * controller queues the request.
 */
export const QueueBurstContext = createContext<(element: Element) => void>(() => {});

/**
 * Reads the state and controls of the season feature.
 *
 * @remarks
 * Must be used inside `<SeasonProvider>`, otherwise it throws.
 * Useful for wiring up a custom toggle (e.g. a UI library's Switch
 * component), building a custom settings UI, showing the current season, or
 * triggering a celebration.
 *
 * @returns The {@link SeasonContextValue} object.
 * @throws Error if there is no `<SeasonProvider>` above in the tree.
 *
 * @example Wiring up a custom switch component
 * ```tsx
 * function SeasonSetting() {
 *   const { enabled, setEnabled, season } = useSeason();
 *   return (
 *     <label>
 *       <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} data-seasonfx-ignore />
 *       Holiday effects {season && `(now: ${season.name})`}
 *     </label>
 *   );
 * }
 * ```
 *
 * @example Celebrating a success
 * ```tsx
 * const { celebrate } = useSeason();
 * await placeOrder();
 * celebrate();
 * ```
 */
export function useSeason(): SeasonContextValue {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('seasonfx: useSeason() and the seasonfx components must be used inside <SeasonProvider>.');
  }
  return ctx;
}
