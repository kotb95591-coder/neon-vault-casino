import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import styles from './RouletteGame.module.css';

interface RouletteGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

// European single-zero wheel order (clockwise).
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const isRed = (n: number) => RED_NUMBERS.has(n);
const isBlack = (n: number) => n !== 0 && !RED_NUMBERS.has(n);

type BetKey =
  | { type: 'straight'; n: number }
  | { type: 'red' }
  | { type: 'black' }
  | { type: 'even' }
  | { type: 'odd' }
  | { type: 'low' }
  | { type: 'high' }
  | { type: 'dozen'; index: 0 | 1 | 2 }
  | { type: 'column'; index: 0 | 1 | 2 };

const keyId = (b: BetKey): string => {
  switch (b.type) {
    case 'straight':
      return `s-${b.n}`;
    case 'dozen':
      return `d-${b.index}`;
    case 'column':
      return `c-${b.index}`;
    default:
      return b.type;
  }
};

function payoutOf(bet: BetKey, n: number): number {
  switch (bet.type) {
    case 'straight':
      return bet.n === n ? 35 : -1;
    case 'red':
      return isRed(n) ? 1 : -1;
    case 'black':
      return isBlack(n) ? 1 : -1;
    case 'even':
      return n !== 0 && n % 2 === 0 ? 1 : -1;
    case 'odd':
      return n !== 0 && n % 2 === 1 ? 1 : -1;
    case 'low':
      return n >= 1 && n <= 18 ? 1 : -1;
    case 'high':
      return n >= 19 && n <= 36 ? 1 : -1;
    case 'dozen': {
      const lo = bet.index * 12 + 1;
      const hi = lo + 11;
      return n >= lo && n <= hi ? 2 : -1;
    }
    case 'column': {
      // Column 0 = 1, 4, 7, ... (n%3 == 1); Column 1 = n%3 == 2; Column 2 = n%3 == 0
      if (n === 0) return -1;
      const c = n % 3 === 0 ? 2 : (n % 3) - 1;
      return c === bet.index ? 2 : -1;
    }
  }
}

const colorFor = (n: number) =>
  n === 0 ? 'green' : isRed(n) ? 'red' : 'black';

interface PlacedBet {
  bet: BetKey;
  amount: number;
}

