import { useContext, useEffect, useRef } from 'react';
import type { CanvasHTMLAttributes } from 'react';
import { SeasonContext } from './context';
import { pickShape } from './engine/ParticleEngine';
import type { ParticleShape, SeasonDefinition, ShapeEntry } from './types';

/** Props of {@link SeasonIcon}. Every other prop goes to the `<canvas>` element. */
export interface SeasonIconProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'children' | 'width' | 'height'> {
  /**
   * The season whose icon is drawn. Defaults to the current season when used
   * inside `<SeasonProvider>`. Nothing is rendered when there is no season and no `shape`.
   */
  season?: SeasonDefinition | null;
  /**
   * Icon size in CSS pixels.
   * @defaultValue 16
   */
  size?: number;
  /** Draws this shape instead of the season's icon. */
  shape?: ParticleShape | ShapeEntry;
  /** Overrides the icon color. */
  color?: string;
}

/**
 * Draws a season's icon (a small canvas, no emoji or icon font needed).
 *
 * @remarks
 * The icon is the season's `icon` shape, or the first shape of its click
 * particles. It is decorative (`aria-hidden`); add your own text label.
 *
 * @example
 * ```tsx
 * const { season } = useSeason();
 * {season && <span><SeasonIcon /> {season.name}</span>}
 * ```
 */
export function SeasonIcon(props: SeasonIconProps) {
  const { season: seasonProp, size = 16, shape, color, style, ...rest } = props;
  const ctx = useContext(SeasonContext);
  const season = seasonProp !== undefined ? seasonProp : ctx?.season ?? null;
  const ref = useRef<HTMLCanvasElement>(null);

  const icon: ParticleShape | ShapeEntry | undefined = shape ?? season?.icon ?? season?.particles.shapes[0];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !icon) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const c = canvas.getContext('2d');
    if (!c) return;
    const entry: ShapeEntry = typeof icon === 'object' ? icon : { shape: icon };
    const { draw, colors } = pickShape([entry], season?.particles.colors ?? [season?.accent ?? '#6366f1']);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, size, size);
    c.translate(size / 2, size / 2);
    draw(c, size * 0.88, color ?? colors[0]);
  }, [icon, size, color, season]);

  if (!icon) return null;

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      width={size}
      height={size}
      {...rest}
      style={{ display: 'inline-block', width: size, height: size, verticalAlign: 'middle', ...style }}
    />
  );
}
