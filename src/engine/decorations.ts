import type { DecorationDrawer, DecorationSlot } from '../types';
import { shapes } from './shapes';

const TAU = Math.PI * 2;

/** Deterministic pseudo random number in [0, 1) so decorations do not flicker between frames. */
function noise(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Size of hats and corner pieces for an element of the given size. */
function pieceSize(width: number, height: number): number {
  return Math.max(18, Math.min(44, Math.min(width, height) * 0.75));
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Points of a sagging string between two points (a simple parabola). */
function sag(x0: number, x1: number, y: number, depth: number, t: number): [number, number] {
  return [x0 + (x1 - x0) * t, y + depth * 4 * t * (1 - t)];
}

// Christmas

const santaHat: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(s * 0.3, s * 0.02);
  ctx.rotate(-0.45);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-s * 0.42, -s * 0.08);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.9, s * 0.35, -s * 0.95);
  ctx.quadraticCurveTo(s * 0.62, -s * 0.9, s * 0.64, -s * 0.58);
  ctx.lineTo(s * 0.42, -s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.moveTo(s * 0.1, -s * 0.1);
  ctx.quadraticCurveTo(s * 0.3, -s * 0.6, s * 0.35, -s * 0.95);
  ctx.quadraticCurveTo(s * 0.62, -s * 0.9, s * 0.64, -s * 0.58);
  ctx.lineTo(s * 0.42, -s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundedRect(ctx, -s * 0.52, -s * 0.18, s * 1.04, s * 0.3, s * 0.15);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.64, -s * 0.56, s * 0.14, 0, TAU);
  ctx.fill();
  ctx.stroke();
};

const snowCap: DecorationDrawer = (ctx, w) => {
  const step = 14;
  ctx.translate(0, 4);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3, 4);
  let i = 0;
  for (let x = -3; x < w + 3; x += step, i++) {
    const next = Math.min(x + step, w + 3);
    ctx.quadraticCurveTo((x + next) / 2, -5 - noise(i) * 5, next, -1 - noise(i + 50) * 2);
  }
  ctx.lineTo(w + 3, 4);
  for (let x = w; x > 0; x -= step * 2.5, i++) {
    if (noise(i) > 0.45) {
      const dripX = x - noise(i + 7) * step;
      const len = 3 + noise(i + 3) * 6;
      ctx.lineTo(dripX + 3, 4);
      ctx.quadraticCurveTo(dripX + 3, 4 + len, dripX, 4 + len);
      ctx.quadraticCurveTo(dripX - 3, 4 + len, dripX - 3, 4);
    }
  }
  ctx.lineTo(-3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const holly: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(w - s * 0.1, s * 0.05);
  ctx.fillStyle = '#15803d';
  for (const a of [-0.5, 0.9]) {
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let k = 1; k <= 4; k++) {
      ctx.lineTo(-s * 0.16 * k, -s * (k % 2 === 0 ? 0.2 : 0.12));
    }
    ctx.lineTo(-s * 0.8, 0);
    for (let k = 4; k >= 1; k--) {
      ctx.lineTo(-s * 0.16 * k, s * (k % 2 === 0 ? 0.2 : 0.12));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#dc2626';
  for (const [x, y] of [
    [-s * 0.05, -s * 0.05],
    [s * 0.1, s * 0.08],
    [-s * 0.12, s * 0.12],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.1, 0, TAU);
    ctx.fill();
  }
};

// Halloween

const witchHat: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(s * 0.3, s * 0.02);
  ctx.rotate(-0.35);
  ctx.fillStyle = '#1e1033';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.62, s * 0.14, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.32, -s * 0.05);
  ctx.quadraticCurveTo(-s * 0.1, -s * 0.6, s * 0.05, -s * 0.9);
  ctx.quadraticCurveTo(s * 0.25, -s * 1.05, s * 0.45, -s * 0.92);
  ctx.quadraticCurveTo(s * 0.2, -s * 0.8, s * 0.32, -s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-s * 0.3, -s * 0.22, s * 0.6, s * 0.12);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-s * 0.06, -s * 0.23, s * 0.12, s * 0.14);
};

