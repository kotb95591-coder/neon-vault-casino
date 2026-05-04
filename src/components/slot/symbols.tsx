import type { SymbolId } from '../../types';

interface SymbolGlyphProps {
  id: SymbolId;
  className?: string;
}

const royalLetter = (
  letter: string,
  primary: string,
  shadow: string,
): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id={`grad-${letter}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primary} stopOpacity="0.95" />
        <stop offset="100%" stopColor={shadow} stopOpacity="0.85" />
      </linearGradient>
    </defs>
    <text
      x="50"
      y="68"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={800}
      fontSize="64"
      fill={`url(#grad-${letter})`}
      stroke="rgba(0,0,0,0.35)"
      strokeWidth="1.5"
      paintOrder="stroke"
    >
      {letter}
    </text>
  </svg>
);

const Ten = (): React.ReactElement => royalLetter('10', '#9ee7ff', '#2b78a8');
const Jack = (): React.ReactElement => royalLetter('J', '#9ee7ff', '#2b78a8');
const Queen = (): React.ReactElement => royalLetter('Q', '#bfa6ff', '#5b39b3');
const King = (): React.ReactElement => royalLetter('K', '#ffd0a3', '#a0651e');
const Ace = (): React.ReactElement => royalLetter('A', '#ffe790', '#a07314');

const Cherry = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="cherryGrad" cx="0.35" cy="0.35" r="0.7">
        <stop offset="0%" stopColor="#ff8aa3" />
        <stop offset="55%" stopColor="#e1213e" />
        <stop offset="100%" stopColor="#7a0d22" />
      </radialGradient>
      <radialGradient id="cherryGrad2" cx="0.35" cy="0.35" r="0.7">
        <stop offset="0%" stopColor="#ff7e96" />
        <stop offset="55%" stopColor="#c81836" />
        <stop offset="100%" stopColor="#690a1d" />
      </radialGradient>
    </defs>
    <path
      d="M30 24 Q50 8 72 22"
      stroke="#5fbf4a"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M52 22 q12 -10 22 -2 q-2 8 -10 10"
      fill="#6cd158"
      stroke="#3a8f2a"
      strokeWidth="1.4"
    />
    <circle cx="32" cy="68" r="22" fill="url(#cherryGrad)" stroke="#3a0511" strokeWidth="1.5" />
    <circle cx="68" cy="74" r="20" fill="url(#cherryGrad2)" stroke="#3a0511" strokeWidth="1.5" />
    <ellipse cx="26" cy="60" rx="6" ry="3" fill="rgba(255,255,255,0.55)" transform="rotate(-25 26 60)" />
    <ellipse cx="62" cy="68" rx="5" ry="2.5" fill="rgba(255,255,255,0.45)" transform="rotate(-25 62 68)" />
  </svg>
);

const Bell = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe48a" />
        <stop offset="40%" stopColor="#f7b93a" />
        <stop offset="100%" stopColor="#8c5a0c" />
      </linearGradient>
    </defs>
    <path
      d="M50 18 Q26 22 26 56 V70 H74 V56 Q74 22 50 18 Z"
      fill="url(#bellGrad)"
      stroke="#4a2e05"
      strokeWidth="2"
    />
    <rect x="22" y="68" width="56" height="8" rx="3" fill="#3a2204" />
    <circle cx="50" cy="84" r="6" fill="url(#bellGrad)" stroke="#4a2e05" strokeWidth="1.5" />
    <path
      d="M40 30 Q36 40 38 56"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const Bar = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd86b" />
        <stop offset="100%" stopColor="#a06d10" />
      </linearGradient>
    </defs>
    <rect x="14" y="22" width="72" height="18" rx="4" fill="url(#barGrad)" stroke="#3a2204" strokeWidth="2" />
    <rect x="14" y="44" width="72" height="18" rx="4" fill="url(#barGrad)" stroke="#3a2204" strokeWidth="2" />
    <rect x="14" y="66" width="72" height="18" rx="4" fill="url(#barGrad)" stroke="#3a2204" strokeWidth="2" />
    <text
      x="50"
      y="36.5"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={800}
      fontSize="14"
      fill="#3a2204"
    >
      BAR
    </text>
    <text
      x="50"
      y="58.5"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={800}
      fontSize="14"
      fill="#3a2204"
    >
      BAR
    </text>
    <text
      x="50"
      y="80.5"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={800}
      fontSize="14"
      fill="#3a2204"
    >
      BAR
    </text>
  </svg>
);

