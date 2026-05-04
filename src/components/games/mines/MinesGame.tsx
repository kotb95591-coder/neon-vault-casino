import { useCallback, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { BetInput } from '../shared/BetInput';
import styles from './MinesGame.module.css';

interface MinesGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const MINE_OPTIONS = [3, 5, 8, 12, 24];
const HOUSE_EDGE = 0.97;

type CellState = 'hidden' | 'gem' | 'mine';

interface RoundState {
  mines: Set<number>;
  /** Indexes that have been revealed by the player. */
  revealed: number[];
}

function computeMultiplier(safeRevealed: number, mineCount: number): number {
  if (safeRevealed === 0) return 1.0;
  const safeTotal = TOTAL_CELLS - mineCount;
  let mult = HOUSE_EDGE;
  for (let i = 0; i < safeRevealed; i += 1) {
    mult *= (TOTAL_CELLS - i) / (safeTotal - i);
  }
  return Math.round(mult * 100) / 100;
}

function buildMines(count: number): Set<number> {
  const indexes = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return new Set(indexes.slice(0, count));
}

export function MinesGame({ game, balance, onBalanceChange, onExit }: MinesGameProps) {
  const [stake, setStake] = useState<number>(10);
  const [mineCount, setMineCount] = useState<number>(5);
  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'busted' | 'cashed'>('idle');
  const [lastWin, setLastWin] = useState<number>(0);

  const safeRevealed = round?.revealed.length ?? 0;
  const currentMultiplier = useMemo(
    () => computeMultiplier(safeRevealed, mineCount),
    [mineCount, safeRevealed],
  );
  const nextMultiplier = useMemo(
    () => computeMultiplier(safeRevealed + 1, mineCount),
    [mineCount, safeRevealed],
  );

  const startRound = useCallback(() => {
    if (phase === 'playing') return;
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    setRound({ mines: buildMines(mineCount), revealed: [] });
    setPhase('playing');
    setLastWin(0);
  }, [balance, mineCount, onBalanceChange, phase, stake]);

  const cashOut = useCallback(() => {
    if (phase !== 'playing' || !round) return;
    if (round.revealed.length === 0) return;
    const win = stake * currentMultiplier;
    setLastWin(win);
    onBalanceChange((b) => b + win);
    setPhase('cashed');
  }, [currentMultiplier, onBalanceChange, phase, round, stake]);

  const reveal = useCallback(
    (idx: number) => {
      if (phase !== 'playing' || !round) return;
      if (round.revealed.includes(idx)) return;
      if (round.mines.has(idx)) {
        setRound({ ...round, revealed: [...round.revealed, idx] });
        setPhase('busted');
        return;
      }
      const newRevealed = [...round.revealed, idx];
      setRound({ ...round, revealed: newRevealed });
      // Auto-cashout if all safe tiles revealed.
      if (newRevealed.length === TOTAL_CELLS - mineCount) {
        const win = stake * computeMultiplier(newRevealed.length, mineCount);
        setLastWin(win);
        onBalanceChange((b) => b + win);
        setPhase('cashed');
      }
    },
    [mineCount, onBalanceChange, phase, round, stake],
  );

  const reset = useCallback(() => {
    setRound(null);
    setPhase('idle');
  }, []);

  const cellStates: CellState[] = useMemo(() => {
    const states: CellState[] = Array(TOTAL_CELLS).fill('hidden');
    if (!round) return states;
    if (phase === 'busted') {
      // reveal all mines
      for (const m of round.mines) states[m] = 'mine';
    }
    for (const r of round.revealed) {
      states[r] = round.mines.has(r) ? 'mine' : 'gem';
    }
    return states;
  }, [round, phase]);

  const playable = phase === 'playing';

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle={`Mines · ${mineCount} mines`}
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Multiplier ladder</div>
          <ul className={styles.ladder}>
            {[1, 3, 5, 8, 12, 18].map((n) => (
              <li key={n} className={styles.ladderRow}>
                <span>{n} pick{n > 1 ? 's' : ''}</span>
                <span className={styles.ladderMult}>
                  {computeMultiplier(n, mineCount).toFixed(2)}×
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.rulesTitle} style={{ marginTop: 18 }}>How it works</div>
          <ol className={styles.rulesList}>
            <li>Pick a stake and a number of mines.</li>
            <li>Reveal tiles one by one. Every safe tile increases your multiplier.</li>
            <li>Cash out at any time to lock in <em>stake × multiplier</em>.</li>
            <li>Hit a mine and the round ends instantly.</li>
          </ol>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.statBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Multiplier</span>
            <span className={styles.statBig} style={{ color: '#ffd86b' }}>
              {currentMultiplier.toFixed(2)}×
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Profit</span>
            <span className={styles.statBig}>
              ${(stake * currentMultiplier - stake).toFixed(2)}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Next pick</span>
            <span className={styles.statSecondary}>{nextMultiplier.toFixed(2)}×</span>
          </div>
        </div>

        <div className={styles.grid}>
          {cellStates.map((state, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.cell} ${styles[`cell_${state}`]}`}
              data-busted={phase === 'busted' && round?.mines.has(idx) ? '' : undefined}
              onClick={() => reveal(idx)}
              disabled={!playable || state !== 'hidden'}
              aria-label={`Cell ${idx + 1}`}
            >
              {state === 'gem' && <GemIcon />}
              {state === 'mine' && <MineIcon />}
            </button>
          ))}
        </div>

        {phase === 'busted' && (
          <div className={`${styles.banner} ${styles.bannerBust}`}>
            BOOM — you hit a mine. Stake of ${stake.toFixed(2)} lost.
          </div>
        )}
        {phase === 'cashed' && (
          <div className={`${styles.banner} ${styles.bannerWin}`}>
            +${lastWin.toFixed(2)} cashed out at {currentMultiplier.toFixed(2)}×
          </div>
        )}

        <div className={styles.controls}>
          <BetInput
            label="Stake"
            value={stake}
            onChange={setStake}
            min={1}
            max={Math.max(1, balance)}
            step={1}
            disabled={playable}
          />

          <div className={styles.minesPicker}>
            <span className={styles.label}>Mines</span>
            <div className={styles.minesRow}>
              {MINE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={styles.mineBtn}
                  data-active={n === mineCount ? '' : undefined}
                  onClick={() => !playable && setMineCount(n)}
                  disabled={playable}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {phase === 'idle' && (
            <button
              type="button"
              className={styles.primary}
              onClick={startRound}
              disabled={balance < stake}
            >
              Place bet
            </button>
          )}
          {phase === 'playing' && (
            <button
              type="button"
              className={styles.cashout}
              onClick={cashOut}
              disabled={(round?.revealed.length ?? 0) === 0}
            >
              <span>Cashout</span>
              <span className={styles.cashoutAmt}>
                +${(stake * currentMultiplier).toFixed(2)}
              </span>
            </button>
          )}
          {(phase === 'busted' || phase === 'cashed') && (
            <button type="button" className={styles.primary} onClick={reset}>
              New round
            </button>
          )}
        </div>
      </div>
    </GameShell>
  );
}

function GemIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
      <defs>
        <linearGradient id="gem-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9affb1" />
          <stop offset="100%" stopColor="#1aa66a" />
        </linearGradient>
      </defs>
      <path
        d="M12 3 5 9l7 12 7-12-7-6Zm0 2.4 4.6 4-4.6 7.7-4.6-7.7 4.6-4Z"
        fill="url(#gem-grad)"
        stroke="#cfffd6"
        strokeWidth="0.4"
      />
      <path d="M9 9h6l-3 5-3-5Z" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

function MineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
      <defs>
        <radialGradient id="mine-grad" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#5a5868" />
          <stop offset="100%" stopColor="#0d0c14" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="13" r="6.5" fill="url(#mine-grad)" />
      <g stroke="#3a3845" strokeWidth="1.4" strokeLinecap="round">
        <line x1="12" y1="3.5" x2="12" y2="6" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="3.5" y1="13" x2="6" y2="13" />
        <line x1="20" y1="13" x2="22.5" y2="13" />
        <line x1="6.2" y1="6.5" x2="8" y2="8.3" />
        <line x1="16" y1="17.7" x2="17.8" y2="19.5" />
        <line x1="17.8" y1="6.5" x2="16" y2="8.3" />
        <line x1="8" y1="17.7" x2="6.2" y2="19.5" />
      </g>
      <circle cx="9.6" cy="10.6" r="1.4" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}
