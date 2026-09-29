// Flat bakery illustrations drawn with inline SVG, so the demo needs no image files.

interface ArtProps {
  size?: number;
  tint?: string;
}

const CRUST = '#c98b4b';
const CRUST_DARK = '#9a6232';
const CRUMB = '#f3dcb8';

export function Loaf({ size = 120, tint = CRUST }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="96" rx="42" ry="6" fill="rgba(60, 35, 10, 0.12)" />
      <path d="M16 74c0-26 20-42 44-42s44 16 44 42c0 12-8 18-20 18H36c-12 0-20-6-20-18z" fill={tint} />
      <path d="M26 66c4-16 18-26 34-26" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <g stroke={CRUMB} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M40 52c6 6 8 14 6 24" />
        <path d="M58 46c6 8 8 18 6 30" />
        <path d="M76 52c6 6 8 14 6 24" />
      </g>
    </svg>
  );
}

export function Croissant({ size = 120, tint = '#d9964f' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="90" rx="44" ry="6" fill="rgba(60, 35, 10, 0.12)" />
      <path
        d="M12 78C18 50 42 34 60 34s42 16 48 44c-8-6-18-8-26-2-6-10-16-14-22-14s-16 4-22 14c-8-6-18-4-26 2z"
        fill={tint}
      />
      <g stroke={CRUST_DARK} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M36 44c4 8 6 16 4 26" />
        <path d="M52 36c2 10 2 20 0 28" />
        <path d="M68 36c-2 10-2 20 0 28" />
        <path d="M84 44c-4 8-6 16-4 26" />
      </g>
      <path d="M40 42c8-4 16-6 22-6" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function CinnamonRoll({ size = 120, tint = '#d9964f' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="96" rx="40" ry="6" fill="rgba(60, 35, 10, 0.12)" />
      <circle cx="60" cy="62" r="36" fill={tint} />
      <path
        d="M60 62m-4 0a4 4 0 1 1 8 0a10 10 0 1 1-18 0a16 16 0 1 1 30 0a22 22 0 1 1-42 0a28 28 0 1 1 54 0"
        stroke={CRUST_DARK}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M34 48c10-8 26-10 40-4M40 76c10 6 26 6 38-2" stroke="#fffaf2" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Baguette({ size = 120, tint = CRUST }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="98" rx="46" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <g transform="rotate(-32 60 60)">
        <rect x="6" y="46" width="108" height="28" rx="14" fill={tint} />
        <g stroke={CRUMB} strokeWidth="4" strokeLinecap="round">
          <path d="M26 54l10 12M46 54l10 12M66 54l10 12M86 54l10 12" />
        </g>
      </g>
    </svg>
  );
}

export function Muffin({ size = 120, tint = '#8b5cf6' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="100" rx="36" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <path d="M32 62h56l-8 36H40z" fill="#e8c9a0" />
      <g stroke="#d4ae82" strokeWidth="3">
        <path d="M44 62l2 36M56 62v36M68 62l-2 36M78 62l-4 36" />
      </g>
      <path d="M26 64c0-20 16-34 34-34s34 14 34 34c0 4-4 6-8 6H34c-4 0-8-2-8-6z" fill={CRUST} />
      <g fill={tint}>
        <circle cx="46" cy="48" r="4" />
        <circle cx="62" cy="42" r="4" />
        <circle cx="74" cy="54" r="4" />
        <circle cx="52" cy="60" r="3.5" />
      </g>
    </svg>
  );
}

export function Pretzel({ size = 120, tint = '#8a4b1f' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="98" rx="40" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <path
        d="M36 86c-18-10-20-36-2-46 14-8 30 4 26 22-2 10-10 18-22 24M84 86c18-10 20-36 2-46-14-8-30 4-26 22 2 10 10 18 22 24M36 86c10-4 38-4 48 0"
        stroke={tint}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#fffaf2">
        <circle cx="34" cy="50" r="2" />
        <circle cx="86" cy="50" r="2" />
        <circle cx="48" cy="44" r="1.6" />
        <circle cx="72" cy="44" r="1.6" />
        <circle cx="60" cy="84" r="1.8" />
      </g>
    </svg>
  );
}

export function Cookie({ size = 120, tint = '#b7773f' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="98" rx="36" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <circle cx="60" cy="60" r="34" fill={tint} />
      <circle cx="60" cy="60" r="26" fill="none" stroke="#fffaf2" strokeWidth="3" strokeDasharray="6 6" />
      <g fill="#fffaf2">
        <circle cx="50" cy="52" r="3" />
        <circle cx="70" cy="52" r="3" />
      </g>
      <path d="M48 68c8 6 16 6 24 0" stroke="#fffaf2" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HeartCookie({ size = 120, tint = '#e11d48' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="100" rx="36" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <path d="M60 96C24 72 16 50 30 36c10-10 24-8 30 4 6-12 20-14 30-4 14 14 6 36-30 60z" fill="#d9964f" />
      <path d="M60 86C32 66 28 50 36 42c8-8 18-6 24 4 6-10 16-12 24-4 8 8 4 24-24 44z" fill={tint} />
    </svg>
  );
}

export function Braid({ size = 120, tint = '#d9964f' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="96" rx="46" ry="5" fill="rgba(60, 35, 10, 0.12)" />
      <g fill={tint} stroke={CRUST_DARK} strokeWidth="2">
        <ellipse cx="24" cy="66" rx="14" ry="18" transform="rotate(-30 24 66)" />
        <ellipse cx="44" cy="62" rx="14" ry="20" transform="rotate(30 44 62)" />
        <ellipse cx="64" cy="60" rx="14" ry="21" transform="rotate(-30 64 60)" />
        <ellipse cx="84" cy="62" rx="14" ry="20" transform="rotate(30 84 62)" />
        <ellipse cx="100" cy="66" rx="12" ry="16" transform="rotate(-30 100 66)" />
      </g>
      <g fill="#fffaf2">
        <circle cx="40" cy="54" r="1.5" />
        <circle cx="62" cy="50" r="1.5" />
        <circle cx="82" cy="54" r="1.5" />
      </g>
    </svg>
  );
}

export function Wheat({ size = 60 }: ArtProps) {
  return (
    <svg viewBox="0 0 60 120" width={size / 2} height={size} aria-hidden="true">
      <path d="M30 118V30" stroke="#c9a46a" strokeWidth="3" strokeLinecap="round" />
      <g fill="#dcb67a">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <ellipse cx="22" cy={40 + i * 14} rx="6" ry="10" transform={`rotate(-30 22 ${40 + i * 14})`} />
            <ellipse cx="38" cy={40 + i * 14} rx="6" ry="10" transform={`rotate(30 38 ${40 + i * 14})`} />
          </g>
        ))}
        <ellipse cx="30" cy="24" rx="6" ry="11" />
      </g>
    </svg>
  );
}

export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art-circle" />
      <div className="hero-art-wheat left">
        <Wheat size={150} />
      </div>
      <div className="hero-art-wheat right">
        <Wheat size={120} />
      </div>
      <div className="hero-art-item baguette">
        <Baguette size={250} />
      </div>
      <div className="hero-art-item loaf">
        <Loaf size={230} />
      </div>
      <div className="hero-art-item croissant">
        <Croissant size={170} />
      </div>
    </div>
  );
}
