export type GameProvider =
  | 'Pragmatic Play'
  | 'NetEnt'
  | 'Play\u2019n GO'
  | 'Hacksaw'
  | 'Nolimit City'
  | 'Push Gaming'
  | 'Relax Gaming'
  | 'Evolution'
  | 'Red Tiger';

export type GameTag = 'hot' | 'new' | 'exclusive' | 'jackpot';

/**
 * Concrete game implementations supported by the lobby. Several lobby tiles
 * may share a `kind` (e.g. multiple slot themes all use `slot`).
 */
export type GameKind =
  | 'slot'
  | 'crash'
  | 'roulette'
  | 'wheel'
  | 'blackjack'
  | 'baccarat'
  | 'mines'
  | 'plinko';

/**
 * Per-game palette/skin used by themable game components (primarily slots).
 */
export interface GameTheme {
  /** Primary accent (used for active rim, win frame, controls). */
  accent: string;
  /** Secondary accent (used for highlights, gradients). */
  accent2: string;
  /** Background color for the frame/inner reel area. */
  bg: string;
  /** Outer frame color. */
  frame: string;
  /** Reel cell background. */
  cellBg: string;
}

export interface GameMeta {
  id: string;
  title: string;
  provider: GameProvider;
  category: 'slots' | 'live' | 'table' | 'crash' | 'instant';
  /** Concrete renderer to use when the game is opened. */
  kind: GameKind;
  rtp: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  tags?: GameTag[];
  /** Pair of colors used to render the procedural card art. */
  palette: [string, string];
  /** Short label rendered as part of the card art. */
  glyph: string;
  /** Optional skin applied to the slot machine view. */
  theme?: GameTheme;
}

export type SymbolId =
  | 'ten'
  | 'jack'
  | 'queen'
  | 'king'
  | 'ace'
  | 'cherry'
  | 'bell'
  | 'bar'
  | 'seven'
  | 'diamond'
  | 'crown'
  | 'wild'
  | 'scatter';

export interface SymbolDef {
  id: SymbolId;
  label: string;
  /** Multipliers for 3, 4, 5 of a kind. */
  payouts: [number, number, number];
  /** Tier used for visual treatment. */
  tier: 'low' | 'mid' | 'high' | 'special';
}

export interface SpinResult {
  /** grid[col][row] symbols */
  grid: SymbolId[][];
  wins: WinLine[];
  totalWin: number;
}

export interface WinLine {
  paylineIndex: number;
  symbolId: SymbolId;
  count: number;
  payout: number;
  /** Cells (col, row) that participate in the line. */
  cells: Array<[number, number]>;
}
