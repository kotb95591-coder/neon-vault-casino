import { BellIcon, ChipIcon, LogoMark, PlusIcon, SearchIcon } from '../common/icons';
import styles from './TopNav.module.css';

interface TopNavProps {
  balance: number;
  onDeposit: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const formatBalance = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TopNav({ balance, onDeposit, search, onSearchChange }: TopNavProps) {
  return (
    <header className={styles.root}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <LogoMark className={styles.logo} aria-hidden />
          <div className={styles.brandText}>
            <span className={styles.brandName}>AURORA</span>
            <span className={styles.brandTag}>Premium Casino</span>
          </div>
        </div>

        <label className={styles.search}>
          <SearchIcon className={styles.searchIcon} aria-hidden />
          <input
            type="text"
            placeholder="Search games, providers, jackpots…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search games"
          />
          <kbd className={styles.kbd}>⌘ K</kbd>
        </label>
      </div>

      <div className={styles.right}>
        <div className={styles.balancePill}>
          <ChipIcon className={styles.balanceIcon} aria-hidden />
          <div className={styles.balanceCol}>
            <span className={styles.balanceLabel}>Balance</span>
            <span className={styles.balanceValue}>${formatBalance(balance)}</span>
          </div>
          <button
            type="button"
            className={styles.depositBtn}
            onClick={onDeposit}
            aria-label="Deposit"
          >
            <PlusIcon className={styles.depositIcon} aria-hidden />
            <span>Deposit</span>
          </button>
        </div>

        <button className={styles.iconBtn} aria-label="Notifications" type="button">
          <BellIcon />
          <span className={styles.dot} />
        </button>

        <button className={styles.profile} aria-label="Account" type="button">
          <span className={styles.avatar}>SK</span>
          <span className={styles.profileText}>
            <span className={styles.profileName}>suyikilo</span>
            <span className={styles.profileTier}>VIP · Diamond</span>
          </span>
        </button>
      </div>
    </header>
  );
}
