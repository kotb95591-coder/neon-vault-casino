import type { GameMeta, GameTheme } from '../types';

export const FEATURED_SLOT_ID = 'aurora-7s';

const themePurpleGold: GameTheme = {
  accent: '#ffd86b',
  accent2: '#b46cff',
  bg: 'radial-gradient(120% 110% at 50% 0%, #1d0f3a 0%, #0d0820 70%)',
  frame: 'linear-gradient(180deg, #2c1d4d, #150a2a)',
  cellBg: 'linear-gradient(180deg, #170c2c, #0c0617)',
};

const themeMidnightBlue: GameTheme = {
  accent: '#7ad5ff',
  accent2: '#4a8dff',
  bg: 'radial-gradient(120% 110% at 50% 0%, #052244 0%, #03132a 70%)',
  frame: 'linear-gradient(180deg, #0a2848, #04162f)',
  cellBg: 'linear-gradient(180deg, #07203a, #03101e)',
};

const themePharaoh: GameTheme = {
  accent: '#ffd86b',
  accent2: '#ff8a3c',
  bg: 'radial-gradient(120% 110% at 50% 0%, #2d1305 0%, #170803 70%)',
  frame: 'linear-gradient(180deg, #3a1f08, #1c0c03)',
  cellBg: 'linear-gradient(180deg, #2a1605, #14080b)',
};

const themeBloodRed: GameTheme = {
  accent: '#ff7373',
  accent2: '#ffd86b',
  bg: 'radial-gradient(120% 110% at 50% 0%, #3d050d 0%, #1a0207 70%)',
  frame: 'linear-gradient(180deg, #4a0712, #1c0307)',
  cellBg: 'linear-gradient(180deg, #2d050b, #110205)',
};

const themeCrystal: GameTheme = {
  accent: '#7ad5ff',
  accent2: '#c4f3ff',
  bg: 'radial-gradient(120% 110% at 50% 0%, #043248 0%, #021622 70%)',
  frame: 'linear-gradient(180deg, #073a52, #021824)',
  cellBg: 'linear-gradient(180deg, #052b3d, #021018)',
};

const themeJungle: GameTheme = {
  accent: '#d4ff7a',
  accent2: '#ffd86b',
  bg: 'radial-gradient(120% 110% at 50% 0%, #143309 0%, #061704 70%)',
  frame: 'linear-gradient(180deg, #1c4810, #0a1f04)',
  cellBg: 'linear-gradient(180deg, #11320a, #051403)',
};

const themeNeonTokyo: GameTheme = {
  accent: '#ff4cd6',
  accent2: '#7ad5ff',
  bg: 'radial-gradient(120% 110% at 50% 0%, #2a072a 0%, #110210 70%)',
  frame: 'linear-gradient(180deg, #380a39, #170218)',
  cellBg: 'linear-gradient(180deg, #260722, #100210)',
};

const themeGoldVault: GameTheme = {
  accent: '#ffd86b',
  accent2: '#ffeaa3',
  bg: 'radial-gradient(120% 110% at 50% 0%, #2a1d04 0%, #110a01 70%)',
  frame: 'linear-gradient(180deg, #382806, #1a1102)',
  cellBg: 'linear-gradient(180deg, #261a04, #100a02)',
};

const themeArctic: GameTheme = {
  accent: '#4cb6ff',
  accent2: '#a3e1ff',
  bg: 'radial-gradient(120% 110% at 50% 0%, #062944 0%, #03131f 70%)',
  frame: 'linear-gradient(180deg, #0a3a5c, #051a28)',
  cellBg: 'linear-gradient(180deg, #082c45, #03131f)',
};

