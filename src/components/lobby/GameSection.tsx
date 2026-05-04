import type { GameMeta } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../common/icons';
import { GameCard } from './GameCard';
import styles from './GameSection.module.css';

interface GameSectionProps {
  title: string;
  subtitle?: string;
  accent?: 'gold' | 'purple' | 'cyan';
  games: GameMeta[];
  onPlay: (game: GameMeta) => void;
}

export function GameSection({
  title,
  subtitle,
  accent = 'purple',
  games,
  onPlay,
}: GameSectionProps) {
  if (games.length === 0) return null;
  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={`${styles.accent} ${styles[`accent_${accent}`]}`} aria-hidden />
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.viewAll}>View all</button>
          <div className={styles.arrows}>
            <button type="button" className={styles.arrow} aria-label="Previous">
              <ChevronLeftIcon />
            </button>
            <button type="button" className={styles.arrow} aria-label="Next">
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {games.map((g) => (
          <GameCard key={g.id} game={g} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}
