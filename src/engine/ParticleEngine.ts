import type {
  AmbientConfig,
  DecorationDrawer,
  DecorationSlot,
  FlybyConfig,
  ParticleConfig,
  ParticleShape,
  ParticleStyle,
  ShapeDrawer,
  ShapeEntry,
} from '../types';
import { shapes } from './shapes';

/** Options for the {@link ParticleEngine} constructor. */
export interface ParticleEngineOptions {
  /**
   * `z-index` of the canvas layer.
   * @defaultValue 2147483000
   */
  zIndex?: number;
  /**
   * Maximum number of particles alive at once. The oldest are removed first.
   * @defaultValue 600
   */
  maxParticles?: number;
}

/** An element that carries a decoration, as passed to {@link ParticleEngine.setDecorations}. */
export interface DecorationTarget {
  /** The decorated element. */
  element: Element;
  /** Which slot the decoration occupies. Used to pick the visibility test point. */
  slot: DecorationSlot;
  /** The drawer that paints the decoration. */
  draw: DecorationDrawer;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  draw: ShapeDrawer;
  age: number;
  life: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleFreq: number;
  phase: number;
  opacity: number;
}

interface Flyer {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  age: number;
  delay: number;
  duration: number;
  path: 'across' | 'rise';
  phase: number;
  size: number;
  color: string;
  draw: ShapeDrawer;
  flip: boolean;
  trailAcc: number;
  config: FlybyConfig;
  x: number;
  y: number;
}

interface DecorState extends DecorationTarget {
  visible: boolean;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

function resolveDrawer(shape: ParticleShape): ShapeDrawer {
  return typeof shape === 'function' ? shape : shapes[shape];
}

/**
 * Picks a weighted random shape and its color list from a shape list.
 * @internal
 */
export function pickShape(
  list: Array<ParticleShape | ShapeEntry>,
  colors: string[] | undefined,
): { draw: ShapeDrawer; colors: string[] } {
  const fallback = colors && colors.length > 0 ? colors : ['#ffffff'];
  const entries: ShapeEntry[] = list.map((s) => (typeof s === 'object' ? s : { shape: s }));
  const total = entries.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  let roll = Math.random() * total;
  let chosen = entries[entries.length - 1];
  for (const entry of entries) {
    roll -= entry.weight ?? 1;
    if (roll <= 0) {
      chosen = entry;
      break;
    }
  }
  const own = chosen.colors && chosen.colors.length > 0 ? chosen.colors : fallback;
  return { draw: resolveDrawer(chosen.shape), colors: own };
}

function testPoint(slot: DecorationSlot, rect: DOMRect): [number, number] {
  const insetX = Math.min(rect.width * 0.25, 12);
  const insetY = Math.min(rect.height * 0.5, 8);
  if (slot === 'hat') return [rect.left + insetX, rect.top + insetY];
  if (slot === 'corner') return [rect.right - insetX, rect.top + insetY];
  return [rect.left + rect.width / 2, rect.top + Math.min(rect.height / 2, 6)];
}

/**
 * Framework-agnostic effects engine drawing on a single full-screen canvas layer.
 *
 * @remarks
 * The React components use it internally. Use it directly only when you need
 * effects without React (e.g. on a plain JS page).
 *
 * It handles four kinds of effects:
 * - bursts ({@link ParticleEngine.burst}),
 * - an always-running background effect ({@link ParticleEngine.setAmbient}),
 * - fly-by events ({@link ParticleEngine.flyby}),
 * - decorations attached to elements ({@link ParticleEngine.setDecorations}).
 *
 * The canvas is appended to the end of `document.body` the first time it is
 * needed. It is `position: fixed` with `pointer-events: none`, so it does not
 * affect layout and never captures clicks. When nothing moves, the animation
 * loop stops and the engine uses no resources; decorations are then redrawn
 * only when {@link ParticleEngine.refreshDecorations} is called (e.g. on scroll).
 * {@link ParticleEngine.destroy} removes the canvas and all listeners.
 *
 * @example
 * ```ts
 * const engine = new ParticleEngine();
 * document.addEventListener('click', (e) => {
 *   engine.burst(e.clientX, e.clientY, christmas.particles);
 * });
 * engine.setAmbient(christmas.ambient!);
 * // later:
 * engine.destroy();
 * ```
 */
export class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private flyers: Flyer[] = [];
  private decor: DecorState[] = [];
  private ambient: AmbientConfig | null = null;
  private ambientScale = 1;
  private ambientAcc = 0;
  private raf = 0;
  private last = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private readonly zIndex: number;
  private readonly maxParticles: number;

  /** @param options - Optional settings. */
  constructor(options: ParticleEngineOptions = {}) {
    this.zIndex = options.zIndex ?? 2147483000;
    this.maxParticles = options.maxParticles ?? 600;
  }

