import { useEffect, useMemo } from 'react';
import type { SymbolId } from '../../types';
import { REEL_STRIPS, ROWS } from '../../data/slotConfig';
import { SymbolGlyph } from './symbols';
import styles from './Reel.module.css';

interface ReelProps {
  reelIndex: number;
  finalSymbols: SymbolId[];
  spinning: boolean;
  /** ms after which this reel must stop. */
  stopDelay: number;
  /** highlighted cells: row indexes of this reel. */
  highlightRows?: Set<number>;
  /** Triggered when this reel finishes its spin animation. */
  onSettled?: () => void;
  /** Spin id, increments each spin to retrigger animation. */
  spinId: number;
}

const TOTAL_STRIP = 40;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildStrip(reelIndex: number, finalSymbols: SymbolId[], spinId: number): SymbolId[] {
  const source = REEL_STRIPS[reelIndex];
  const out: SymbolId[] = [];
  // Final ROWS at the TOP — they settle into the visible window at the end
  // of the top-to-bottom scroll animation (translateY 0).
  for (let i = 0; i < ROWS; i += 1) {
    out.push(finalSymbols[i]);
  }
  for (let i = 0; i < TOTAL_STRIP - ROWS; i += 1) {
    const r = pseudoRandom(spinId * 31 + reelIndex * 7 + i);
    out.push(source[Math.floor(r * source.length)]);
  }
  return out;
}

export function Reel({
  reelIndex,
  finalSymbols,
  spinning,
  stopDelay,
  highlightRows,
  onSettled,
  spinId,
}: ReelProps) {
  // Build a stable strip per spin cycle.
  const strip = useMemo(
    () => buildStrip(reelIndex, finalSymbols, spinId),
    [reelIndex, finalSymbols, spinId],
  );

  // Notify the parent after the reel finishes scrolling.
  useEffect(() => {
    if (!spinning || !onSettled) return;
    const t = window.setTimeout(() => onSettled(), stopDelay);
    return () => window.clearTimeout(t);
  }, [spinning, stopDelay, onSettled, spinId]);

  const stripStyle: React.CSSProperties = spinning
    ? {
        animationName: 'reel-spin-flow',
        animationDuration: `${stopDelay}ms`,
        animationTimingFunction: 'cubic-bezier(0.18, 0.62, 0.34, 1)',
        animationFillMode: 'forwards',
        animationIterationCount: 1,
      }
    : { transform: 'translateY(0)' };

  const showHighlights = !spinning && highlightRows && highlightRows.size > 0;

  return (
    <div className={styles.root}>
      <div className={styles.window}>
        <div className={styles.strip} style={stripStyle} key={spinId}>
          {strip.map((sym, idx) => (
            <div className={styles.cell} key={`${spinId}-${idx}`}>
              <SymbolGlyph id={sym} className={styles.symbol} />
            </div>
          ))}
        </div>
      </div>

      {showHighlights && (
        <div className={styles.overlayHighlights} aria-hidden>
          {finalSymbols.map((_, row) => {
            if (!highlightRows.has(row)) return null;
            return (
              <div
                key={row}
                className={styles.frame}
                style={{ top: `calc(${row} * (100% / 3))` }}
              />
            );
          })}
        </div>
      )}

      <div className={styles.fadeTop} aria-hidden />
      <div className={styles.fadeBottom} aria-hidden />
    </div>
  );
}
