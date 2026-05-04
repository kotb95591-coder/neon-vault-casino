import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta, SpinResult, SymbolId, WinLine } from '../../types';
import { BET_LEVELS, PAYLINES, REELS, ROWS } from '../../data/slotConfig';
import { ChevronLeftIcon } from '../common/icons';
import { spin as spinEngine } from './engine';
import { Reel } from './Reel';
import { ControlBar } from './ControlBar';
import { WinOverlay } from './WinOverlay';
import { Paytable } from './Paytable';
import styles from './SlotMachine.module.css';

interface SlotMachineProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

const REEL_BASE_DELAYS = [800, 1000, 1200, 1400, 1600];

function makeIdleGrid(): SymbolId[][] {
  const samples: SymbolId[] = ['ace', 'king', 'queen', 'jack', 'ten', 'cherry', 'bell', 'bar'];
  const grid: SymbolId[][] = [];
  for (let r = 0; r < REELS; r += 1) {
    const col: SymbolId[] = [];
    for (let row = 0; row < ROWS; row += 1) {
      col.push(samples[(r * 3 + row) % samples.length]);
    }
    grid.push(col);
  }
  return grid;
}

export function SlotMachine({
  game,
  balance,
  onBalanceChange,
  onExit,
}: SlotMachineProps) {
  const [grid, setGrid] = useState<SymbolId[][]>(() => makeIdleGrid());
  const [bet, setBet] = useState<number>(1);
  const [lines, setLines] = useState<number>(PAYLINES.length);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [winCycleIndex, setWinCycleIndex] = useState(0);
  const [spinId, setSpinId] = useState(0);
  const settledCountRef = useRef(0);
  const overlayTimerRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);

  const totalBet = bet * lines;

  const reelStopDelays = useMemo(() => REEL_BASE_DELAYS.slice(0, REELS), []);

  const performSpin = useCallback(() => {
    if (spinning) return;
    if (balance < totalBet) {
      // Not enough balance. Stop autoplay if running.
      setAutoplay(false);
      return;
    }
    if (overlayTimerRef.current) {
      window.clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    setShowOverlay(false);
    setWinCycleIndex(0);
    onBalanceChange((b) => b - totalBet);
    settledCountRef.current = 0;
    const next = spinEngine(totalBet, lines);
    setResult(null);
    setGrid(next.grid);
    setSpinId((id) => id + 1);
    setSpinning(true);
    // Clear pending result and apply at the end via onSettled cascade
    cycleTimerRef.current = window.setTimeout(() => {
      setResult(next);
      setSpinning(false);
      onBalanceChange((b) => b + next.totalWin);
      if (next.totalWin > 0) {
        setShowOverlay(true);
        overlayTimerRef.current = window.setTimeout(() => {
          setShowOverlay(false);
        }, 2400);
      }
    }, reelStopDelays[REELS - 1] + 50);
  }, [balance, lines, onBalanceChange, reelStopDelays, spinning, totalBet]);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) window.clearTimeout(overlayTimerRef.current);
      if (cycleTimerRef.current) window.clearTimeout(cycleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    if (spinning) return;
    if (showOverlay) return;
    const t = window.setTimeout(() => performSpin(), 700);
    return () => window.clearTimeout(t);
  }, [autoplay, performSpin, showOverlay, spinning]);

  // Cycle through winning lines after a spin so the active payline is
  // visible even when there are several wins.
  useEffect(() => {
    if (!result || result.wins.length <= 1 || spinning) return;
    const interval = window.setInterval(() => {
      setWinCycleIndex((i) => (i + 1) % result.wins.length);
    }, 1100);
    return () => window.clearInterval(interval);
  }, [result, spinning]);

  const activeLine: number | null = useMemo(() => {
    if (!result || result.wins.length === 0 || spinning) return null;
    const w = result.wins[winCycleIndex % result.wins.length];
    return w.paylineIndex >= 0 ? w.paylineIndex : null;
  }, [result, spinning, winCycleIndex]);

  const highlightsByReel = useMemo(() => {
    const map: Array<Set<number>> = Array.from({ length: REELS }, () => new Set<number>());
    if (!result || spinning) return map;
    const linesToShow: WinLine[] = activeLine != null
      ? result.wins.filter((w) => w.paylineIndex === activeLine)
      : result.wins;
    for (const w of linesToShow) {
      for (const [col, row] of w.cells) {
        map[col].add(row);
      }
    }
    // Always include scatters (they're not on a payline).
    for (const w of result.wins) {
      if (w.paylineIndex === -1) {
        for (const [col, row] of w.cells) map[col].add(row);
      }
    }
    return map;
  }, [activeLine, result, spinning]);

  const totalWin = result?.totalWin ?? 0;

  const linesPath = useMemo(() => {
    if (!result || spinning) return null;
    if (activeLine == null) return null;
    if (activeLine < 0) return null;
    const path = PAYLINES[activeLine];
    if (!path) return null;
    return path;
  }, [activeLine, result, spinning]);

  const themeStyle = useMemo<React.CSSProperties>(() => {
    if (!game.theme) return {};
    return {
      ['--slot-accent' as string]: game.theme.accent,
      ['--slot-accent-2' as string]: game.theme.accent2,
      ['--slot-bg' as string]: game.theme.bg,
      ['--slot-frame' as string]: game.theme.frame,
      ['--slot-cell-bg' as string]: game.theme.cellBg,
    };
  }, [game.theme]);

  return (
    <div className={styles.root} style={themeStyle}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onExit}>
          <ChevronLeftIcon />
          <span>Lobby</span>
        </button>
        <div className={styles.titleArea}>
          <div className={styles.gameTitle}>{game.title}</div>
          <div className={styles.gameMeta}>
            <span>{game.provider}</span>
            <span className={styles.dot} />
            <span>RTP {game.rtp.toFixed(1)}%</span>
            <span className={styles.dot} />
            <span>5×3 · {PAYLINES.length} paylines</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Balance</div>
            <div className={styles.balanceValue}>${balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.gameWrap}>
          <div className={styles.frameOuter}>
            <div className={styles.frameInner}>
              <div className={styles.reelsWrap}>
                <div className={styles.reels}>
                  {Array.from({ length: REELS }, (_, i) => (
                    <Reel
                      key={i}
                      reelIndex={i}
                      finalSymbols={grid[i]}
                      spinning={spinning}
                      stopDelay={reelStopDelays[i]}
                      highlightRows={highlightsByReel[i]}
                      spinId={spinId}
                    />
                  ))}
                </div>

                {/* Payline overlay */}
                {linesPath && (
                  <PaylinePath path={linesPath} />
                )}

                {showOverlay && totalWin > 0 && (
                  <WinOverlay amount={totalWin} bigWinThreshold={totalBet * 10} />
                )}
              </div>

              <div className={styles.linesIndicator}>
                {Array.from({ length: PAYLINES.length }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`${styles.lineDot} ${i < lines ? styles.lineActive : ''} ${activeLine === i ? styles.lineHighlight : ''}`}
                    onClick={() => !spinning && setLines(i + 1)}
                    aria-label={`Payline ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ControlBar
            bet={bet}
            onBetChange={setBet}
            betLevels={BET_LEVELS}
            lines={lines}
            onLinesChange={setLines}
            maxLines={PAYLINES.length}
            spinning={spinning}
            autoplay={autoplay}
            onAutoplayToggle={() => setAutoplay((a) => !a)}
            onSpin={performSpin}
            totalBet={totalBet}
            lastWin={totalWin}
          />

          {result && result.wins.length > 0 && !spinning && (
            <div className={styles.winList}>
              <div className={styles.winListTitle}>This spin</div>
              <ul className={styles.winListUl}>
                {result.wins.map((w, idx) => (
                  <li key={idx} className={styles.winRow}>
                    <span className={styles.winLineLabel}>
                      {w.paylineIndex >= 0 ? `Line ${w.paylineIndex + 1}` : 'Scatter'}
                    </span>
                    <span className={styles.winSym}>
                      {w.count}× {w.symbolId}
                    </span>
                    <span className={styles.winPayout}>+${w.payout.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className={styles.aside}>
          <Paytable />
        </aside>
      </div>
    </div>
  );
}

function PaylinePath({ path }: { path: number[] }) {
  // Build SVG polyline through cell centers.
  const cellW = 100 / REELS;
  const cellH = 100 / ROWS;
  const points = path
    .map((row, col) => {
      const x = col * cellW + cellW / 2;
      const y = row * cellH + cellH / 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg
      className={styles.paylineSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--slot-accent, #ffd86b)"
        strokeOpacity="0.85"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(255, 216, 107, 0.85))' }}
      />
    </svg>
  );
}
