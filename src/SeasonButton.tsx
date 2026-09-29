import { forwardRef, useContext } from 'react';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { QueueBurstContext, useSeason } from './context';
import { SeasonIcon } from './SeasonIcon';
import type { SeasonDefinition } from './types';

/** Argument passed to the render-prop `children` function of {@link SeasonButton}. */
export interface SeasonButtonRenderState {
  /** Whether the feature is turned on (the setting's value). */
  enabled: boolean;
  /** Whether effects actually run (season active, turned on, no reduced motion). */
  active: boolean;
  /** The current season, or `null`. */
  season: SeasonDefinition | null;
}

/** Props owned by {@link SeasonButton} (every other prop goes to the `as` element). */
export interface SeasonButtonOwnProps<E extends ElementType = 'button'> {
  /**
   * The element or component to render. Either an HTML tag (`'div'`, `'span'`,
   * `'a'`, ...) or any React component. All other props (className, style, etc.)
   * are passed to it unchanged.
   *
   * @remarks
   * When neither `as` nor `children` is set, the built-in default toggle is rendered.
   *
   * @defaultValue `'button'`
   */
  as?: E;
  /**
   * Content of the toggle. Either a plain ReactNode or a function that receives
   * the current state ({@link SeasonButtonRenderState}).
   *
   * @example
   * ```tsx
   * <SeasonButton className="btn">
   *   {({ enabled }) => (enabled ? 'Holiday effects: ON' : 'Holiday effects: OFF')}
   * </SeasonButton>
   * ```
   */
  children?: ReactNode | ((state: SeasonButtonRenderState) => ReactNode);
  /**
   * When `true`, the toggle renders nothing (`null`) while no season is active.
   * Recommended in a navbar. Keep it `false` on a settings page so users can
   * set their preference ahead of time.
   *
   * @defaultValue false
   */
  hideWhenInactive?: boolean;
  /**
   * When `true`, the default toggle styling is never applied, even without `as` and `children`.
   * @defaultValue false
   */
  unstyled?: boolean;
}

/**
 * Full prop type of {@link SeasonButton}: its own props plus every prop of the
 * chosen `as` element (e.g. `href` for `as="a"`).
 */
export type SeasonButtonProps<E extends ElementType = 'button'> = SeasonButtonOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof SeasonButtonOwnProps<E>>;

/** Polymorphic component type of {@link SeasonButton} (typed by its `as` prop). */
export type SeasonButtonComponent = <E extends ElementType = 'button'>(
  props: SeasonButtonProps<E> & { ref?: Ref<any> },
) => ReactElement | null;

const DEFAULT_ACCENT = '#6366f1';

function trackStyle(enabled: boolean, accent: string): CSSProperties {
  return {
    position: 'relative',
    display: 'inline-block',
    boxSizing: 'border-box',
    flexShrink: 0,
    width: 44,
    height: 24,
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: 999,
    background: enabled ? accent : '#9ca3af',
    cursor: 'pointer',
    verticalAlign: 'middle',
    transition: 'background-color 160ms ease',
    font: 'inherit',
    lineHeight: 0,
  };
}

function thumbStyle(enabled: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: 2,
    left: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    transform: enabled ? 'translateX(20px)' : 'translateX(0)',
    transition: 'transform 160ms ease',
    lineHeight: 1,
    pointerEvents: 'none',
  };
}

