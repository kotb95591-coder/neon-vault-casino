import type { ReactNode } from 'react';
import type { GameMeta } from '../../types';
import { ChevronLeftIcon } from '../common/icons';
import styles from './GameShell.module.css';

interface GameShellProps {
  game: GameMeta;
  balance: number;
  subtitle?: string;
  onExit: () => void;
  children: ReactNode;
  /** Right-hand panel content (paytable, rules, history). */
  aside?: ReactNode;
}

export function GameShell({
  game,
  balance,
  subtitle,
  onExit,
  children,
  aside,
}: GameShellProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onExit}>
          <ChevronLeftIcon />
          <span>Lobby</span>
        </button>
        <div className={styles.titleArea}>
          <div className={styles.title}>{game.title}</div>
          <div className={styles.meta}>
            <span>{game.provider}</span>
            <span className={styles.dot} />
            <span>RTP {game.rtp.toFixed(1)}%</span>
            {subtitle && (
              <>
                <span className={styles.dot} />
                <span>{subtitle}</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Balance</div>
            <div className={styles.balanceValue}>${balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className={aside ? styles.bodyWithAside : styles.body}>
        <section className={styles.main}>{children}</section>
        {aside && <aside className={styles.aside}>{aside}</aside>}
      </div>
    </div>
  );
}