  /**
   * Starts a particle burst at the given viewport coordinates.
   *
   * @param x - Horizontal viewport position (e.g. `MouseEvent.clientX`).
   * @param y - Vertical viewport position (e.g. `MouseEvent.clientY`).
   * @param config - Burst settings (usually a season's `particles` field).
   * @param scale - Multiplier for the particle count (intensity).
   * @defaultValue scale: 1
   */
  burst(x: number, y: number, config: ParticleConfig, scale = 1): void {
    if (!this.ensureCanvas()) return;
    const count = Math.max(1, Math.round((config.count ?? 14) * scale));
    const angle = config.angle ?? -Math.PI / 2;
    const spread = config.spread ?? Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      this.spawn(x, y, a, config);
    }
    this.trim();
    this.start();
  }

  /**
   * Sets (or clears with `null`) the always-running background effect.
   *
   * @param config - Ambient settings (usually a season's `ambient` field), or `null` to stop.
   * @param scale - Multiplier for the spawn rate (intensity).
   * @defaultValue scale: 1
   */
  setAmbient(config: AmbientConfig | null, scale = 1): void {
    this.ambient = config;
    this.ambientScale = scale;
    this.ambientAcc = 0;
    if (config && this.ensureCanvas()) this.start();
  }

  /**
   * Launches a fly-by event (e.g. a shooting star or a bat swarm).
   *
   * @param config - Fly-by settings (usually a season's `flyby` field).
   */
  flyby(config: FlybyConfig): void {
    if (!this.ensureCanvas()) return;
    const count = config.count ?? 1;
    const path = config.path ?? 'across';
    const duration = config.duration ?? 5;
    const [sMin, sMax] = config.size ?? [18, 26];
    const w = this.width;
    const h = this.height;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const baseY = h * rand(0.08, 0.3);
    const baseX = w * rand(0.2, 0.8);
    for (let i = 0; i < count; i++) {
      const { draw, colors } = pickShape(config.shapes, config.colors);
      const spreadY = count > 1 ? rand(-45, 45) : 0;
      const spreadX = count > 1 ? rand(-60, 60) : 0;
      const flyer: Flyer =
        path === 'across'
          ? {
              x0: dir > 0 ? -60 : w + 60,
              x1: dir > 0 ? w + 60 : -60,
              y0: baseY + spreadY,
              y1: baseY + spreadY + rand(-40, 40),
              path,
              flip: dir < 0,
            } as Flyer
          : {
              x0: baseX + spreadX,
              x1: baseX + spreadX + rand(-80, 80),
              y0: h + 60,
              y1: config.finale ? h * rand(0.15, 0.35) : -60,
              path,
              flip: false,
            } as Flyer;
      flyer.age = 0;
      flyer.delay = count > 1 ? rand(0, 0.8) : 0;
      flyer.duration = duration * rand(0.9, 1.1);
      flyer.phase = rand(0, Math.PI * 2);
      flyer.size = rand(sMin, sMax);
      flyer.color = pick(colors);
      flyer.draw = draw;
      flyer.trailAcc = 0;
      flyer.config = config;
      flyer.x = flyer.x0;
      flyer.y = flyer.y0;
      this.flyers.push(flyer);
    }
    this.start();
  }

  /**
   * Replaces the list of decorated elements and redraws.
   *
   * @param targets - The elements to decorate. An empty array removes all decorations.
   */
  setDecorations(targets: DecorationTarget[]): void {
    this.decor = targets.map((t) => ({ ...t, visible: true }));
    if (this.decor.length > 0 && !this.ensureCanvas()) return;
    this.refreshDecorations();
  }

  /**
   * Re-checks which decorated elements are visible (not covered by other
   * elements) and redraws. Call it after scrolling, resizing or layout changes.
   */
  refreshDecorations(): void {
    if (!this.canvas) return;
    for (const d of this.decor) {
      const rect = d.element.getBoundingClientRect();
      if (!d.element.isConnected || rect.width === 0 || rect.height === 0) {
        d.visible = false;
        continue;
      }
      const [px, py] = testPoint(d.slot, rect);
      if (px < 0 || py < 0 || px > this.width || py > this.height) {
        d.visible = false;
        continue;
      }
      const hit = document.elementFromPoint(px, py);
      d.visible = hit !== null && (hit === d.element || d.element.contains(hit));
    }
    this.start();
  }

  /** Stops the animation and removes the canvas and listeners. Safe to call more than once. */
  destroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.particles = [];
    this.flyers = [];
    this.decor = [];
    this.ambient = null;
    if (this.canvas) {
      window.removeEventListener('resize', this.resize);
      this.canvas.remove();
    }
    this.canvas = null;
    this.ctx = null;
  }

  private spawn(x: number, y: number, angle: number, style: ParticleStyle, speedOverride?: number): void {
    const { draw, colors } = pickShape(style.shapes, style.colors);
    const [speedMin, speedMax] = style.speed ?? [80, 260];
    const [sizeMin, sizeMax] = style.size ?? [8, 16];
    const [lifeMin, lifeMax] = style.lifetime ?? [0.9, 1.6];
    const spin = style.spin ?? 4;
    const speed = speedOverride ?? rand(speedMin, speedMax);
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: rand(0, Math.PI * 2),
      vr: rand(-spin, spin),
      size: rand(sizeMin, sizeMax),
      color: pick(colors),
      draw,
      age: 0,
      life: rand(lifeMin, lifeMax),
      gravity: style.gravity ?? 300,
      drag: style.drag ?? 1.5,
      wobble: style.wobble ?? 0,
      wobbleFreq: rand(1.5, 4),
      phase: rand(0, Math.PI * 2),
      opacity: style.opacity ?? 1,
    });
  }

  private trim(): void {
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }

  private start(): void {
    if (this.raf || !this.ctx) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private ensureCanvas(): boolean {
    if (this.canvas) return true;
    if (typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-seasonfx-canvas', '');
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'margin:0',
      'padding:0',
      'border:0',
      'background:transparent',
      'pointer-events:none',
      `z-index:${this.zIndex}`,
      'display:block',
    ].join(';');
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', this.resize);
    return true;
  }

  private resize = (): void => {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.start();
  };

  private spawnAmbient(dt: number): void {
    const cfg = this.ambient;
    if (!cfg) return;
    this.ambientAcc += cfg.rate * (this.width / 1000) * this.ambientScale * dt;
    const fromTop = (cfg.from ?? 'top') === 'top';
    const [speedMin, speedMax] = cfg.speed ?? [30, 70];
    while (this.ambientAcc >= 1) {
      this.ambientAcc -= 1;
      const speed = rand(speedMin, speedMax);
      const x = rand(-20, this.width + 20);
      const y = fromTop ? -20 : this.height + 20;
      const angle = (fromTop ? Math.PI / 2 : -Math.PI / 2) + rand(-0.25, 0.25);
      this.spawn(x, y, angle, { lifetime: [10, 16], drag: 0, gravity: 0, ...cfg }, speed);
    }
    this.trim();
  }

  private updateFlyers(dt: number, ctx: CanvasRenderingContext2D): void {
    const alive: Flyer[] = [];
    for (const f of this.flyers) {
      f.age += dt;
      const t = (f.age - f.delay) / f.duration;
      if (t < 0) {
        alive.push(f);
        continue;
      }
      if (t >= 1) {
        if (f.config.finale) this.burst(f.x, f.y, f.config.finale);
        continue;
      }
      const bob = Math.sin(t * Math.PI * 4 + f.phase) * 16;
      f.x = f.x0 + (f.x1 - f.x0) * t + (f.path === 'rise' ? bob : 0);
      f.y = f.y0 + (f.y1 - f.y0) * t + (f.path === 'across' ? bob : 0);
      if (f.config.trail) {
        f.trailAcc += (f.config.trailRate ?? 30) * dt;
        while (f.trailAcc >= 1) {
          f.trailAcc -= 1;
          this.spawn(f.x, f.y, rand(0, Math.PI * 2), f.config.trail);
        }
      }
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.flip) ctx.scale(-1, 1);
      ctx.rotate(Math.sin(t * Math.PI * 6 + f.phase) * 0.15);
      f.draw(ctx, f.size, f.color);
      ctx.restore();
      alive.push(f);
    }
    this.flyers = alive;
  }

  private drawDecorations(ctx: CanvasRenderingContext2D): void {
    for (const d of this.decor) {
      if (!d.visible) continue;
      const rect = d.element.getBoundingClientRect();
      if (rect.width === 0 || rect.bottom < -60 || rect.top > this.height + 60) continue;
      ctx.save();
      ctx.translate(rect.left, rect.top);
      d.draw(ctx, rect.width, rect.height);
      ctx.restore();
    }
  }

  private loop = (now: number): void => {
    const ctx = this.ctx;
    if (!ctx) {
      this.raf = 0;
      return;
    }
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    this.spawnAmbient(dt);
    this.drawDecorations(ctx);

    const margin = 120;
    const alive: Particle[] = [];
    for (const p of this.particles) {
      p.age += dt;
      if (p.age >= p.life) continue;
      const damping = Math.exp(-p.drag * dt);
      p.vx *= damping;
      p.vy = p.vy * damping + p.gravity * dt;
      p.x += (p.vx + Math.sin(p.age * p.wobbleFreq + p.phase) * p.wobble) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > this.height + margin || p.y < -margin * 3 || p.x < -margin || p.x > this.width + margin) {
        continue;
      }
      alive.push(p);

      const t = p.age / p.life;
      const fade = t > 0.65 ? (1 - t) / 0.35 : 1;
      const pop = Math.min(1, p.age / 0.12);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = fade * p.opacity;
      p.draw(ctx, p.size * (0.4 + 0.6 * pop), p.color);
      ctx.restore();
    }
    this.particles = alive;

    this.updateFlyers(dt, ctx);

    const moving = this.particles.length > 0 || this.flyers.length > 0 || this.ambient !== null;
    this.raf = moving ? requestAnimationFrame(this.loop) : 0;
  };
}
