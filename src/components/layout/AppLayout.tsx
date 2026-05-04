import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar, type SidebarKey } from './Sidebar';
import { TopNav } from './TopNav';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  balance: number;
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
  onDeposit: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  children: ReactNode;
}

export function AppLayout({
  balance,
  activeKey,
  onSelect,
  onDeposit,
  search,
  onSearchChange,
  children,
}: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when key changes (navigation completes).
  const handleSelect = (key: SidebarKey) => {
    onSelect(key);
    setDrawerOpen(false);
  };

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  return (
    <div className={styles.root}>
      <TopNav
        balance={balance}
        onDeposit={onDeposit}
        search={search}
        onSearchChange={onSearchChange}
        onMenuToggle={() => setDrawerOpen((v) => !v)}
        menuOpen={drawerOpen}
      />
      <Sidebar
        activeKey={activeKey}
        onSelect={handleSelect}
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
