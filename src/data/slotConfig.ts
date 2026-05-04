import type { SymbolDef, SymbolId } from '../types';

export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  ten: { id: 'ten', label: '10', payouts: [0.4, 0.8, 2], tier: 'low' },
  jack: { id: 'jack', label: 'J', payouts: [0.4, 0.8, 2], tier: 'low' },
  queen: { id: 'queen', label: 'Q', payouts: [0.5, 1, 3], tier: 'low' },
  king: { id: 'king', label: 'K', payouts: [0.6, 1.5, 4], tier: 'low' },
  ace: { id: 'ace', label: 'A', payouts: [0.8, 2, 5], tier: 'low' },
  cherry: { id: 'cherry', label: 'Cherry', payouts: [1, 3, 8], tier: 'mid' },
  bell: { id: 'bell', label: 'Bell', payouts: [1.5, 4, 12], tier: 'mid' },
  bar: { id: 'bar', label: 'Bar', payouts: [2, 6, 20], tier: 'mid' },
  seven: { id: 'seven', label: 'Lucky 7', payouts: [4, 15, 50], tier: 'high' },
  diamond: { id: 'diamond', label: 'Diamond', payouts: [5, 25, 100], tier: 'high' },
  crown: { id: 'crown', label: 'Royal Crown', payouts: [10, 50, 250], tier: 'high' },
  wild: { id: 'wild', label: 'Wild', payouts: [10, 50, 250], tier: 'special' },
  scatter: { id: 'scatter', label: 'Scatter', payouts: [2, 10, 50], tier: 'special' },
};

/**
 * Reels are tuned for a satisfying demo hit-frequency: low-pay symbols are
 * heavily repeated on reels 1-3 so 3-of-a-kind wins land often, with high-pay
 * symbols, wilds and scatters scattered more sparsely. Reel 1 is short (no
 * scatter slot) while reels 2-4 carry richer mid/high tiers.
 */
export const REEL_STRIPS: SymbolId[][] = [
  // Reel 1 — generous lows for frequent line starters.
  [
    'ten', 'jack', 'queen', 'ten', 'king',
    'jack', 'ace', 'queen', 'cherry', 'ten',
    'jack', 'king', 'queen', 'ace', 'jack',
    'bell', 'ten', 'queen', 'king', 'jack',
    'ace', 'ten', 'cherry', 'queen', 'king',
    'bar', 'wild', 'scatter',
  ],
  // Reel 2 — slightly fewer lows, more mids.
  [
    'jack', 'queen', 'king', 'ten', 'ace',
    'bell', 'queen', 'jack', 'king', 'cherry',
    'ten', 'ace', 'queen', 'jack', 'bar',
    'king', 'queen', 'jack', 'ace', 'ten',
    'bell', 'cherry', 'queen', 'seven',
    'wild', 'diamond', 'scatter',
  ],
  // Reel 3 — features highs and a second wild.
  [
    'queen', 'king', 'ace', 'jack', 'ten',
    'bar', 'seven', 'queen', 'cherry', 'king',
    'ace', 'jack', 'ten', 'bell', 'wild',
    'queen', 'king', 'ace', 'jack', 'diamond',
    'ten', 'bar', 'wild', 'crown', 'queen',
    'cherry', 'bell', 'scatter',
  ],
  // Reel 4 — symmetric to reel 2.
  [
    'jack', 'queen', 'king', 'ace', 'ten',
    'bell', 'bar', 'queen', 'jack', 'cherry',
    'ten', 'king', 'ace', 'queen', 'seven',
    'jack', 'queen', 'ace', 'king', 'ten',
    'bell', 'cherry', 'jack', 'diamond',
    'wild', 'queen', 'scatter',
  ],
  // Reel 5 — closing reel, generous lows again to reward 5-of-a-kind chance.
  [
    'ten', 'jack', 'queen', 'king', 'ten',
    'cherry', 'jack', 'queen', 'ace', 'bell',
    'ten', 'jack', 'king', 'queen', 'jack',
    'ace', 'bar', 'queen', 'ten', 'king',
    'ace', 'cherry', 'jack', 'queen', 'crown',
    'ten', 'wild', 'scatter',
  ],
];

export const REELS = 5;
export const ROWS = 3;

/**
 * Each payline is a list of row indexes (one per reel).
 * 10 lines is enough for a satisfying sample without overcrowding.
 */
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V
  [2, 1, 0, 1, 2], // Inverted V
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 1, 2, 1],
];

export const BET_LEVELS = [0.2, 0.4, 1, 2, 5, 10, 25, 50, 100];