/**
 * The **on/off toggle** of the season feature. Place it anywhere under
 * `<SeasonProvider>` (e.g. a settings page or navbar); its look is fully customizable.
 *
 * @remarks
 * Three ways to use it:
 *
 * 1. **Default toggle**: `<SeasonButton />`. A small switch with inline styles. No
 *    global CSS, so it cannot affect the page's styling.
 * 2. **Custom element or component**: `as` plus your own `className`/`style`/`children`.
 *    The module then adds no styling at all, only the behavior.
 * 3. **Render prop**: the `children` function receives the state.
 *
 * In every mode the rendered element receives:
 * - `role="switch"` and `aria-checked`, for accessibility;
 * - `data-seasonfx-enabled="true|false"` (for your CSS) and `data-seasonfx="<id>"` when a season is active;
 * - `data-seasonfx-ignore`, so clicking the toggle does not trigger the global effect
 *   (turning it on does start a small burst from the toggle as feedback);
 * - `type="button"` when it is a `<button>` (it never submits a form by accident);
 * - `tabIndex=0` and Enter/Space handling for non-button HTML elements (e.g. `div`).
 *
 * Your own `onClick`/`onKeyDown` handler runs first. Calling
 * `event.preventDefault()` in it cancels the toggle.
 *
 * The `ref` is forwarded to the rendered element.
 *
 * If a UI library's switch expects `checked`/`onChange` props (e.g. MUI `Switch`),
 * wire it up with the {@link useSeason} hook instead of `as`.
 *
 * @example Default toggle
 * ```tsx
 * <label>
 *   Holiday effects <SeasonButton aria-label="Holiday effects" />
 * </label>
 * ```
 *
 * @example Custom-styled button
 * ```tsx
 * <SeasonButton className="btn btn-outline">
 *   {({ enabled, season }) => `${season?.name ?? 'Holiday effects'}: ${enabled ? 'on' : 'off'}`}
 * </SeasonButton>
 * ```
 *
 * @example Custom DOM element or component
 * ```tsx
 * <SeasonButton as="div" className="my-toggle" />
 * <SeasonButton as={MyToggle} size="sm" />
 * ```
 *
 * @example Only visible during a season (navbar)
 * ```tsx
 * <SeasonButton hideWhenInactive />
 * ```
 */
export const SeasonButton = forwardRef(function SeasonButton(
  props: SeasonButtonProps<ElementType>,
  ref: Ref<any>,
) {
  const { as, children, hideWhenInactive = false, unstyled = false, ...rest } = props as SeasonButtonOwnProps<ElementType> &
    Record<string, any>;
  const { season, enabled, active, setEnabled } = useSeason();
  const queueBurst = useContext(QueueBurstContext);

  if (hideWhenInactive && !season) return null;

  const Component: ElementType = as ?? 'button';
  const isNativeButton = Component === 'button';
  const isPlainElement = typeof Component === 'string' && !isNativeButton;
  const useDefaultLook = !unstyled && as === undefined && children === undefined;

  const { onClick, onKeyDown, style, ...passThrough } = rest;

  const flip = (element: Element) => {
    const next = !enabled;
    setEnabled(next);
    if (next) queueBurst(element);
  };

  const handleClick = (event: MouseEvent<Element>) => {
    onClick?.(event);
    if (!event.defaultPrevented) flip(event.currentTarget);
  };

  const handleKeyDown = (event: KeyboardEvent<Element>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isPlainElement) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flip(event.currentTarget);
    }
  };

  const content =
    typeof children === 'function' ? children({ enabled, active, season }) : children;

  const elementProps: Record<string, unknown> = {
    role: 'switch',
    'aria-checked': enabled,
    'data-seasonfx-ignore': '',
    'data-seasonfx-enabled': enabled ? 'true' : 'false',
    'data-seasonfx': season?.id,
    ...(isNativeButton ? { type: 'button' } : null),
    ...(isPlainElement ? { tabIndex: 0 } : null),
    ...(useDefaultLook ? { 'aria-label': 'Seasonal effects' } : null),
    ...passThrough,
    ref,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    style: useDefaultLook ? { ...trackStyle(enabled, season?.accent ?? DEFAULT_ACCENT), ...style } : style,
  };

  return (
    <Component {...elementProps}>
      {useDefaultLook ? (
        <span aria-hidden="true" style={thumbStyle(enabled)}>
          {season && <SeasonIcon season={season} size={13} />}
        </span>
      ) : (
        content
      )}
    </Component>
  );
}) as SeasonButtonComponent;
