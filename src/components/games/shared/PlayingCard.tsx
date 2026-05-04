import { isRed, SUIT_GLYPH, type CardData } from './cards';
import styles from './PlayingCard.module.css';

interface PlayingCardProps {
  card?: CardData | null;
  faceDown?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

export function PlayingCard({
  card,
  faceDown,
  className,
  size = 'md',
  highlight,
}: PlayingCardProps) {
  if (faceDown || !card) {
    return (
      <div
        className={`${styles.card} ${styles[`size_${size}`]} ${styles.back} ${className ?? ''}`}
        aria-label="Face down card"
      />
    );
  }

  const red = isRed(card.suit);
  return (
    <div
      className={`${styles.card} ${styles[`size_${size}`]} ${red ? styles.red : ''} ${highlight ? styles.highlight : ''} ${className ?? ''}`}
      aria-label={`${card.rank} of ${card.suit}s`}
    >
      <div className={styles.cornerTop}>
        <div className={styles.rank}>{card.rank}</div>
        <div className={styles.suit}>{SUIT_GLYPH[card.suit]}</div>
      </div>
      <div className={styles.center}>{SUIT_GLYPH[card.suit]}</div>
      <div className={styles.cornerBottom}>
        <div className={styles.rank}>{card.rank}</div>
        <div className={styles.suit}>{SUIT_GLYPH[card.suit]}</div>
      </div>
    </div>
  );
}
