import type { GameMeta } from '../../types';
import { PlayIcon } from '../common/icons';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: GameMeta;
  onPlay: (game: GameMeta) => void;
}

const VOLATILITY_LABEL: Record<GameMeta['volatility'], string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
  extreme: 'Extreme',
};

const TAG_LABEL: Record<NonNullable<GameMeta['tags']>[number], string> = {
  hot: 'Hot',
  new: 'New',
  exclusive: 'Exclusive',
  jackpot: 'Jackpot',
};

const TAG_CLASS: Record<NonNullable<GameMeta['tags']>[number], string> = {
  hot: styles.tagHot,
  new: styles.tagNew,
  exclusive: styles.tagExclusive,
  jackpot: styles.tagJackpot,
};

export function GameCard({ game, onPlay }: GameCardProps) {
  const [c1, c2] = game.palette;
  const cardStyle: React.CSSProperties = {
    background: `radial-gradient(120% 90% at 30% 0%, ${c2}55 0%, transparent 55%),
                 linear-gradient(160deg, ${c1} 0%, #0c0916 100%)`,
  };

  return (
    <button type="button" className={styles.root} onClick={() => onPlay(game)}>
      <div className={styles.art} style={cardStyle}>
        <div className={styles.deco1} aria-hidden style={{ background: c2 }} />
        <div className={styles.deco2} aria-hidden style={{ background: c2 }} />
        <div className={styles.glyph} style={{ color: c2 }}>
          {game.glyph}
        </div>
        <div className={styles.title}>{game.title}</div>
        <div className={styles.providerInside}>{game.provider}</div>

        <div className={styles.tags}>
          {game.tags?.map((t) => (
            <span key={t} className={`${styles.tag} ${TAG_CLASS[t]}`}>
              {TAG_LABEL[t]}
            </span>
          ))}
        </div>

        <div className={styles.overlay} aria-hidden>
          <span className={styles.playBtn}>
            <PlayIcon className={styles.playIcon} />
          </span>
          <span className={styles.playLabel}>Play now</span>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaTitle}>{game.title}</span>
        <span className={styles.metaRow}>
          <span className={styles.provider}>{game.provider}</span>
          <span className={styles.dot} />
          <span className={styles.rtp}>RTP {game.rtp.toFixed(1)}%</span>
          <span className={styles.dot} />
          <span className={styles.vol}>Vol {VOLATILITY_LABEL[game.volatility]}</span>
        </span>
      </div>
    </button>
  );
}
