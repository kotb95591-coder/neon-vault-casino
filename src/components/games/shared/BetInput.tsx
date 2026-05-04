import { MinusIcon, PlusIcon } from '../../common/icons';
import styles from './BetInput.module.css';

interface BetInputProps {
  label?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

export function BetInput({
  label,
  value,
  onChange,
  min = 0.2,
  max = 10000,
  step = 1,
  disabled,
}: BetInputProps) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100));
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100));
  const half = () => onChange(Math.max(min, Math.round((value / 2) * 100) / 100));
  const dbl = () => onChange(Math.min(max, Math.round(value * 2 * 100) / 100));

  return (
    <div className={styles.root} data-disabled={disabled || undefined}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <button
          type="button"
          className={styles.step}
          onClick={dec}
          disabled={disabled || value <= min}
          aria-label="Decrease"
        >
          <MinusIcon />
        </button>
        <div className={styles.valueWrap}>
          <span className={styles.currency}>$</span>
          <input
            type="number"
            className={styles.value}
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              onChange(Math.min(max, Math.max(min, n)));
            }}
            aria-label={label || 'Bet amount'}
          />
          <span className={styles.preview}>{fmt(value)}</span>
        </div>
        <button
          type="button"
          className={styles.step}
          onClick={inc}
          disabled={disabled || value >= max}
          aria-label="Increase"
        >
          <PlusIcon />
        </button>
      </div>
      <div className={styles.shortcuts}>
        <button type="button" className={styles.short} onClick={half} disabled={disabled}>
          ½
        </button>
        <button type="button" className={styles.short} onClick={dbl} disabled={disabled}>
          2×
        </button>
        <button
          type="button"
          className={styles.short}
          onClick={() => onChange(max)}
          disabled={disabled}
        >
          MAX
        </button>
      </div>
    </div>
  );
}
