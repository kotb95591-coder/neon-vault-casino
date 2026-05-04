import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { BetInput } from '../shared/BetInput';
import styles from './CrashGame.module.css';

interface CrashGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

type Phase = 'idle' | 'flying' | 'busted' | 'cashed';

interface RoundOutcome {
  multiplier: number;
  /** True if the player cashed out before the crash. */
  cashed: boolean;
}

/** Standard provably-fair-style crash distribution with a 3% house edge. */
function rollCrashPoint(): number {
  const u = Math.random();
  if (u < 0.03) return 1.0;
  const m = (100 - 3) / (100 * (1 - u));
  return Math.max(1.0, Math.round(m * 100) / 100);
}

function colorForMultiplier(m: number): string {
  if (m < 1.5) return '#7ad5ff';
  if (m < 3) return '#9affb1';
  if (m < 7) return '#ffd86b';
  if (m < 20) return '#ff944c';
  return '#ff4757';
}

export function CrashGame({ game, balance, onBalanceChange, onExit }: CrashGameProps) {
  const [stake, setStake] = useState<number>(10);
  const [phase, setPhase] = useState<Phase>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [history, setHistory] = useState<number[]>([1.42, 2.31, 1.07, 8.46, 1.18, 3.04, 1.62, 11.2]);
  const [lastWin, setLastWin] = useState<number>(0);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [autoEnabled, setAutoEnabled] = useState<boolean>(false);
  const [crashPoint, setCrashPoint] = useState<number>(1.0);
  const [cashedAt, setCashedAt] = useState<number | null>(null);

  const crashPointRef = useRef<number>(1.0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const cashedAtRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const launch = useCallback(() => {
    if (phase === 'flying') return;
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    setLastWin(0);
    cashedAtRef.current = null;
    setCashedAt(null);
    const cp = rollCrashPoint();
    crashPointRef.current = cp;
    setCrashPoint(cp);
    startTimeRef.current = performance.now();
    setMultiplier(1.0);
    setPhase('flying');
  }, [balance, onBalanceChange, phase, stake]);

  const settleRound = useCallback(
    (outcome: RoundOutcome) => {
      stop();
      setHistory((h) => [outcome.multiplier, ...h].slice(0, 24));
      if (outcome.cashed) {
        const win = stake * outcome.multiplier;
        setLastWin(win);
        // Stake was already deducted; credit the full payout.
        onBalanceChange((b) => b + win);
        setPhase('cashed');
      } else {
        setPhase('busted');
      }
    },
    [onBalanceChange, stake, stop],
  );

  const cashOut = useCallback(() => {
    if (phase !== 'flying') return;
    cashedAtRef.current = multiplier;
    setCashedAt(multiplier);
    settleRound({ multiplier, cashed: true });
  }, [multiplier, phase, settleRound]);

  // Animation loop.
  useEffect(() => {
    if (phase !== 'flying') return;
    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      // Multiplier curve: m(t) = 1.0 + 0.06t² + 0.18t. Smooth ramp up.
      const m = Math.max(1.0, 1.0 + 0.06 * elapsed * elapsed + 0.18 * elapsed);
      const rounded = Math.round(m * 100) / 100;
      // Auto cashout if armed.
      if (autoEnabled && cashedAtRef.current === null && rounded >= autoCashout) {
        cashedAtRef.current = autoCashout;
        setCashedAt(autoCashout);
        settleRound({ multiplier: autoCashout, cashed: true });
        return;
      }
      if (rounded >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        settleRound({ multiplier: crashPointRef.current, cashed: false });
        return;
      }
      setMultiplier(rounded);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => stop();
  }, [autoCashout, autoEnabled, phase, settleRound, stop]);

  // Auto-reset busted/cashed state to idle so the player can launch again.
  useEffect(() => {
    if (phase !== 'busted' && phase !== 'cashed') return;
    const t = window.setTimeout(() => setPhase('idle'), 2200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const curveD = useMemo(() => {
    // Generate a smooth curve from (0, 100) up to whichever current multiplier
    // we are at. Domain: 1.0..max(2, multiplier), Range: 100..0.
    const m = phase === 'flying' || phase === 'busted' || phase === 'cashed' ? multiplier : 1.0;
    const points: Array<[number, number]> = [];
    const maxM = Math.max(2.0, m * 1.1);
    const N = 64;
    for (let i = 0; i <= N; i += 1) {
      const t = i / N;
      const xMul = 1 + t * (m - 1);
      const x = ((xMul - 1) / (maxM - 1)) * 100;
      // Same curve shape as multiplier: scale y proportional to (xMul-1)².
      const yScale = ((xMul - 1) / (maxM - 1)) ** 1.4;
      const y = 100 - yScale * 96;
      points.push([x, y]);
    }
    return (
      'M ' +
      points
        .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
        .join(' L ')
    );
  }, [multiplier, phase]);

  const planePos = useMemo(() => {
    const m = phase === 'flying' || phase === 'busted' || phase === 'cashed' ? multiplier : 1.0;
    const maxM = Math.max(2.0, m * 1.1);
    const x = ((m - 1) / (maxM - 1)) * 100;
    const yScale = ((m - 1) / (maxM - 1)) ** 1.4;
    const y = 100 - yScale * 96;
    return { x, y };
  }, [multiplier, phase]);

  const canLaunch = phase === 'idle' && balance >= stake;
  const mColor = colorForMultiplier(multiplier);

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle="Crash · 1×–1000×"
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>How it works</div>
          <ol className={styles.rulesList}>
            <li>Place a stake before the round.</li>
            <li>Multiplier rises from 1×. The longer you wait, the bigger your potential payout.</li>
            <li>Cash out before the curve crashes to lock in <em>stake × multiplier</em>.</li>
            <li>If the curve crashes first, the stake is lost.</li>
          </ol>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>House edge</span>
            <span className={styles.statValue}>3%</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Max multiplier</span>
            <span className={styles.statValue}>1000×</span>
          </div>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.history}>
          {history.slice(0, 12).map((m, idx) => (
            <span
              key={idx}
              className={styles.historyChip}
              style={{ color: colorForMultiplier(m) }}
            >
              {m.toFixed(2)}×
            </span>
          ))}
        </div>

        <div className={styles.chart}>
          <svg className={styles.chartSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="crash-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={mColor} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="crash-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7ad5ff" />
                <stop offset="100%" stopColor={mColor} />
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`h${y}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.2"
              />
            ))}
            {[0, 25, 50, 75, 100].map((x) => (
              <line
                key={`v${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="100"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.2"
              />
            ))}
            <path
              d={`${curveD} L ${planePos.x.toFixed(2)},100 L 0,100 Z`}
              fill="url(#crash-fill)"
            />
            <path
              d={curveD}
              fill="none"
              stroke="url(#crash-line)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${mColor})` }}
            />
          </svg>

          <div
            className={styles.plane}
            style={{
              left: `${planePos.x}%`,
              top: `${planePos.y}%`,
              color: mColor,
              opacity: phase === 'busted' ? 0.4 : 1,
            }}
          >
            <PlaneIcon />
          </div>

          <div className={styles.multiplierWrap}>
            <div className={styles.multiplier} style={{ color: mColor }}>
              {multiplier.toFixed(2)}×
            </div>
            {phase === 'busted' && (
              <div className={styles.bustedLabel}>CRASHED @ {crashPoint.toFixed(2)}×</div>
            )}
            {phase === 'cashed' && (
              <div className={styles.cashedLabel}>
                CASHED OUT · +${lastWin.toFixed(2)}
              </div>
            )}
            {phase === 'idle' && <div className={styles.idleLabel}>Place your bet</div>}
            {phase === 'flying' && cashedAt != null && (
              <div className={styles.cashedLabel}>
                Cashed at {cashedAt.toFixed(2)}×
              </div>
            )}
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
            disabled={phase === 'flying'}
          />

          <div className={styles.autoBlock}>
            <label className={styles.autoToggle}>
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                disabled={phase === 'flying'}
              />
              <span>Auto cash-out at</span>
            </label>
            <input
              type="number"
              className={styles.autoInput}
              min={1.01}
              step={0.1}
              value={autoCashout}
              onChange={(e) =>
                setAutoCashout(Math.max(1.01, Number(e.target.value) || 1.01))
              }
              disabled={phase === 'flying'}
            />
            <span className={styles.autoSuffix}>×</span>
          </div>

          {phase === 'flying' ? (
            <button type="button" className={styles.cashoutBtn} onClick={cashOut}>
              <span className={styles.cashoutLabel}>Cashout</span>
              <span className={styles.cashoutAmount}>
                +${(stake * multiplier).toFixed(2)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.launchBtn}
              onClick={launch}
              disabled={!canLaunch}
            >
              {phase === 'busted' ? 'Try again' : phase === 'cashed' ? 'Bet again' : 'Bet & launch'}
            </button>
          )}
        </div>
      </div>
    </GameShell>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M2 16l8-2 4-9 1 .3-2 8.4 7-1.7-1 2.5-7 1.7-2.5 6.5-.9-.3 1.5-6.4-7.1 1.7Z" />
    </svg>
  );
}
