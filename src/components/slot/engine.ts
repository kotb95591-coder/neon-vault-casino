import type { SpinResult, SymbolId, WinLine } from '../../types';
import {
  PAYLINES,
  REELS,
  REEL_STRIPS,
  ROWS,
  SYMBOLS,
} from '../../data/slotConfig';

function pickFromStrip(reelIndex: number, length: number): SymbolId[] {
  const strip = REEL_STRIPS[reelIndex];
  const start = Math.floor(Math.random() * strip.length);
  const result: SymbolId[] = [];
  for (let i = 0; i < length; i += 1) {
    result.push(strip[(start + i) % strip.length]);
  }
  return result;
}

export function generateGrid(): SymbolId[][] {
  return Array.from({ length: REELS }, (_, reel) => pickFromStrip(reel, ROWS));
}

/**
 * Evaluates payline wins. Wild substitutes for any symbol except Scatter.
 * Wins must start from the leftmost reel.
 */
export function evaluateWins(
  grid: SymbolId[][],
  totalBet: number,
  activeLines: number,
): WinLine[] {
  if (grid.length !== REELS) return [];
  const wins: WinLine[] = [];
  const perLine = totalBet / Math.max(activeLines, 1);

  for (let lineIndex = 0; lineIndex < activeLines; lineIndex += 1) {
    const path = PAYLINES[lineIndex];
    const symbols: SymbolId[] = path.map((row, col) => grid[col][row]);
    const first = symbols[0];
    if (first === 'scatter') continue;

    let target: SymbolId | null = first === 'wild' ? null : first;
    let count = 0;
    const cells: Array<[number, number]> = [];

    for (let col = 0; col < REELS; col += 1) {
      const sym = symbols[col];
      if (sym === 'scatter') break;
      if (target === null) {
        if (sym !== 'wild') target = sym;
        cells.push([col, path[col]]);
        count += 1;
        continue;
      }
      if (sym === target || sym === 'wild') {
        cells.push([col, path[col]]);
        count += 1;
      } else {
        break;
      }
    }

    if (target && count >= 3) {
      const def = SYMBOLS[target];
      const mult = def.payouts[Math.min(count, 5) - 3];
      const payout = mult * perLine;
      wins.push({
        paylineIndex: lineIndex,
        symbolId: target,
        count,
        payout,
        cells: cells.slice(0, count),
      });
    }
  }

  return wins;
}

export function evaluateScatter(
  grid: SymbolId[][],
  totalBet: number,
): WinLine | null {
  const cells: Array<[number, number]> = [];
  for (let col = 0; col < grid.length; col += 1) {
    for (let row = 0; row < grid[col].length; row += 1) {
      if (grid[col][row] === 'scatter') {
        cells.push([col, row]);
      }
    }
  }
  if (cells.length < 3) return null;
  const def = SYMBOLS.scatter;
  const mult = def.payouts[Math.min(cells.length, 5) - 3];
  return {
    paylineIndex: -1,
    symbolId: 'scatter',
    count: cells.length,
    payout: mult * totalBet,
    cells,
  };
}

export function spin(totalBet: number, activeLines: number): SpinResult {
  const grid = generateGrid();
  const wins = evaluateWins(grid, totalBet, activeLines);
  const scatter = evaluateScatter(grid, totalBet);
  if (scatter) wins.push(scatter);
  const totalWin = wins.reduce((acc, w) => acc + w.payout, 0);
  return { grid, wins, totalWin };
}