const Seven = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sevenGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff7373" />
        <stop offset="50%" stopColor="#d8202c" />
        <stop offset="100%" stopColor="#5d0710" />
      </linearGradient>
      <linearGradient id="sevenStroke" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe48a" />
        <stop offset="100%" stopColor="#a06d10" />
      </linearGradient>
    </defs>
    <text
      x="50"
      y="78"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={900}
      fontSize="80"
      fill="url(#sevenGrad)"
      stroke="url(#sevenStroke)"
      strokeWidth="3.5"
      paintOrder="stroke"
    >
      7
    </text>
  </svg>
);

const Diamond = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="diaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2faff" />
        <stop offset="40%" stopColor="#7ad5ff" />
        <stop offset="100%" stopColor="#1d72b8" />
      </linearGradient>
    </defs>
    <polygon
      points="50,12 80,38 50,90 20,38"
      fill="url(#diaGrad)"
      stroke="#0a3a66"
      strokeWidth="2"
    />
    <polyline
      points="20,38 50,38 80,38 50,90 50,38 30,18"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.6"
      fill="none"
    />
    <polygon points="50,12 60,28 50,38 40,28" fill="rgba(255,255,255,0.35)" />
  </svg>
);

const Crown = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffeaa3" />
        <stop offset="50%" stopColor="#f7c948" />
        <stop offset="100%" stopColor="#8a5a0a" />
      </linearGradient>
    </defs>
    <path
      d="M14 70 L22 30 L38 52 L50 22 L62 52 L78 30 L86 70 Z"
      fill="url(#crownGrad)"
      stroke="#3a2204"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect x="14" y="70" width="72" height="14" rx="3" fill="url(#crownGrad)" stroke="#3a2204" strokeWidth="2" />
    <circle cx="22" cy="30" r="4" fill="#ff4757" stroke="#3a0511" strokeWidth="1.2" />
    <circle cx="50" cy="22" r="4.5" fill="#18d6ff" stroke="#0a3a66" strokeWidth="1.2" />
    <circle cx="78" cy="30" r="4" fill="#2ed573" stroke="#0a3a17" strokeWidth="1.2" />
    <circle cx="32" cy="77" r="3" fill="#ff4cd6" stroke="#5a0c4a" strokeWidth="1" />
    <circle cx="50" cy="77" r="3" fill="#fff" stroke="#3a2204" strokeWidth="1" />
    <circle cx="68" cy="77" r="3" fill="#ff4cd6" stroke="#5a0c4a" strokeWidth="1" />
  </svg>
);

const Wild = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="wildGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffd86b" />
        <stop offset="100%" stopColor="#b46cff" />
      </linearGradient>
    </defs>
    <rect x="8" y="20" width="84" height="60" rx="14" fill="url(#wildGrad)" stroke="#1c0d2e" strokeWidth="2.5" />
    <rect
      x="14"
      y="26"
      width="72"
      height="48"
      rx="10"
      fill="none"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth="1.4"
    />
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={900}
      fontSize="26"
      fill="#1c0d2e"
      letterSpacing="2"
    >
      WILD
    </text>
  </svg>
);

const Scatter = (): React.ReactElement => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="scatGrad" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="35%" stopColor="#ffd86b" />
        <stop offset="100%" stopColor="#b8902b" />
      </radialGradient>
    </defs>
    <polygon
      points="50,8 60,38 92,42 66,60 76,90 50,72 24,90 34,60 8,42 40,38"
      fill="url(#scatGrad)"
      stroke="#3a2204"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <text
      x="50"
      y="60"
      textAnchor="middle"
      fontFamily="'Cinzel', Georgia, serif"
      fontWeight={800}
      fontSize="14"
      fill="#3a2204"
    >
      SCAT
    </text>
  </svg>
);

const REGISTRY: Record<SymbolId, () => React.ReactElement> = {
  ten: Ten,
  jack: Jack,
  queen: Queen,
  king: King,
  ace: Ace,
  cherry: Cherry,
  bell: Bell,
  bar: Bar,
  seven: Seven,
  diamond: Diamond,
  crown: Crown,
  wild: Wild,
  scatter: Scatter,
};

export function SymbolGlyph({ id, className }: SymbolGlyphProps) {
  const Component = REGISTRY[id];
  return <span className={className}>{Component()}</span>;
}
