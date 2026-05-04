import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../types';
import { SlotMachine } from '../slot/SlotMachine';
import { CrashGame } from './crash/CrashGame';
import { MinesGame } from './mines/MinesGame';
import { PlinkoGame } from './plinko/PlinkoGame';
import { RouletteGame } from './roulette/RouletteGame';
import { BlackjackGame } from './blackjack/BlackjackGame';
import { BaccaratGame } from './baccarat/BaccaratGame';
import { WheelGame } from './wheel/WheelGame';

interface GameRouterProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

export function GameRouter({ game, balance, onBalanceChange, onExit }: GameRouterProps) {
  const shared = { game, balance, onBalanceChange, onExit };
  switch (game.kind) {
    case 'slot':
      return <SlotMachine {...shared} />;
    case 'crash':
      return <CrashGame {...shared} />;
    case 'mines':
      return <MinesGame {...shared} />;
    case 'plinko':
      return <PlinkoGame {...shared} />;
    case 'roulette':
      return <RouletteGame {...shared} />;
    case 'blackjack':
      return <BlackjackGame {...shared} />;
    case 'baccarat':
      return <BaccaratGame {...shared} />;
    case 'wheel':
      return <WheelGame {...shared} />;
    default:
      return <SlotMachine {...shared} />;
  }
}
