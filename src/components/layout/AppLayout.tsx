import type { ReactNode } from 'react';
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
  return (
    <div className={styles.root}>
      <TopNav
        balance={balance}
        onDeposit={onDeposit}
        search={search}
        onSearchChange={onSearchChange}
      />
      <Sidebar activeKey={activeKey} onSelect={onSelect} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
