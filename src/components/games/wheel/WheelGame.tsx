import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { BetInput } from '../shared/BetInput';
import styles from './WheelGame.module.css';

interface WheelGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

interface Segment {
  label: string;
  multiplier: number;
  color: string;
}

// 24 segments for a fortune wheel.
const SEGMENTS: Segment[] = [
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '5×', multiplier: 5, color: '#9affb1' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '10×', multiplier: 10, color: '#ffd86b' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '5×', multiplier: 5, color: '#9affb1' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '20×', multiplier: 20, color: '#b46cff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '5×', multiplier: 5, color: '#9affb1' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '2×', multiplier: 2, color: '#7ad5ff' },
  { label: '1×', multiplier: 1, color: '#1d2745' },
  { label: '50×', multiplier: 50, color: '#ff4757' },
];

export function WheelGame({ game, balance, onBalanceChange, onExit }: WheelGameProps) {
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [rotation, setRotation] = useState(0);
  const [resultIdx, setResultIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const spin = useCallback(() => {
    if (phase === 'spinning') return;
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    const idx = Math.floor(Math.random() * SEGMENTS.length);
    const segment = 360 / SEGMENTS.length;
    const targetAngle = -idx * segment;
    const turns = 5 + Math.floor(Math.random() * 3);
    setRotation((curr) => {
      let next = targetAngle - 360 * turns;
      while (next > curr - 360 * turns) next -= 360;
      return next;
    });
    setResultIdx(idx);
    setPhase('spinning');
    setLastWin(0);
    timerRef.current = window.setTimeout(() => {
      const seg = SEGMENTS[idx];
      const win = stake * seg.multiplier;
      setLastWin(win);
      onBalanceChange((b) => b + win);
      setHistory((h) => [seg.multiplier, ...h].slice(0, 24));
      setPhase('result');
    }, 4500);
  }, [balance, onBalanceChange, phase, stake]);

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle="Lucky wheel · multipliers up to 50×"
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Recent</div>
          <div className={styles.history}>
            {history.length === 0 && <span className={styles.empty}>No spins yet</span>}
            {history.map((m, i) => (
              <span
                key={i}
                className={styles.histPill}
                style={{
                  background: m >= 50 ? '#ff4757' : m >= 20 ? '#b46cff' : m >= 10 ? '#ffd86b' : m >= 5 ? '#9affb1' : m >= 2 ? '#7ad5ff' : '#1d2745',
                  color: m >= 10 && m < 20 ? '#2a1d04' : '#fff',
                }}
              >
                {m}×
              </span>
            ))}
          </div>
          <div className={styles.rulesTitle} style={{ marginTop: 18 }}>Multipliers</div>
          <ul className={styles.payList}>
            <li><span>Common</span><span>1×, 2×</span></li>
            <li><span>Rare</span><span>5×, 10×</span></li>
            <li><span>Top</span><span>20×, 50×</span></li>
          </ul>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.wheelWrap}>
          <svg
            className={styles.wheel}
            viewBox="-100 -100 200 200"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition:
                phase === 'spinning'
                  ? 'transform 4.4s cubic-bezier(0.18, 0.7, 0.05, 1)'
                  : 'none',
            }}
            aria-hidden
          >
            {SEGMENTS.map((seg, idx) => {
              const segAngle = 360 / SEGMENTS.length;
              const a0 = idx * segAngle - 90 - segAngle / 2;
              const a1 = a0 + segAngle;
              const r = 92;
              const x0 = r * Math.cos((a0 * Math.PI) / 180);
              const y0 = r * Math.sin((a0 * Math.PI) / 180);
              const x1 = r * Math.cos((a1 * Math.PI) / 180);
              const y1 = r * Math.sin((a1 * Math.PI) / 180);
              const labelA = idx * segAngle - 90;
              const labelR = 70;
              const lx = labelR * Math.cos((labelA * Math.PI) / 180);
              const ly = labelR * Math.sin((labelA * Math.PI) / 180);
              return (
                <g key={idx}>
                  <path
                    d={`M 0 0 L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                    fill={seg.color}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="0.6"
                  />
                  <text
                    x={lx}
                    y={ly}
                    transform={`rotate(${labelA + 90}, ${lx}, ${ly})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={
                      seg.multiplier >= 10 && seg.multiplier < 20
                        ? '#2a1d04'
                        : '#fff'
                    }
                    fontSize="11"
                    fontWeight="800"
                    style={{ paintOrder: 'stroke' }}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="0.4"
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle r="20" fill="url(#hub2)" />
            <defs>
              <radialGradient id="hub2" cx="0.4" cy="0.35" r="0.7">
                <stop offset="0%" stopColor="#ffeaa3" />
                <stop offset="60%" stopColor="#b58a23" />
                <stop offset="100%" stopColor="#4a3502" />
              </radialGradient>
            </defs>
          </svg>
          <div className={styles.pointer} aria-hidden />
        </div>

        <div className={styles.resultRow}>
          {phase === 'idle' && (
            <span className={styles.resultLabel}>Set your bet and spin</span>
          )}
          {phase === 'spinning' && (
            <span className={styles.resultLabel}>Spinning…</span>
          )}
          {phase === 'result' && resultIdx != null && (
            <span
              className={styles.resultLabel}
              style={{
                background: SEGMENTS[resultIdx].color,
                color: SEGMENTS[resultIdx].multiplier >= 10 && SEGMENTS[resultIdx].multiplier < 20 ? '#2a1d04' : '#fff',
              }}
            >
              Hit {SEGMENTS[resultIdx].multiplier}× ·
              {' '}
              {lastWin > 0 ? (
                <span style={{ fontWeight: 900 }}>
                  +${(lastWin - stake).toFixed(2)}
                </span>
              ) : (
                'Better luck next time'
              )}
            </span>
          )}
        </div>

        <div className={styles.controls}>
          <BetInput
            label="Bet"
            value={stake}
            onChange={setStake}
            disabled={phase === 'spinning'}
            max={Math.max(1, Math.min(10000, balance))}
          />
          <button
            type="button"
            className={styles.primary}
            onClick={spin}
            disabled={phase === 'spinning' || balance < stake}
          >
            {phase === 'spinning' ? 'Spinning…' : 'Spin'}
          </button>
        </div>
      </div>
    </GameShell>
  );
}