export const GAMES: GameMeta[] = [
  {
    id: FEATURED_SLOT_ID,
    title: 'Aurora 7s',
    provider: 'Pragmatic Play',
    category: 'slots',
    kind: 'slot',
    rtp: 96.5,
    volatility: 'high',
    tags: ['hot', 'exclusive'],
    palette: ['#6b2bd9', '#ffd86b'],
    glyph: '777',
    theme: themePurpleGold,
  },
  {
    id: 'midnight-fortune',
    title: 'Midnight Fortune',
    provider: 'NetEnt',
    category: 'slots',
    kind: 'slot',
    rtp: 96.1,
    volatility: 'medium',
    tags: ['new'],
    palette: ['#1d72b8', '#18d6ff'],
    glyph: 'MF',
    theme: themeMidnightBlue,
  },
  {
    id: 'pharaoh-rising',
    title: 'Pharaoh Rising',
    provider: 'Play\u2019n GO',
    category: 'slots',
    kind: 'slot',
    rtp: 95.9,
    volatility: 'high',
    tags: ['hot'],
    palette: ['#a05a14', '#ffd86b'],
    glyph: 'PR',
    theme: themePharaoh,
  },
  {
    id: 'dead-alive-deluxe',
    title: 'Dead or Alive Deluxe',
    provider: 'NetEnt',
    category: 'slots',
    kind: 'slot',
    rtp: 96.8,
    volatility: 'extreme',
    tags: ['hot'],
    palette: ['#5d0710', '#ff7373'],
    glyph: 'DA',
    theme: themeBloodRed,
  },
  {
    id: 'crystal-cluster',
    title: 'Crystal Cluster',
    provider: 'Hacksaw',
    category: 'slots',
    kind: 'slot',
    rtp: 96.4,
    volatility: 'high',
    tags: ['new'],
    palette: ['#0f3a64', '#7ad5ff'],
    glyph: 'CC',
    theme: themeCrystal,
  },
  {
    id: 'wild-savannah',
    title: 'Wild Savannah',
    provider: 'Push Gaming',
    category: 'slots',
    kind: 'slot',
    rtp: 96.2,
    volatility: 'high',
    tags: ['hot'],
    palette: ['#3a5c11', '#d4ff7a'],
    glyph: 'WS',
    theme: themeJungle,
  },
  {
    id: 'tokyo-uprising',
    title: 'Tokyo Uprising',
    provider: 'Nolimit City',
    category: 'slots',
    kind: 'slot',
    rtp: 95.4,
    volatility: 'extreme',
    tags: ['exclusive'],
    palette: ['#5a0c4a', '#ff4cd6'],
    glyph: 'TU',
    theme: themeNeonTokyo,
  },
  {
    id: 'gold-rush-mega',
    title: 'Gold Rush Mega',
    provider: 'Relax Gaming',
    category: 'slots',
    kind: 'slot',
    rtp: 96.0,
    volatility: 'medium',
    tags: ['jackpot'],
    palette: ['#3a2204', '#ffd86b'],
    glyph: 'GR',
    theme: themeGoldVault,
  },
  {
    id: 'hyperloop',
    title: 'Hyperloop',
    provider: 'Red Tiger',
    category: 'slots',
    kind: 'slot',
    rtp: 95.8,
    volatility: 'medium',
    tags: ['new'],
    palette: ['#0d1f3a', '#4cb6ff'],
    glyph: 'HL',
    theme: themeArctic,
  },
  {
    id: 'lightning-roulette',
    title: 'Lightning Roulette',
    provider: 'Evolution',
    category: 'live',
    kind: 'roulette',
    rtp: 97.3,
    volatility: 'medium',
    tags: ['hot'],
    palette: ['#7a0d22', '#ff4757'],
    glyph: 'LR',
  },
  {
    id: 'crazy-time',
    title: 'Crazy Time',
    provider: 'Evolution',
    category: 'live',
    kind: 'wheel',
    rtp: 96.0,
    volatility: 'extreme',
    tags: ['hot', 'exclusive'],
    palette: ['#6b2bd9', '#ffd86b'],
    glyph: 'CT',
  },
  {
    id: 'blackjack-vip',
    title: 'Blackjack VIP',
    provider: 'Evolution',
    category: 'table',
    kind: 'blackjack',
    rtp: 99.4,
    volatility: 'low',
    tags: [],
    palette: ['#0a3a17', '#2ed573'],
    glyph: 'BJ',
  },
  {
    id: 'aviator-pro',
    title: 'Aviator Pro',
    provider: 'Hacksaw',
    category: 'crash',
    kind: 'crash',
    rtp: 97.0,
    volatility: 'high',
    tags: ['hot'],
    palette: ['#0d1f3a', '#ff4757'],
    glyph: 'AV',
  },
  {
    id: 'mines-of-midas',
    title: 'Mines of Midas',
    provider: 'Hacksaw',
    category: 'instant',
    kind: 'mines',
    rtp: 97.0,
    volatility: 'high',
    tags: ['new'],
    palette: ['#3a2204', '#ffeaa3'],
    glyph: 'MM',
  },
  {
    id: 'plinko-rush',
    title: 'Plinko Rush',
    provider: 'Hacksaw',
    category: 'instant',
    kind: 'plinko',
    rtp: 97.0,
    volatility: 'medium',
    tags: ['hot'],
    palette: ['#5a0c4a', '#18d6ff'],
    glyph: 'PL',
  },
  {
    id: 'baccarat-prive',
    title: 'Baccarat Privé',
    provider: 'Evolution',
    category: 'table',
    kind: 'baccarat',
    rtp: 98.9,
    volatility: 'low',
    tags: [],
    palette: ['#3a0511', '#ffd86b'],
    glyph: 'BC',
  },
];

export function gamesByCategory(category: GameMeta['category']): GameMeta[] {
  return GAMES.filter((g) => g.category === category);
}

export function gamesWithTag(tag: NonNullable<GameMeta['tags']>[number]): GameMeta[] {
  return GAMES.filter((g) => g.tags?.includes(tag));
}
