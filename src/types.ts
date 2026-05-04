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

export interface GameMeta {
  id: string;
  title: string;
  provider: GameProvider;
  category: 'slots' | 'live' | 'table' | 'crash' | 'instant';
  rtp: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  tags?: GameTag[];
  /** Pair of colors used to render the procedural card art. */
  palette: [string, string];
  /** Short label rendered as part of the card art. */
  glyph: string;
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
