import { MinusIcon, PlayIcon, PlusIcon } from '../common/icons';
import styles from './ControlBar.module.css';

interface ControlBarProps {
  bet: number;
  onBetChange: (bet: number) => void;
  betLevels: number[];
  lines: number;
  onLinesChange: (lines: number) => void;
  maxLines: number;
  spinning: boolean;
  autoplay: boolean;
  onAutoplayToggle: () => void;
  onSpin: () => void;
  totalBet: number;
  lastWin: number;
}

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ControlBar({
  bet,
  onBetChange,
  betLevels,
  lines,
  onLinesChange,
  maxLines,
  spinning,
  autoplay,
  onAutoplayToggle,
  onSpin,
  totalBet,
  lastWin,
}: ControlBarProps) {
  const betIndex = betLevels.indexOf(bet);
  const decBet = () => betIndex > 0 && onBetChange(betLevels[betIndex - 1]);
  const incBet = () => betIndex < betLevels.length - 1 && onBetChange(betLevels[betIndex + 1]);
  const maxBet = () => onBetChange(betLevels[betLevels.length - 1]);

  return (
    <div className={styles.root}>
      <div className={styles.group}>
        <div className={styles.groupLabel}>Bet</div>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={decBet}
            disabled={spinning || betIndex <= 0}
            aria-label="Decrease bet"
          >
            <MinusIcon />
          </button>
          <div className={styles.stepperValue}>${formatMoney(bet)}</div>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={incBet}
            disabled={spinning || betIndex >= betLevels.length - 1}
            aria-label="Increase bet"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.groupLabel}>Lines</div>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => onLinesChange(Math.max(1, lines - 1))}
            disabled={spinning || lines <= 1}
            aria-label="Decrease lines"
          >
            <MinusIcon />
          </button>
          <div className={styles.stepperValue}>{lines}</div>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => onLinesChange(Math.min(maxLines, lines + 1))}
            disabled={spinning || lines >= maxLines}
            aria-label="Increase lines"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className={styles.spacer} />

      <div className={styles.spinArea}>
        <button
          type="button"
          className={`${styles.maxBet} ${styles.utilBtn}`}
          onClick={maxBet}
          disabled={spinning}
        >
          Max bet
        </button>

        <button
          type="button"
          className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
          onClick={onSpin}
          disabled={spinning}
          aria-label="Spin reels"
        >
          <span className={styles.spinRing} aria-hidden />
          <span className={styles.spinInner}>
            <PlayIcon className={styles.spinIcon} />
            <span className={styles.spinLabel}>{spinning ? 'Spinning' : 'Spin'}</span>
          </span>
        </button>

        <button
          type="button"
          className={`${styles.utilBtn} ${autoplay ? styles.autoActive : ''}`}
          onClick={onAutoplayToggle}
        >
          {autoplay ? 'Stop auto' : 'Auto'}
        </button>
      </div>

      <div className={styles.spacer} />

      <div className={styles.totals}>
        <div className={styles.totalsRow}>
          <span className={styles.totalLabel}>Total bet</span>
          <span className={styles.totalValue}>${formatMoney(totalBet)}</span>
        </div>
        <div className={styles.totalsRow}>
          <span className={styles.totalLabel}>Last win</span>
          <span
            className={`${styles.totalValue} ${lastWin > 0 ? styles.winValue : ''}`}
          >
            ${formatMoney(lastWin)}
          </span>
        </div>
      </div>
    </div>
  );
}
