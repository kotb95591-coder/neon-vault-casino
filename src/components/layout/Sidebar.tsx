import {
  CrashIcon,
  DiceIcon,
  FlameIcon,
  GiftIcon,
  HomeIcon,
  LiveIcon,
  SlotsIcon,
  StarIcon,
  TableIcon,
} from '../common/icons';
import styles from './Sidebar.module.css';

export type SidebarKey =
  | 'home'
  | 'slots'
  | 'live'
  | 'table'
  | 'crash'
  | 'instant'
  | 'hot'
  | 'new'
  | 'promotions';

interface NavItem {
  key: SidebarKey;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  badge?: string;
  count?: number;
}

const PRIMARY: NavItem[] = [
  { key: 'home', label: 'Lobby', Icon: HomeIcon },
  { key: 'slots', label: 'Slots', Icon: SlotsIcon, count: 9 },
  { key: 'live', label: 'Live Casino', Icon: LiveIcon, count: 3 },
  { key: 'table', label: 'Table Games', Icon: TableIcon, count: 2 },
  { key: 'crash', label: 'Crash', Icon: CrashIcon, count: 1 },
  { key: 'instant', label: 'Instant Win', Icon: DiceIcon, count: 2 },
];

const FEATURED: NavItem[] = [
  { key: 'hot', label: 'Hot Now', Icon: FlameIcon, badge: 'HOT' },
  { key: 'new', label: 'New Releases', Icon: StarIcon },
  { key: 'promotions', label: 'Promotions', Icon: GiftIcon, badge: '3' },
];

interface SidebarProps {
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
  drawerOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeKey, onSelect, drawerOpen, onClose }: SidebarProps) {
  return (
    <>
      {drawerOpen && (
        <div
          className={styles.scrim}
          onClick={onClose}
          role="presentation"
          aria-hidden
        />
      )}
      <aside
        className={`${styles.root} ${drawerOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!drawerOpen ? undefined : false}
      >
      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Casino</div>
        <ul className={styles.list}>
          {PRIMARY.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`${styles.item} ${activeKey === item.key ? styles.active : ''}`}
                onClick={() => onSelect(item.key)}
              >
                <item.Icon className={styles.icon} aria-hidden />
                <span className={styles.label}>{item.label}</span>
                {item.count != null && <span className={styles.count}>{item.count}</span>}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.sectionLabel}>Featured</div>
        <ul className={styles.list}>
          {FEATURED.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`${styles.item} ${activeKey === item.key ? styles.active : ''}`}
                onClick={() => onSelect(item.key)}
              >
                <item.Icon className={styles.icon} aria-hidden />
                <span className={styles.label}>{item.label}</span>
                {item.badge && (
                  <span className={`${styles.badge} ${item.key === 'hot' ? styles.badgeHot : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.vipBanner}>
        <div className={styles.vipGlow} aria-hidden />
        <div className={styles.vipTitle}>VIP Club</div>
        <div className={styles.vipText}>
          Unlock weekly cashback, personal manager and exclusive tournaments.
        </div>
        <button type="button" className={styles.vipBtn}>
          Learn more
        </button>
      </div>

      <div className={styles.footnote}>
        Visual demo only · No real money · 18+
      </div>
      </aside>
    </>
  );
}