const slime: DecorationDrawer = (ctx, w) => {
  ctx.fillStyle = '#84cc16';
  ctx.strokeStyle = 'rgba(54, 83, 20, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.lineTo(w + 2, -2);
  ctx.lineTo(w + 2, 3);
  let i = 0;
  for (let x = w; x > 0; x -= 18, i++) {
    const len = noise(i) > 0.4 ? 4 + noise(i + 9) * 12 : 1;
    const cx = x - 9;
    ctx.lineTo(cx + 4, 3);
    ctx.lineTo(cx + 2, 3 + len);
    ctx.arc(cx, 3 + len, 2.2, 0, Math.PI);
    ctx.lineTo(cx - 4, 3);
  }
  ctx.lineTo(-2, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(0, -1, w, 1.5);
};

const spiderWeb: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h) * 1.3;
  ctx.translate(w, 0);
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.75)';
  ctx.lineWidth = 1;
  const spokes = 5;
  const angles: number[] = [];
  for (let k = 0; k < spokes; k++) angles.push(Math.PI / 2 + (k * (Math.PI / 2)) / (spokes - 1));
  ctx.beginPath();
  for (const a of angles) {
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
  }
  for (const ring of [0.35, 0.62, 0.9]) {
    for (let k = 0; k < spokes - 1; k++) {
      const a0 = angles[k];
      const a1 = angles[k + 1];
      const r = s * ring;
      const mid = (a0 + a1) / 2;
      ctx.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
      ctx.quadraticCurveTo(Math.cos(mid) * r * 0.82, Math.sin(mid) * r * 0.82, Math.cos(a1) * r, Math.sin(a1) * r);
    }
  }
  ctx.stroke();
  const tx = -s * 0.55;
  const ty = s * 0.95;
  ctx.beginPath();
  ctx.moveTo(tx, s * 0.3);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#111827';
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const dy = -2 + k * 1.6;
    ctx.moveTo(tx - 2, ty + 3 + dy);
    ctx.lineTo(tx - 6, ty + dy + (k < 2 ? -1 : 3));
    ctx.moveTo(tx + 2, ty + 3 + dy);
    ctx.lineTo(tx + 6, ty + dy + (k < 2 ? -1 : 3));
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(tx, ty + 4, 3, 4, 0, 0, TAU);
  ctx.fill();
};

// Valentine's Day

const bow: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(s * 0.3, s * 0.05);
  ctx.rotate(-0.3);
  ctx.fillStyle = '#e11d48';
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * s * 0.45, -s * 0.55, dir * s * 0.7, -s * 0.05, dir * s * 0.55, s * 0.12);
    ctx.bezierCurveTo(dir * s * 0.45, s * 0.25, dir * s * 0.15, s * 0.1, 0, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.05, s * 0.05);
    ctx.lineTo(dir * s * 0.3, s * 0.5);
    ctx.lineTo(dir * s * 0.18, s * 0.45);
    ctx.lineTo(dir * s * 0.12, s * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.11, 0, TAU);
  ctx.fill();
};

const heartGarland: DecorationDrawer = (ctx, w) => {
  const depth = Math.min(14, w * 0.06);
  ctx.strokeStyle = 'rgba(190, 18, 60, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 0; k <= 20; k++) {
    const [x, y] = sag(0, w, 0, depth, k / 20);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const count = Math.max(2, Math.floor(w / 30));
  const colors = ['#e11d48', '#f472b6', '#fb7185'];
  for (let k = 1; k < count; k++) {
    const [x, y] = sag(0, w, 0, depth, k / count);
    ctx.save();
    ctx.translate(x, y + 6);
    ctx.rotate((noise(k) - 0.5) * 0.5);
    shapes.heart(ctx, 11, colors[k % colors.length]);
    ctx.restore();
  }
};

const cupidHeart: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(w - s * 0.15, s * 0.05);
  ctx.rotate(0.3);
  shapes.heart(ctx, s * 0.9, '#e11d48');
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, s * 0.3);
  ctx.lineTo(s * 0.6, -s * 0.3);
  ctx.stroke();
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(s * 0.7, -s * 0.35);
  ctx.lineTo(s * 0.5, -s * 0.36);
  ctx.lineTo(s * 0.6, -s * 0.2);
  ctx.closePath();
  ctx.fill();
};

// Easter

