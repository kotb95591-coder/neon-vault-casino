import styles from './PromoBanner.module.css';

interface PromoBannerProps {
  onCTA: () => void;
}

export function PromoBanner({ onCTA }: PromoBannerProps) {
  return (
    <section className={styles.root} aria-label="Welcome promotion">
      <div className={styles.bg} aria-hidden>
        <div className={styles.orbA} />
        <div className={styles.orbB} />
        <div className={styles.orbC} />
        <svg
          className={styles.deco}
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="promoLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd86b" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#b46cff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-40 240 Q150 110 320 200 T660 90"
            fill="none"
            stroke="url(#promoLine)"
            strokeWidth="2"
          />
          <path
            d="M-40 280 Q200 180 380 240 T660 160"
            fill="none"
            stroke="url(#promoLine)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className={styles.content}>
        <div className={styles.kicker}>Welcome Package · Exclusive</div>
        <h1 className={styles.title}>
          <span className={styles.titleGold}>100% match up to $1,000</span>
          <span className={styles.titlePlus}>+ 200 free spins</span>
        </h1>
        <p className={styles.sub}>
          Activate your welcome bonus and unlock four weeks of cashback,
          tournament entries and personalised rewards.
        </p>
        <div className={styles.cta}>
          <button type="button" className={styles.primary} onClick={onCTA}>
            Claim bonus
          </button>
          <button type="button" className={styles.secondary}>
            Terms apply
          </button>
        </div>

        <div className={styles.stats}>
          <Stat label="Active players" value="42,318" />
          <Stat label="Jackpot pool" value="$3.7M" highlight />
          <Stat label="Games" value="3,200+" />
        </div>
      </div>

      <div className={styles.cardStack} aria-hidden>
        <div className={`${styles.card} ${styles.card1}`}>
          <span className={styles.cardGlyph}>7</span>
        </div>
        <div className={`${styles.card} ${styles.card2}`}>
          <span className={styles.cardGlyph}>♦</span>
        </div>
        <div className={`${styles.card} ${styles.card3}`}>
          <span className={styles.cardGlyph}>♣</span>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={styles.stat}>
      <span className={`${styles.statValue} ${highlight ? styles.statHighlight : ''}`}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
