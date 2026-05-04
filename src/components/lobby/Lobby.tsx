import type { GameMeta } from '../../types';
import { GAMES, gamesByCategory, gamesWithTag } from '../../data/games';
import { PromoBanner } from './PromoBanner';
import { GameSection } from './GameSection';
import styles from './Lobby.module.css';

type FilterKey =
  | 'home'
  | 'slots'
  | 'live'
  | 'table'
  | 'crash'
  | 'instant'
  | 'hot'
  | 'new'
  | 'promotions';

interface LobbyProps {
  filter: FilterKey;
  search: string;
  onPlay: (game: GameMeta) => void;
}

export function Lobby({ filter, search, onPlay }: LobbyProps) {
  const query = search.trim().toLowerCase();
  const all = query
    ? GAMES.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.provider.toLowerCase().includes(query),
      )
    : GAMES;

  if (query) {
    return (
      <div className={styles.root}>
        <GameSection
          title={`Search results for “${search.trim()}”`}
          subtitle={`${all.length} games found`}
          accent="cyan"
          games={all}
          onPlay={onPlay}
        />
      </div>
    );
  }

  if (filter === 'slots') {
    return (
      <div className={styles.root}>
        <GameSection title="All slots" subtitle="9 titles" accent="purple" games={gamesByCategory('slots')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'live') {
    return (
      <div className={styles.root}>
        <GameSection title="Live casino" subtitle="Live dealers · 24/7" accent="cyan" games={gamesByCategory('live')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'table') {
    return (
      <div className={styles.root}>
        <GameSection title="Table games" accent="gold" games={gamesByCategory('table')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'crash') {
    return (
      <div className={styles.root}>
        <GameSection title="Crash games" accent="purple" games={gamesByCategory('crash')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'instant') {
    return (
      <div className={styles.root}>
        <GameSection title="Instant win" accent="gold" games={gamesByCategory('instant')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'hot') {
    return (
      <div className={styles.root}>
        <GameSection title="Hot games" subtitle="Most played in the last 24 hours" accent="gold" games={gamesWithTag('hot')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'new') {
    return (
      <div className={styles.root}>
        <GameSection title="New releases" subtitle="Fresh from our providers" accent="cyan" games={gamesWithTag('new')} onPlay={onPlay} />
      </div>
    );
  }
  if (filter === 'promotions') {
    return (
      <div className={styles.root}>
        <PromoBanner onCTA={() => undefined} />
        <GameSection title="Bonus eligible games" subtitle="Use your free spins here" accent="gold" games={gamesWithTag('exclusive').concat(gamesWithTag('jackpot'))} onPlay={onPlay} />
      </div>
    );
  }

  // Default: home / lobby
  const slots = gamesByCategory('slots');
  return (
    <div className={styles.root}>
      <PromoBanner onCTA={() => undefined} />
      <GameSection
        title="Hot games"
        subtitle="Trending right now"
        accent="gold"
        games={gamesWithTag('hot')}
        onPlay={onPlay}
      />
      <GameSection
        title="Top slots"
        subtitle="Curated for you"
        accent="purple"
        games={slots.slice(0, 8)}
        onPlay={onPlay}
      />
      <GameSection
        title="New releases"
        subtitle="Latest arrivals"
        accent="cyan"
        games={gamesWithTag('new')}
        onPlay={onPlay}
      />
      <GameSection
        title="Live casino"
        subtitle="Real dealers, real time"
        accent="purple"
        games={gamesByCategory('live')}
        onPlay={onPlay}
      />
    </div>
  );
}
