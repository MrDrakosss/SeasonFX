import type { BuiltInShape, ShapeDrawer } from '../types';

const TAU = Math.PI * 2;

const snowflake: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.25, -r * 0.78);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.25, -r * 0.78);
    ctx.rotate(TAU / 6);
  }
  ctx.stroke();
};

const star: ShapeDrawer = (ctx, size, color) => {
  const outer = size / 2;
  const inner = outer * 0.45;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
};

const heart: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.3, r * 0.1, -r * 0.8, -r * 1.0, 0, -r * 0.4);
  ctx.bezierCurveTo(r * 0.8, -r * 1.0, r * 1.3, r * 0.1, 0, r * 0.9);
  ctx.fill();
};

const confetti: ShapeDrawer = (ctx, size, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(-size / 2, -size / 4, size, size / 2);
};

const spark: ShapeDrawer = (ctx, size, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size / 4, 0, TAU);
  ctx.fill();
  ctx.globalAlpha *= 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, TAU);
  ctx.fill();
};

const pumpkin: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = '#4d7c0f';
  ctx.fillRect(-r * 0.09, -r * 0.9, r * 0.18, r * 0.35);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, r * 0.1, r * 0.45, r * 0.68, 0, 0, TAU);
  ctx.ellipse(r * 0.38, r * 0.1, r * 0.45, r * 0.68, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.5, r * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(40, 20, 0, 0.75)';
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.05);
  ctx.lineTo(-r * 0.15, -r * 0.05);
  ctx.lineTo(-r * 0.27, -r * 0.3);
  ctx.moveTo(r * 0.4, -r * 0.05);
  ctx.lineTo(r * 0.15, -r * 0.05);
  ctx.lineTo(r * 0.27, -r * 0.3);
  ctx.moveTo(-r * 0.4, r * 0.25);
  ctx.quadraticCurveTo(0, r * 0.6, r * 0.4, r * 0.25);
  ctx.quadraticCurveTo(0, r * 0.4, -r * 0.4, r * 0.25);
  ctx.fill();
};

const bat: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const sx of [1, -1]) {
    ctx.moveTo(0, -r * 0.2);
    ctx.quadraticCurveTo(sx * r * 0.45, -r * 0.6, sx * r, -r * 0.3);
    ctx.quadraticCurveTo(sx * r * 0.8, -r * 0.05, sx * r * 0.72, r * 0.22);
    ctx.quadraticCurveTo(sx * r * 0.55, r * 0.02, sx * r * 0.38, r * 0.22);
    ctx.quadraticCurveTo(sx * r * 0.22, r * 0.05, 0, r * 0.3);
    ctx.closePath();
  }
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.05, r * 0.15, r * 0.22, 0, 0, TAU);
  ctx.moveTo(-r * 0.13, -r * 0.15);
  ctx.lineTo(-r * 0.1, -r * 0.4);
  ctx.lineTo(-r * 0.02, -r * 0.2);
  ctx.moveTo(r * 0.13, -r * 0.15);
  ctx.lineTo(r * 0.1, -r * 0.4);
  ctx.lineTo(r * 0.02, -r * 0.2);
  ctx.fill();
};

const ghost: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, r * 0.8);
  ctx.lineTo(-r * 0.7, -r * 0.1);
  ctx.arc(0, -r * 0.1, r * 0.7, Math.PI, 0);
  ctx.lineTo(r * 0.7, r * 0.8);
  ctx.quadraticCurveTo(r * 0.47, r * 0.55, r * 0.23, r * 0.8);
  ctx.quadraticCurveTo(0, r * 0.55, -r * 0.23, r * 0.8);
  ctx.quadraticCurveTo(-r * 0.47, r * 0.55, -r * 0.7, r * 0.8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1f1235';
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, -r * 0.15, r * 0.11, r * 0.16, 0, 0, TAU);
  ctx.ellipse(r * 0.25, -r * 0.15, r * 0.11, r * 0.16, 0, 0, TAU);
  ctx.fill();
};

const egg: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo(r * 0.6, -r, r * 0.8, -r * 0.1, r * 0.8, r * 0.25);
  ctx.bezierCurveTo(r * 0.8, r * 0.75, r * 0.45, r, 0, r);
  ctx.bezierCurveTo(-r * 0.45, r, -r * 0.8, r * 0.75, -r * 0.8, r * 0.25);
  ctx.bezierCurveTo(-r * 0.8, -r * 0.1, -r * 0.6, -r, 0, -r);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = Math.max(1, r * 0.16);
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const x = -r + (i * r) / 4;
    const y = i % 2 === 0 ? -r * 0.05 : r * 0.2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

const flower: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * TAU) / 5;
    const px = Math.cos(a) * r * 0.55;
    const py = Math.sin(a) * r * 0.55;
    ctx.moveTo(px + r * 0.4, py);
    ctx.arc(px, py, r * 0.4, 0, TAU);
  }
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, TAU);
  ctx.fill();
};

const leaf: ShapeDrawer = (ctx, size, color) => {
  const r = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 0.9, -r * 0.5, r * 0.55, r * 0.35);
  ctx.quadraticCurveTo(r * 0.3, r * 0.7, 0, r * 0.75);
  ctx.quadraticCurveTo(-r * 0.3, r * 0.7, -r * 0.55, r * 0.35);
  ctx.quadraticCurveTo(-r * 0.9, -r * 0.5, 0, -r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 30, 0, 0.45)';
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.lineTo(0, r);
  ctx.stroke();
};

/**
 * Drawing functions of the built-in shapes, keyed by name.
 *
 * @remarks
 * Useful as a reference when writing a custom {@link ShapeDrawer}, or to wrap
 * an existing shape.
 */
export const shapes: Readonly<Record<BuiltInShape, ShapeDrawer>> = {
  snowflake,
  star,
  heart,
  confetti,
  spark,
  pumpkin,
  bat,
  ghost,
  egg,
  flower,
  leaf,
};
