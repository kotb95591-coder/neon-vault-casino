import { useEffect, useMemo, useState } from 'react';
import styles from './WinOverlay.module.css';

interface WinOverlayProps {
  amount: number;
  bigWinThreshold: number;
}

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Renders a celebratory win overlay. Mount only when there is something to
 * celebrate; the count animates from 0 to `amount` while mounted.
 */
export function WinOverlay({ amount, bigWinThreshold }: WinOverlayProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const duration = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(amount * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amount]);

  const tier = useMemo(() => {
    if (amount >= bigWinThreshold * 4) return 'mega';
    if (amount >= bigWinThreshold * 2) return 'big';
    return 'win';
  }, [amount, bigWinThreshold]);

  const label = tier === 'mega' ? 'Mega Win' : tier === 'big' ? 'Big Win' : 'Win';

  return (
    <div className={`${styles.root} ${styles[tier]}`} aria-live="polite">
      <div className={styles.bg} aria-hidden />
      <div className={styles.rays} aria-hidden />
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.amount}>${formatMoney(count)}</div>
      </div>
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
