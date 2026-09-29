import { decorations } from '../engine/decorations';
import type { SeasonDefinition } from '../types';
import { dateRange } from './dates';
import { svgUrl } from './pattern';

const pattern = svgUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
  <rect x='20' y='24' width='8' height='4' rx='1' transform='rotate(25 24 26)' fill='#f43f5e' fill-opacity='0.22'/>
  <rect x='110' y='40' width='8' height='4' rx='1' transform='rotate(-30 114 42)' fill='#3b82f6' fill-opacity='0.22'/>
  <rect x='60' y='120' width='8' height='4' rx='1' transform='rotate(60 64 122)' fill='#22c55e' fill-opacity='0.22'/>
  <rect x='130' y='130' width='8' height='4' rx='1' transform='rotate(10 134 132)' fill='#a855f7' fill-opacity='0.22'/>
  <g fill='#eab308' fill-opacity='0.35'>
    <circle cx='80' cy='70' r='1.8'/><circle cx='30' cy='90' r='1.4'/><circle cx='150' cy='90' r='1.4'/>
  </g>
</svg>`);

const confettiColors = ['#f43f5e', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4'];

/** New Year: December 27 - January 2. Confetti and sparks, glitter, fireworks, golden shimmer buttons. */
export const newYear: SeasonDefinition = {
  id: 'new-year',
  name: 'New Year',
  icon: { shape: 'star', colors: ['#eab308'] },
  accent: '#ca8a04',
  isActive: dateRange('12-27', '01-02'),
  secret: 'party',
  particles: {
    shapes: [
      { shape: 'confetti', weight: 3 },
      { shape: 'spark', colors: ['#fde047', '#fbbf24', '#ffffff'], weight: 2 },
      { shape: 'star', colors: ['#fbbf24'], weight: 1 },
    ],
    colors: confettiColors,
    count: 22,
    size: [6, 12],
    speed: [220, 520],
    gravity: 520,
    drag: 2,
    lifetime: [0.9, 1.5],
    spin: 10,
    angle: -Math.PI / 2,
    spread: Math.PI * 1.1,
  },
  ambient: {
    shapes: [
      { shape: 'spark', colors: ['#fde047', '#fbbf24', '#ffffff'], weight: 2 },
      { shape: 'confetti', colors: confettiColors, weight: 1 },
    ],
    rate: 5,
    size: [4, 9],
    speed: [30, 65],
    gravity: 4,
    drag: 0,
    wobble: 18,
    spin: 3,
    lifetime: [12, 18],
    opacity: 0.8,
  },
  flyby: {
    shapes: [{ shape: 'spark', colors: ['#fde68a'] }],
    count: 3,
    size: [10, 12],
    duration: 1.6,
    path: 'rise',
    trailRate: 60,
    trail: {
      shapes: [{ shape: 'spark', colors: ['#fbbf24', '#fde68a'] }],
      size: [3, 6],
      speed: [5, 30],
      gravity: 120,
      drag: 1.5,
      lifetime: [0.3, 0.7],
    },
    finale: {
      shapes: [
        { shape: 'spark', colors: ['#fde047', '#f472b6', '#60a5fa', '#4ade80'], weight: 3 },
        { shape: 'star', colors: ['#fbbf24'], weight: 1 },
      ],
      count: 40,
      size: [5, 10],
      speed: [120, 380],
      gravity: 180,
      drag: 1.6,
      lifetime: [1, 1.8],
    },
  },
  decorations: decorations.newYear,
  theme: {
    dark: {
      surface: '#0f172a',
      onSurface: '#fef9c3',
      border: '#ca8a04',
      primary: '#facc15',
    },
    primary: '#ca8a04',
    secondary: '#7c3aed',
    onPrimary: '#422006',
    buttonBackground:
      'linear-gradient(110deg, rgba(255, 255, 255, 0) 38%, rgba(255, 255, 255, 0.75) 48%, rgba(255, 255, 255, 0) 58%), linear-gradient(180deg, #fef08a 0%, #facc15 42%, #eab308 58%, #ca8a04 100%)',
    buttonRing: 'rgba(255, 255, 255, 0.6)',
    glow: 'rgba(234, 179, 8, 0.6)',
    ring: '#eab308',
    surface: '#0f172a',
    onSurface: '#fef9c3',
    border: '#eab308',
    gradient: 'linear-gradient(90deg, #facc15 0%, #f472b6 50%, #818cf8 100%)',
    radius: '10px',
    pattern: `radial-gradient(1100px 520px at 50% -160px, rgba(234, 179, 8, 0.12), rgba(234, 179, 8, 0) 70%), ${pattern}`,
    buttonExtra:
      'background-size: 250% 100%, 100% 100%; background-position: 100% 0, 0 0; background-repeat: no-repeat; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);',
    css: `
@keyframes season-ui-shimmer {
  from { background-position: 100% 0, 0 0; }
  to { background-position: 0% 0, 0 0; }
}
@media (prefers-reduced-motion: no-preference) {
  {button}:not(:disabled):hover { animation: season-ui-shimmer 1.6s ease-in-out infinite; }
}`,
  },
};
