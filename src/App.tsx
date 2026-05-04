import { useCallback, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { SidebarKey } from './components/layout/Sidebar';
import { Lobby } from './components/lobby/Lobby';
import { SlotMachine } from './components/slot/SlotMachine';
import type { GameMeta } from './types';

const STARTING_BALANCE = 5000;

export default function App() {
  const [balance, setBalance] = useState<number>(STARTING_BALANCE);
  const [activeKey, setActiveKey] = useState<SidebarKey>('home');
  const [search, setSearch] = useState('');
  const [openGame, setOpenGame] = useState<GameMeta | null>(null);

  const handleSelect = useCallback((key: SidebarKey) => {
    setActiveKey(key);
    setOpenGame(null);
    setSearch('');
  }, []);

  const handlePlay = useCallback((game: GameMeta) => {
    setOpenGame(game);
  }, []);

  const handleDeposit = useCallback(() => {
    setBalance((b) => b + 1000);
  }, []);

  return (
    <AppLayout
      balance={balance}
      activeKey={activeKey}
      onSelect={handleSelect}
      onDeposit={handleDeposit}
      search={search}
      onSearchChange={setSearch}
    >
      {openGame ? (
        <SlotMachine
          game={openGame}
          balance={balance}
          onBalanceChange={setBalance}
          onExit={() => setOpenGame(null)}
        />
      ) : (
        <Lobby filter={activeKey} search={search} onPlay={handlePlay} />
      )}
    </AppLayout>
  );
}
