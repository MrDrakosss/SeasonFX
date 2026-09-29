import { decorations } from '../engine/decorations';
import type { SeasonDefinition } from '../types';
import { dateRange } from './dates';
import { svgUrl } from './pattern';

const pattern = svgUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <g fill='#7c3aed' fill-opacity='0.14'>
    <path d='M20 40q6-7 12-2q2-4 4 0q2-4 4 0q6-5 12 2q-6 0-8 5q-3-3-6 0q-3-3-6 0q-2-5-8-5z'/>
    <path d='M110 120q5-6 10-2q2-3 3 0q2-3 3 0q5-4 10 2q-5 0-7 4q-2-2-5 0q-2-2-5 0q-2-4-9-4z'/>
    <path d='M140 30a14 14 0 1 0 10 24a11 11 0 1 1-10-24z'/>
  </g>
  <g fill='#f97316' fill-opacity='0.25'>
    <circle cx='80' cy='70' r='1.6'/><circle cx='30' cy='140' r='1.3'/>
    <circle cx='160' cy='100' r='1.4'/><circle cx='95' cy='20' r='1.2'/>
  </g>
</svg>`);

/** Halloween: October 20-31. Pumpkins, bats and ghosts, falling leaves, a bat swarm, glowing night buttons. */
export const halloween: SeasonDefinition = {
  id: 'halloween',
  name: 'Halloween',
  icon: { shape: 'pumpkin', colors: ['#f97316'] },
  accent: '#ea580c',
  isActive: dateRange('10-20', '10-31'),
  secret: 'boo',
  particles: {
    shapes: [
      { shape: 'pumpkin', colors: ['#f97316', '#ea580c', '#fb923c'], weight: 2 },
      { shape: 'bat', colors: ['#1f1235', '#3b0764', '#4c1d95'], weight: 2 },
      { shape: 'ghost', colors: ['#f5f5f4'], weight: 1 },
    ],
    count: 12,
    size: [14, 24],
    speed: [100, 300],
    gravity: 260,
    drag: 1.3,
    lifetime: [1.1, 1.8],
    spin: 3,
    wobble: 15,
  },
  ambient: {
    shapes: [
      { shape: 'leaf', colors: ['#ea580c', '#c2410c', '#d97706', '#92400e'], weight: 5 },
      { shape: 'bat', colors: ['#3b0764'], weight: 1 },
    ],
    rate: 3,
    size: [10, 18],
    speed: [35, 70],
    gravity: 6,
    drag: 0,
    wobble: 35,
    spin: 1.5,
    lifetime: [12, 18],
    opacity: 0.8,
  },
  flyby: {
    shapes: [{ shape: 'bat', colors: ['#1f1235', '#3b0764', '#312e81'] }],
    count: 7,
    size: [16, 26],
    duration: 6,
    path: 'across',
  },
  decorations: decorations.halloween,
  theme: {
    dark: {
      surface: '#1c1426',
      onSurface: '#fde68a',
      border: '#a855f7',
      glow: 'rgba(249, 115, 22, 0.7)',
    },
    primary: '#f97316',
    secondary: '#a855f7',
    onPrimary: '#ffedd5',
    buttonBackground: 'linear-gradient(180deg, #3b0764 0%, #1e1b4b 100%)',
    buttonRing: 'rgba(249, 115, 22, 0.75)',
    glow: 'rgba(249, 115, 22, 0.6)',
    ring: '#f97316',
    surface: '#1c1426',
    onSurface: '#fde68a',
    border: '#7c3aed',
    gradient: 'linear-gradient(90deg, #f97316 0%, #a855f7 100%)',
    radius: '8px',
    pattern: `radial-gradient(1100px 520px at 50% -160px, rgba(124, 58, 237, 0.12), rgba(124, 58, 237, 0) 70%), ${pattern}`,
    buttonHoverExtra: 'text-shadow: 0 0 10px rgba(251, 146, 60, 0.9);',
    css: `
@keyframes season-ui-flicker {
  0%, 100% { filter: brightness(1.05); }
  45% { filter: brightness(1.25); }
  50% { filter: brightness(0.9); }
  55% { filter: brightness(1.2); }
}
@media (prefers-reduced-motion: no-preference) {
  {button}:not(:disabled):hover { animation: season-ui-flicker 1.8s ease-in-out infinite; }
}`,
  },
};
