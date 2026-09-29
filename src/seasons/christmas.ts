import { decorations } from '../engine/decorations';
import type { SeasonDefinition } from '../types';
import { dateRange } from './dates';
import { svgUrl } from './pattern';

const pattern = svgUrl(`
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
  <g fill='none' stroke='#60a5fa' stroke-opacity='0.22' stroke-width='1.5' stroke-linecap='round'>
    <path d='M34 18v24M23.6 24l20.8 12M23.6 36l20.8-12'/>
    <path d='M112 92v18M104.2 96.5l15.6 9M104.2 105.5l15.6-9'/>
    <path d='M60 128v12M54.8 131l10.4 6M54.8 137l10.4-6'/>
  </g>
  <g fill='#93c5fd' fill-opacity='0.35'>
    <circle cx='84' cy='40' r='2'/><circle cx='20' cy='98' r='1.5'/>
    <circle cx='140' cy='24' r='1.5'/><circle cx='130' cy='146' r='2'/>
  </g>
</svg>`);

/** Christmas: December 1-26. Snowflakes and golden stars, snowfall, a shooting star, candy-cane buttons. */
export const christmas: SeasonDefinition = {
  id: 'christmas',
  name: 'Christmas',
  icon: { shape: 'snowflake', colors: ['#3b82f6'] },
  accent: '#dc2626',
  isActive: dateRange('12-01', '12-26'),
  secret: 'snow',
  particles: {
    shapes: [
      { shape: 'snowflake', colors: ['#ffffff', '#bfdbfe', '#93c5fd', '#60a5fa'], weight: 4 },
      { shape: 'star', colors: ['#facc15', '#fde047'], weight: 1 },
    ],
    count: 14,
    size: [10, 20],
    speed: [60, 220],
    gravity: 90,
    drag: 1.4,
    lifetime: [1.4, 2.4],
    spin: 2,
    wobble: 25,
  },
  ambient: {
    shapes: [{ shape: 'snowflake', colors: ['#93c5fd', '#60a5fa', '#bfdbfe', '#ffffff'] }],
    rate: 7,
    size: [6, 14],
    speed: [25, 60],
    gravity: 4,
    drag: 0,
    wobble: 22,
    spin: 0.8,
    lifetime: [14, 22],
    opacity: 0.85,
  },
  flyby: {
    shapes: [{ shape: 'star', colors: ['#fde047'] }],
    size: [16, 20],
    duration: 3.2,
    path: 'across',
    trailRate: 45,
    trail: {
      shapes: [
        { shape: 'spark', colors: ['#fef9c3', '#fde047', '#ffffff'] },
        { shape: 'snowflake', colors: ['#e0f2fe'], weight: 0.4 },
      ],
      size: [3, 7],
      speed: [5, 30],
      gravity: 30,
      drag: 1,
      lifetime: [0.6, 1.2],
      spin: 2,
    },
  },
  decorations: decorations.christmas,
  theme: {
    dark: {
      surface: '#221416',
      onSurface: '#fde8e8',
      border: '#7f1d1d',
      buttonRing: 'rgba(255, 255, 255, 0.25)',
      glow: 'rgba(239, 68, 68, 0.55)',
    },
    primary: '#dc2626',
    secondary: '#16a34a',
    onPrimary: '#ffffff',
    buttonBackground:
      'repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.13) 0 8px, rgba(255, 255, 255, 0) 8px 16px), linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
    buttonRing: 'rgba(255, 255, 255, 0.35)',
    glow: 'rgba(220, 38, 38, 0.55)',
    ring: '#16a34a',
    surface: '#fffaf5',
    onSurface: '#1f2937',
    border: '#fecaca',
    gradient: 'linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #16a34a 100%)',
    radius: '10px',
    pattern: `radial-gradient(1100px 520px at 50% -160px, rgba(220, 38, 38, 0.10), rgba(220, 38, 38, 0) 70%), ${pattern}`,
    buttonHoverExtra: 'background-position: 22px 0, 0 0;',
  },
};