const bunnyEars: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(s * 0.35, s * 0.1);
  for (const [dx, a] of [
    [-s * 0.16, -0.25],
    [s * 0.16, 0.2],
  ]) {
    ctx.save();
    ctx.translate(dx, 0);
    ctx.rotate(a);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.16, s * 0.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f9a8d4';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.48, s * 0.08, s * 0.36, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
};

const grass: DecorationDrawer = (ctx, w) => {
  ctx.translate(0, 5);
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.moveTo(0, 2);
  let i = 0;
  for (let x = 0; x < w; x += 5, i++) {
    const tall = 5 + noise(i) * 8;
    ctx.lineTo(x + 2.5 + (noise(i + 3) - 0.5) * 3, 2 - tall);
    ctx.lineTo(Math.min(x + 5, w), 2);
  }
  ctx.lineTo(w, 4);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();
  const colors = ['#f9a8d4', '#fde047', '#a5b4fc', '#fdba74'];
  for (let x = 20, k = 0; x < w - 10; x += 50 + noise(k) * 30, k++) {
    ctx.save();
    ctx.translate(x, -6);
    shapes.flower(ctx, 9, colors[k % colors.length]);
    ctx.restore();
  }
};

const easterEgg: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(w - s * 0.15, s * 0.05);
  ctx.rotate(0.35);
  shapes.egg(ctx, s * 0.95, '#93c5fd');
};

// New Year

const partyHat: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(s * 0.3, s * 0.05);
  ctx.rotate(-0.35);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, 0);
  ctx.lineTo(s * 0.35, 0);
  ctx.lineTo(0, -s * 1.05);
  ctx.closePath();
  ctx.fillStyle = '#facc15';
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = s * 0.1;
  ctx.beginPath();
  for (let k = -3; k <= 3; k++) {
    ctx.moveTo(k * s * 0.22 - s * 0.5, 0);
    ctx.lineTo(k * s * 0.22 + s * 0.5, -s * 1.1);
  }
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(0, -s * 1.05, s * 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-s * 0.38, -s * 0.04, s * 0.76, s * 0.08);
};

const bunting: DecorationDrawer = (ctx, w) => {
  const depth = Math.min(12, w * 0.05);
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 0; k <= 20; k++) {
    const [x, y] = sag(0, w, 0, depth, k / 20);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const colors = ['#f43f5e', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
  const count = Math.max(2, Math.floor(w / 22));
  for (let k = 0; k < count; k++) {
    const [x0, y0] = sag(0, w, 0, depth, (k + 0.15) / count);
    const [x1, y1] = sag(0, w, 0, depth, (k + 0.85) / count);
    ctx.fillStyle = colors[k % colors.length];
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo((x0 + x1) / 2, (y0 + y1) / 2 + 10);
    ctx.closePath();
    ctx.fill();
  }
};

const starburst: DecorationDrawer = (ctx, w, h) => {
  const s = pieceSize(w, h);
  ctx.translate(w - s * 0.2, s * 0.05);
  const colors = ['#facc15', '#f43f5e', '#38bdf8', '#a855f7'];
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let k = 0; k < 12; k++) {
    const a = (k * TAU) / 12;
    const color = colors[k % colors.length];
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * s * 0.15, Math.sin(a) * s * 0.15);
    ctx.lineTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Math.cos(a) * s * 0.6, Math.sin(a) * s * 0.6, 1.8, 0, TAU);
    ctx.fill();
  }
};

/**
 * Built-in decoration drawers of each built-in season, keyed by season id and slot.
 *
 * @remarks
 * - `hat` sits on the element's top-left corner.
 * - `edge` runs along the element's top edge.
 * - `corner` sits on the element's top-right corner.
 *
 * Reuse them in custom seasons, e.g. `decorations: { hat: decorations.christmas.hat }`.
 */
export const decorations: Readonly<Record<string, Readonly<Record<DecorationSlot, DecorationDrawer>>>> = {
  christmas: { hat: santaHat, edge: snowCap, corner: holly },
  halloween: { hat: witchHat, edge: slime, corner: spiderWeb },
  valentine: { hat: bow, edge: heartGarland, corner: cupidHeart },
  easter: { hat: bunnyEars, edge: grass, corner: easterEgg },
  newYear: { hat: partyHat, edge: bunting, corner: starburst },
};
