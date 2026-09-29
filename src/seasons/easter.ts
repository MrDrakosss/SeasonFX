import { decorations } from '../engine/decorations';
import type { SeasonDefinition } from '../types';
import { easterRange } from './dates';
import { svgUrl } from './pattern';

const pattern = svgUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
  <ellipse cx='30' cy='34' rx='7' ry='9' fill='#f9a8d4' fill-opacity='0.28'/>
  <ellipse cx='118' cy='96' rx='6' ry='8' fill='#93c5fd' fill-opacity='0.3'/>
  <ellipse cx='70' cy='136' rx='5' ry='7' fill='#86efac' fill-opacity='0.32'/>
  <g fill='#fde68a' fill-opacity='0.4'>
    <circle cx='96' cy='30' r='2'/><circle cx='20' cy='100' r='1.6'/><circle cx='146' cy='150' r='1.8'/>
  </g>
</svg>`);

const pastel = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd'];

/** Easter: Palm Sunday (Easter - 7 days) through Easter Monday. Pastel eggs and flowers, falling petals, rolling eggs. */
export const easter: SeasonDefinition = {
  id: 'easter',
  name: 'Easter',
  icon: { shape: 'egg', colors: ['#a78bfa'] },
  accent: '#16a34a',
  isActive: easterRange(7, 1),
  secret: 'bunny',
  particles: {
    shapes: [
      { shape: 'egg', colors: pastel, weight: 3 },
      { shape: 'flower', colors: ['#f9a8d4', '#a5b4fc', '#fdba74'], weight: 2 },
    ],
    count: 12,
    size: [12, 20],
    speed: [120, 320],
    gravity: 420,
    drag: 1.2,
    lifetime: [1, 1.6],
    spin: 5,
  },
  ambient: {
    shapes: ['flower'],
    colors: ['#f9a8d4', '#fbcfe8', '#c4b5fd', '#fde68a'],
    rate: 3,
    size: [7, 12],
    speed: [25, 50],
    gravity: 3,
    drag: 0,
    wobble: 25,
    spin: 1,
    lifetime: [14, 22],
    opacity: 0.75,
  },
  flyby: {
    shapes: [{ shape: 'egg', colors: pastel }],
    count: 3,
    size: [18, 24],
    duration: 6,
    path: 'across',
    trailRate: 8,
    trail: {
      shapes: ['flower'],
      colors: ['#f9a8d4', '#a5b4fc'],
      size: [5, 8],
      speed: [5, 30],
      gravity: 60,
      lifetime: [0.8, 1.3],
      spin: 2,
    },
  },
  decorations: decorations.easter,
  theme: {
    dark: {
      surface: '#1c2620',
      onSurface: '#ecfdf5',
      border: '#7e22ce',
      primary: '#c084fc',
      ring: '#c084fc',
    },
    primary: '#a855f7',
    secondary: '#22c55e',
    onPrimary: '#1e293b',
    buttonBackground: 'linear-gradient(135deg, #bbf7d0 0%, #bfdbfe 50%, #fbcfe8 100%)',
    buttonRing: 'rgba(255, 255, 255, 0.85)',
    glow: 'rgba(168, 85, 247, 0.45)',
    ring: '#a855f7',
    surface: '#fefce8',
    onSurface: '#1e293b',
    border: '#e9d5ff',
    gradient: 'linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #22c55e 100%)',
    radius: '14px',
    pattern: `radial-gradient(1100px 520px at 50% -160px, rgba(134, 239, 172, 0.16), rgba(134, 239, 172, 0) 70%), ${pattern}`,
    buttonExtra: 'background-size: 200% 200%; background-position: 0% 0%;',
    buttonHoverExtra: 'background-position: 100% 100%;',
  },
};
