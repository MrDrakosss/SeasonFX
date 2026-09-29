import { decorations } from '../engine/decorations';
import type { SeasonDefinition } from '../types';
import { dateRange } from './dates';
import { svgUrl } from './pattern';

const heart = (x: number, y: number, s: number) =>
  `<path transform='translate(${x} ${y}) scale(${s})' d='M10 17C3 12 2 7 5 5c2-2 4-1 5 1c1-2 3-3 5-1c3 2 2 7-5 12z'/>`;

const pattern = svgUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'>
  <g fill='#fb7185' fill-opacity='0.16'>
    ${heart(14, 20, 1)}${heart(96, 70, 0.8)}${heart(40, 110, 0.6)}${heart(120, 10, 0.5)}
  </g>
</svg>`);

/** Valentine's Day: February 7-14. Hearts everywhere, rising hearts in the background, a heart balloon, pill buttons. */
export const valentine: SeasonDefinition = {
  id: 'valentine',
  name: "Valentine's Day",
  icon: { shape: 'heart', colors: ['#e11d48'] },
  accent: '#e11d48',
  isActive: dateRange('02-07', '02-14'),
  secret: 'love',
  particles: {
    shapes: ['heart'],
    colors: ['#f43f5e', '#ec4899', '#fb7185', '#e11d48', '#f9a8d4'],
    count: 12,
    size: [10, 20],
    speed: [60, 200],
    gravity: -70,
    drag: 1.6,
    lifetime: [1.2, 2],
    spin: 1.5,
    wobble: 30,
  },
  ambient: {
    shapes: ['heart'],
    colors: ['#fb7185', '#f9a8d4', '#f43f5e'],
    rate: 3,
    from: 'bottom',
    size: [8, 16],
    speed: [25, 55],
    gravity: -3,
    drag: 0,
    wobble: 20,
    spin: 0.4,
    lifetime: [14, 22],
    opacity: 0.6,
  },
  flyby: {
    shapes: [{ shape: 'heart', colors: ['#e11d48'] }],
    size: [30, 36],
    duration: 7,
    path: 'rise',
    trailRate: 12,
    trail: {
      shapes: ['heart'],
      colors: ['#fb7185', '#f9a8d4'],
      size: [4, 8],
      speed: [5, 25],
      gravity: -20,
      lifetime: [0.8, 1.4],
      spin: 1,
    },
  },
  decorations: decorations.valentine,
  theme: {
    dark: {
      surface: '#2a0f18',
      onSurface: '#ffe4e6',
      border: '#9f1239',
      buttonRing: 'rgba(255, 255, 255, 0.25)',
    },
    primary: '#e11d48',
    secondary: '#ec4899',
    onPrimary: '#ffffff',
    buttonBackground: 'linear-gradient(135deg, #fb7185 0%, #e11d48 55%, #be123c 100%)',
    buttonRing: 'rgba(255, 255, 255, 0.4)',
    glow: 'rgba(225, 29, 72, 0.55)',
    ring: '#ec4899',
    surface: '#fff1f2',
    onSurface: '#4c0519',
    border: '#fecdd3',
    gradient: 'linear-gradient(90deg, #e11d48 0%, #ec4899 50%, #f472b6 100%)',
    radius: '999px',
    pattern: `radial-gradient(1100px 520px at 50% -160px, rgba(236, 72, 153, 0.10), rgba(236, 72, 153, 0) 70%), ${pattern}`,
    css: `
@keyframes seasonfx-heartbeat {
  0%, 100% { transform: translateY(-1px) scale(1); }
  30% { transform: translateY(-1px) scale(1.04); }
  60% { transform: translateY(-1px) scale(0.995); }
}
@media (prefers-reduced-motion: no-preference) {
  {button}:not(:disabled):hover { animation: seasonfx-heartbeat 1.1s ease-in-out infinite; }
}`,
  },
};