export function RouletteGame({ game, balance, onBalanceChange, onExit }: RouletteGameProps) {
  const [chip, setChip] = useState<number>(5);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [phase, setPhase] = useState<'betting' | 'spinning' | 'settled'>('betting');
  const [resultIdx, setResultIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [lastNet, setLastNet] = useState<number>(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
  }, []);

  const totalStaked = useMemo(
    () => bets.reduce((s, b) => s + b.amount, 0),
    [bets],
  );

  const placeBet = useCallback(
    (bet: BetKey) => {
      if (phase !== 'betting') return;
      if (balance < chip) return;
      onBalanceChange((b) => b - chip);
      const id = keyId(bet);
      setBets((prev) => {
        const existing = prev.find((p) => keyId(p.bet) === id);
        if (existing) {
          return prev.map((p) =>
            keyId(p.bet) === id ? { ...p, amount: p.amount + chip } : p,
          );
        }
        return [...prev, { bet, amount: chip }];
      });
    },
    [balance, chip, onBalanceChange, phase],
  );

  const clearBets = useCallback(() => {
    if (phase !== 'betting') return;
    onBalanceChange((b) => b + totalStaked);
    setBets([]);
  }, [onBalanceChange, phase, totalStaked]);

  const spin = useCallback(() => {
    if (phase !== 'betting') return;
    if (bets.length === 0) return;
    const idx = Math.floor(Math.random() * WHEEL_ORDER.length);
    setResultIdx(idx);
    setPhase('spinning');
    // Set rotation so the result number ends at top.
    const segment = 360 / WHEEL_ORDER.length;
    const targetAngle = -idx * segment;
    setWheelRotation((curr) => {
      const baseTurns = 4 + Math.floor(Math.random() * 3);
      // Compute next absolute rotation. We want final rotation modulo 360 == targetAngle modulo 360.
      const target = targetAngle - 360 * baseTurns;
      // Make sure new rotation is less than current (wheel spins clockwise).
      let next = target;
      while (next > curr - 360 * baseTurns) next -= 360;
      return next;
    });
    settleTimerRef.current = window.setTimeout(() => {
      const n = WHEEL_ORDER[idx];
      let net = 0;
      for (const { bet, amount } of bets) {
        const p = payoutOf(bet, n);
        if (p > 0) net += amount + amount * p;
      }
      setLastNet(net - totalStaked);
      onBalanceChange((b) => b + net);
      setHistory((h: number[]) => [n, ...h].slice(0, 24));
      setPhase('settled');
      setBets([]);
    }, 4500);
  }, [bets, onBalanceChange, phase, totalStaked]);

  const newRound = useCallback(() => {
    setPhase('betting');
    setResultIdx(null);
    setLastNet(0);
  }, []);

  const totalsByCell = useMemo(() => {
    const m = new Map<string, number>();
    for (const { bet, amount } of bets) {
      m.set(keyId(bet), (m.get(keyId(bet)) ?? 0) + amount);
    }
    return m;
  }, [bets]);

  // Number grid: 12 columns × 3 rows. Top row (y=0) is column 2, bottom y=2 is column 0.
  // Each cell is a number n where n = col*3 + (3-row), so row 2 = column 0 numbers.
  const numberGrid = useMemo(() => {
    const rows: number[][] = [[], [], []];
    for (let col = 0; col < 12; col += 1) {
      for (let r = 0; r < 3; r += 1) {
        const n = col * 3 + (3 - r);
        rows[r].push(n);
      }
    }
    return rows;
  }, []);

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle="European · single zero"
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Recent</div>
          <div className={styles.history}>
            {history.length === 0 && <span className={styles.empty}>No spins yet</span>}
            {history.map((n, idx) => (
              <span key={idx} className={`${styles.histNum} ${styles[`color_${colorFor(n)}`]}`}>
                {n}
              </span>
            ))}
          </div>
          <div className={styles.rulesTitle} style={{ marginTop: 18 }}>Payouts</div>
          <ul className={styles.payList}>
            <li><span>Straight</span><span>35:1</span></li>
            <li><span>Red / Black</span><span>1:1</span></li>
            <li><span>Even / Odd</span><span>1:1</span></li>
            <li><span>1–18 / 19–36</span><span>1:1</span></li>
            <li><span>Dozen / Column</span><span>2:1</span></li>
          </ul>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.topArea}>
          <div className={styles.wheelWrap}>
            <svg
              className={styles.wheelSvg}
              viewBox="-100 -100 200 200"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition:
                  phase === 'spinning'
                    ? 'transform 4.4s cubic-bezier(0.18, 0.7, 0.05, 1)'
                    : 'none',
              }}
              aria-hidden
            >
              <defs>
                <radialGradient id="wheel-rim" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="80%" stopColor="#2a1d04" />
                  <stop offset="100%" stopColor="#08060d" />
                </radialGradient>
                <linearGradient id="seg-red" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c41e3a" />
                  <stop offset="100%" stopColor="#7a0d22" />
                </linearGradient>
                <linearGradient id="seg-black" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d1d24" />
                  <stop offset="100%" stopColor="#07050d" />
                </linearGradient>
                <linearGradient id="seg-green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ed573" />
                  <stop offset="100%" stopColor="#0a3a17" />
                </linearGradient>
              </defs>
              <circle r="92" fill="url(#wheel-rim)" stroke="#ffd86b" strokeWidth="1.4" />
              {WHEEL_ORDER.map((n, idx) => {
                const seg = 360 / WHEEL_ORDER.length;
                const a0 = idx * seg - 90 - seg / 2;
                const a1 = a0 + seg;
                const r = 86;
                const x0 = r * Math.cos((a0 * Math.PI) / 180);
                const y0 = r * Math.sin((a0 * Math.PI) / 180);
                const x1 = r * Math.cos((a1 * Math.PI) / 180);
                const y1 = r * Math.sin((a1 * Math.PI) / 180);
                const c = colorFor(n);
                const fill =
                  c === 'red'
                    ? 'url(#seg-red)'
                    : c === 'black'
                      ? 'url(#seg-black)'
                      : 'url(#seg-green)';
                const labelA = idx * seg - 90;
                const labelR = 73;
                const lx = labelR * Math.cos((labelA * Math.PI) / 180);
                const ly = labelR * Math.sin((labelA * Math.PI) / 180);
                return (
                  <g key={idx}>
                    <path
                      d={`M 0 0 L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                      fill={fill}
                      stroke="rgba(255,216,107,0.3)"
                      strokeWidth="0.4"
                    />
                    <text
                      x={lx}
                      y={ly}
                      transform={`rotate(${labelA + 90}, ${lx}, ${ly})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize="9"
                      fontWeight="800"
                      style={{ paintOrder: 'stroke' }}
                      stroke="rgba(0,0,0,0.55)"
                      strokeWidth="0.5"
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
              <circle r="32" fill="url(#hub-grad)" />
              <defs>
                <radialGradient id="hub-grad" cx="0.4" cy="0.35" r="0.7">
                  <stop offset="0%" stopColor="#ffeaa3" />
                  <stop offset="60%" stopColor="#b58a23" />
                  <stop offset="100%" stopColor="#4a3502" />
                </radialGradient>
              </defs>
              <circle r="32" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.6" />
              <text
                y="2"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#1a1102"
                fontSize="13"
                fontWeight="800"
                fontFamily="var(--font-display)"
                letterSpacing="1"
              >
                EU
              </text>
            </svg>
            <div className={styles.pointer} aria-hidden />
            <div className={styles.resultBadge}>
              {resultIdx != null ? (
                <>
                  <span className={styles.resultLabel}>
                    {phase === 'spinning' ? 'Spinning…' : 'Winner'}
                  </span>
                  <span
                    className={`${styles.resultNum} ${styles[`color_${colorFor(WHEEL_ORDER[resultIdx])}`]}`}
                  >
                    {phase === 'spinning' ? '?' : WHEEL_ORDER[resultIdx]}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.resultLabel}>Place your bets</span>
                  <span className={styles.resultNum}>—</span>
                </>
              )}
              {phase === 'settled' && (
                <span
                  className={styles.resultNet}
                  style={{ color: lastNet >= 0 ? '#9affb1' : '#ff7373' }}
                >
                  {lastNet >= 0 ? '+' : ''}${lastNet.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <div className={styles.table}>
            <button
              type="button"
              className={`${styles.cell} ${styles.zero} ${styles.color_green}`}
              onClick={() => placeBet({ type: 'straight', n: 0 })}
              disabled={phase !== 'betting'}
            >
              0
              {(totalsByCell.get(keyId({ type: 'straight', n: 0 })) ?? 0) > 0 && (
                <Chip amount={totalsByCell.get(keyId({ type: 'straight', n: 0 })) ?? 0} />
              )}
            </button>

            <div className={styles.numberGrid}>
              {numberGrid.map((row, ri) => (
                <div key={ri} className={styles.numRow}>
                  {row.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`${styles.cell} ${styles[`color_${colorFor(n)}`]}`}
                      onClick={() => placeBet({ type: 'straight', n })}
                      disabled={phase !== 'betting'}
                    >
                      {n}
                      {(totalsByCell.get(keyId({ type: 'straight', n })) ?? 0) > 0 && (
                        <Chip amount={totalsByCell.get(keyId({ type: 'straight', n })) ?? 0} />
                      )}
                    </button>
                  ))}
                </div>
              ))}
              <div className={styles.colsRow}>
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.cell} ${styles.outside}`}
                    onClick={() => placeBet({ type: 'column', index: idx as 0 | 1 | 2 })}
                    disabled={phase !== 'betting'}
                  >
                    2:1
                    {(totalsByCell.get(keyId({ type: 'column', index: idx as 0 | 1 | 2 })) ?? 0) > 0 && (
                      <Chip
                        amount={totalsByCell.get(keyId({ type: 'column', index: idx as 0 | 1 | 2 })) ?? 0}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.dozensRow}>
            {(['low', 'mid', 'high'] as const).map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`${styles.cell} ${styles.outside}`}
                onClick={() =>
                  placeBet({ type: 'dozen', index: idx as 0 | 1 | 2 })
                }
                disabled={phase !== 'betting'}
              >
                {idx === 0 ? '1–12' : idx === 1 ? '13–24' : '25–36'}
                {(totalsByCell.get(keyId({ type: 'dozen', index: idx as 0 | 1 | 2 })) ?? 0) > 0 && (
                  <Chip
                    amount={totalsByCell.get(keyId({ type: 'dozen', index: idx as 0 | 1 | 2 })) ?? 0}
                  />
                )}
              </button>
            ))}
          </div>

          <div className={styles.outsideRow}>
            <BetCell
              label="1–18"
              betKey={{ type: 'low' }}
              amount={totalsByCell.get('low') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
            <BetCell
              label="EVEN"
              betKey={{ type: 'even' }}
              amount={totalsByCell.get('even') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
            <BetCell
              label="RED"
              extraClass={styles.color_red}
              betKey={{ type: 'red' }}
              amount={totalsByCell.get('red') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
            <BetCell
              label="BLACK"
              extraClass={styles.color_black}
              betKey={{ type: 'black' }}
              amount={totalsByCell.get('black') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
            <BetCell
              label="ODD"
              betKey={{ type: 'odd' }}
              amount={totalsByCell.get('odd') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
            <BetCell
              label="19–36"
              betKey={{ type: 'high' }}
              amount={totalsByCell.get('high') ?? 0}
              onPlace={placeBet}
              disabled={phase !== 'betting'}
            />
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.chipPicker}>
            <span className={styles.chipLabel}>Chip value</span>
            <div className={styles.chipRow}>
              {[1, 5, 10, 25, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.chipBtn} ${styles[`chip_${v}`]}`}
                  data-active={v === chip ? '' : undefined}
                  onClick={() => setChip(v)}
                  disabled={phase !== 'betting'}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.totals}>
            <div className={styles.totalsRow}>
              <span>On table</span>
              <span>${totalStaked.toFixed(2)}</span>
            </div>
            <div className={styles.totalsRow}>
              <span>Last net</span>
              <span style={{ color: lastNet >= 0 ? '#9affb1' : '#ff7373' }}>
                {lastNet >= 0 ? '+' : ''}${lastNet.toFixed(2)}
              </span>
            </div>
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={clearBets}
              disabled={phase !== 'betting' || bets.length === 0}
            >
              Clear
            </button>
            {phase !== 'settled' ? (
              <button
                type="button"
                className={styles.primary}
                onClick={spin}
                disabled={phase !== 'betting' || bets.length === 0}
              >
                {phase === 'spinning' ? 'Spinning…' : 'Spin'}
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={newRound}>
                New round
              </button>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function BetCell({
  label,
  betKey,
  amount,
  onPlace,
  disabled,
  extraClass,
}: {
  label: string;
  betKey: BetKey;
  amount: number;
  onPlace: (b: BetKey) => void;
  disabled: boolean;
  extraClass?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.cell} ${styles.outside} ${extraClass ?? ''}`}
      onClick={() => onPlace(betKey)}
      disabled={disabled}
    >
      {label}
      {amount > 0 && <Chip amount={amount} />}
    </button>
  );
}

function Chip({ amount }: { amount: number }) {
  return (
    <span className={styles.chip} aria-label={`Chip $${amount}`}>
      ${amount}
    </span>
  );
}
