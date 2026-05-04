import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { BetInput } from '../shared/BetInput';
import styles from './PlinkoGame.module.css';

interface PlinkoGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

type Risk = 'low' | 'medium' | 'high';

const ROWS = 12;

const PAYOUTS: Record<Risk, number[]> = {
  low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
  medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
  high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
};

interface ActiveBall {
  id: number;
  /** Direction taken at each row (0 = left, 1 = right). */
  path: number[];
  /** 0..ROWS, current row reached. */
  step: number;
}

const STEP_MS = 90;

function colorForMultiplier(m: number): string {
  if (m < 0.6) return '#7ad5ff';
  if (m < 1.2) return '#9affb1';
  if (m < 3) return '#ffeaa3';
  if (m < 10) return '#ffd86b';
  if (m < 30) return '#ff944c';
  return '#ff4757';
}

export function PlinkoGame({ game, balance, onBalanceChange, onExit }: PlinkoGameProps) {
  const [stake, setStake] = useState<number>(10);
  const [risk, setRisk] = useState<Risk>('medium');
  const [history, setHistory] = useState<Array<{ slot: number; mult: number }>>([]);
  const [activeBalls, setActiveBalls] = useState<ActiveBall[]>([]);
  const [totalWon, setTotalWon] = useState(0);
  const idRef = useRef(0);
  const ballTimers = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const timers = ballTimers.current;
    return () => {
      for (const t of timers.values()) window.clearInterval(t);
      timers.clear();
    };
  }, []);

  const drop = useCallback(() => {
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    const path: number[] = [];
    for (let i = 0; i < ROWS; i += 1) path.push(Math.random() < 0.5 ? 0 : 1);
    const finalSlot = path.reduce((a, b) => a + b, 0);
    const mult = PAYOUTS[risk][finalSlot];
    const payout = stake * mult;
    const id = (idRef.current += 1);
    const ball: ActiveBall = { id, path, step: 0 };
    setActiveBalls((b) => [...b, ball]);

    const timer = window.setInterval(() => {
      setActiveBalls((bs) =>
        bs.map((b) => (b.id === id ? { ...b, step: Math.min(ROWS, b.step + 1) } : b)),
      );
    }, STEP_MS);
    ballTimers.current.set(id, timer);

    // After ball settles, payout, add to history, remove ball.
    window.setTimeout(() => {
      window.clearInterval(timer);
      ballTimers.current.delete(id);
      onBalanceChange((b) => b + payout);
      setHistory((h) => [{ slot: finalSlot, mult }, ...h].slice(0, 24));
      setTotalWon((t) => t + payout - stake);
      setActiveBalls((bs) => bs.filter((b) => b.id !== id));
    }, STEP_MS * (ROWS + 1));
  }, [balance, onBalanceChange, risk, stake]);

  const payouts = PAYOUTS[risk];

  const pegs = useMemo(() => {
    // For each row r (0..ROWS-1), there are r+2 pegs starting horizontally.
    // We position pegs at columns from (ROWS - r) / 2 in steps of 1.
    const list: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < ROWS; r += 1) {
      const pegsInRow = r + 2;
      const yPct = ((r + 0.5) / (ROWS + 1)) * 92 + 4;
      // Map columns to x percentages so peg row width matches the slot count.
      const startCol = (ROWS - r) / 2;
      for (let p = 0; p < pegsInRow; p += 1) {
        const col = startCol + p;
        const xPct = (col / (ROWS + 1)) * 100;
        list.push({ x: xPct, y: yPct });
      }
    }
    return list;
  }, []);

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle={`Plinko · ${ROWS} rows · ${risk}`}
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Slot multipliers ({risk})</div>
          <ul className={styles.payoutList}>
            {payouts.map((m, idx) => (
              <li key={idx} className={styles.payoutRow}>
                <span className={styles.slotIdx}>Slot {idx + 1}</span>
                <span style={{ color: colorForMultiplier(m) }} className={styles.payoutMult}>
                  {m.toFixed(m < 1 ? 1 : m < 10 ? 2 : 1)}×
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.rulesTitle} style={{ marginTop: 14 }}>Session</div>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Net</span>
            <span className={styles.statValue} style={{ color: totalWon >= 0 ? '#9affb1' : '#ff7373' }}>
              {totalWon >= 0 ? '+' : ''}${totalWon.toFixed(2)}
            </span>
          </div>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.history}>
          {history.slice(0, 14).map((h, idx) => (
            <span
              key={idx}
              className={styles.histChip}
              style={{ color: colorForMultiplier(h.mult) }}
            >
              {h.mult.toFixed(h.mult < 10 ? 2 : 1)}×
            </span>
          ))}
        </div>

        <div className={styles.boardWrap}>
          <div className={styles.board}>
            <div className={styles.pegs} aria-hidden>
              {pegs.map((p, i) => (
                <span
                  key={i}
                  className={styles.peg}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              ))}
            </div>

            {activeBalls.map((ball) => {
              const partialPath = ball.path.slice(0, ball.step);
              const x = partialPath.reduce((a, b) => a + b, 0);
              // Position ball: column = x + (ROWS - ball.step) / 2 so it stays
              // centred relative to the row's peg layout.
              const col = x + (ROWS - ball.step) / 2;
              const xPct = ((col + 1) / (ROWS + 2)) * 100;
              const yPct = ((ball.step + 1) / (ROWS + 1)) * 92 + 2;
              return (
                <span
                  key={ball.id}
                  className={styles.ball}
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                  }}
                />
              );
            })}
          </div>

          <div className={styles.slots}>
            {payouts.map((m, idx) => (
              <span
                key={idx}
                className={styles.slot}
                style={{
                  background: `linear-gradient(180deg, ${colorForMultiplier(m)}, color-mix(in srgb, ${colorForMultiplier(m)} 60%, #07050d))`,
                }}
              >
                {m.toFixed(m < 10 ? 2 : 1)}×
              </span>
            ))}
          </div>
        </div>

        <div className={styles.controls}>
          <BetInput
            label="Stake"
            value={stake}
            onChange={setStake}
            min={1}
            max={Math.max(1, balance)}
            step={1}
          />
          <div className={styles.riskBlock}>
            <span className={styles.label}>Risk</span>
            <div className={styles.riskRow}>
              {(['low', 'medium', 'high'] as Risk[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={styles.riskBtn}
                  data-active={r === risk ? '' : undefined}
                  onClick={() => setRisk(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={styles.dropBtn}
            onClick={drop}
            disabled={balance < stake}
          >
            Drop ball
          </button>
        </div>
      </div>
    </GameShell>
  );
}
