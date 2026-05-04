import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { BetInput } from '../shared/BetInput';
import { buildShoe, type CardData } from '../shared/cards';
import { PlayingCard } from '../shared/PlayingCard';
import styles from './BlackjackGame.module.css';

interface BlackjackGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

type Phase = 'betting' | 'player' | 'dealer' | 'result';

interface HandValue {
  total: number;
  soft: boolean;
  busted: boolean;
  blackjack: boolean;
}

function rankValue(rank: CardData['rank']): number {
  if (rank === 'A') return 11;
  if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
  return parseInt(rank, 10);
}

function evalHand(cards: CardData[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += rankValue(c.rank);
    if (c.rank === 'A') aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return {
    total,
    soft: aces > 0 && total <= 21,
    busted: total > 21,
    blackjack: cards.length === 2 && total === 21,
  };
}

type Outcome =
  | 'player-blackjack'
  | 'player-win'
  | 'dealer-win'
  | 'push'
  | 'player-bust'
  | 'dealer-bust';

function settleOutcome(player: HandValue, dealer: HandValue): Outcome {
  if (player.busted) return 'player-bust';
  if (dealer.busted) return 'dealer-bust';
  if (player.blackjack && !dealer.blackjack) return 'player-blackjack';
  if (dealer.blackjack && !player.blackjack) return 'dealer-win';
  if (player.total > dealer.total) return 'player-win';
  if (player.total < dealer.total) return 'dealer-win';
  return 'push';
}

function payoutMultiplier(outcome: Outcome): number {
  switch (outcome) {
    case 'player-blackjack':
      return 2.5;
    case 'player-win':
    case 'dealer-bust':
      return 2;
    case 'push':
      return 1;
    default:
      return 0;
  }
}

const OUTCOME_LABEL: Record<Outcome, string> = {
  'player-blackjack': 'Blackjack!',
  'player-win': 'You win',
  'dealer-bust': 'Dealer busts',
  push: 'Push',
  'dealer-win': 'Dealer wins',
  'player-bust': 'Bust',
};

export function BlackjackGame({
  game,
  balance,
  onBalanceChange,
  onExit,
}: BlackjackGameProps) {
  const [stake, setStake] = useState(10);
  const [activeStake, setActiveStake] = useState(0);
  const [phase, setPhase] = useState<Phase>('betting');
  const [player, setPlayer] = useState<CardData[]>([]);
  const [dealer, setDealer] = useState<CardData[]>([]);
  const [hideHole, setHideHole] = useState(true);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [history, setHistory] = useState<Outcome[]>([]);
  const dealerTimerRef = useRef<number | null>(null);
  const shoeRef = useRef<CardData[]>(buildShoe(6));
  const activeStakeRef = useRef(0);

  useEffect(() => () => {
    if (dealerTimerRef.current) window.clearTimeout(dealerTimerRef.current);
  }, []);

  const playerVal = useMemo(() => evalHand(player), [player]);
  const dealerVal = useMemo(() => evalHand(dealer), [dealer]);

  const draw = useCallback((n: number): CardData[] => {
    if (shoeRef.current.length < n + 4) {
      shoeRef.current = buildShoe(6);
    }
    const out = shoeRef.current.slice(0, n);
    shoeRef.current = shoeRef.current.slice(n);
    return out;
  }, []);

  const finishRound = useCallback(
    (out: Outcome, finalDealer: CardData[]) => {
      setHideHole(false);
      setDealer(finalDealer);
      setOutcome(out);
      setPhase('result');
      setHistory((h) => [out, ...h].slice(0, 24));
      const mult = payoutMultiplier(out);
      if (mult > 0) onBalanceChange((b) => b + activeStakeRef.current * mult);
    },
    [onBalanceChange],
  );

  const playDealer = useCallback(
    (finalPlayer: CardData[], startingDealer: CardData[]) => {
      setHideHole(false);
      const playerEval = evalHand(finalPlayer);
      const tickStep = (current: CardData[]) => {
        setDealer(current);
        const ev = evalHand(current);
        const mustHit = ev.total < 17 || (ev.total === 17 && ev.soft);
        if (!mustHit) {
          const out = settleOutcome(playerEval, ev);
          dealerTimerRef.current = window.setTimeout(
            () => finishRound(out, current),
            350,
          );
          return;
        }
        const [next] = draw(1);
        dealerTimerRef.current = window.setTimeout(
          () => tickStep([...current, next]),
          550,
        );
      };
      dealerTimerRef.current = window.setTimeout(() => {
        tickStep(startingDealer);
      }, 400);
    },
    [draw, finishRound],
  );

  const deal = useCallback(() => {
    if (phase !== 'betting' && phase !== 'result') return;
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    setActiveStake(stake);
    activeStakeRef.current = stake;
    const cards = draw(4);
    const p = [cards[0], cards[2]];
    const d = [cards[1], cards[3]];
    setPlayer(p);
    setDealer(d);
    setHideHole(true);
    setOutcome(null);
    setPhase('player');

    const playerEval = evalHand(p);
    const dealerUp = d[0];
    const dealerUpVal = rankValue(dealerUp.rank);
    if (playerEval.blackjack) {
      if (dealerUpVal === 10 || dealerUp.rank === 'A') {
        const dealerEval = evalHand(d);
        const out: Outcome = dealerEval.blackjack ? 'push' : 'player-blackjack';
        dealerTimerRef.current = window.setTimeout(
          () => finishRound(out, d),
          400,
        );
      } else {
        dealerTimerRef.current = window.setTimeout(
          () => finishRound('player-blackjack', d),
          400,
        );
      }
    }
  }, [balance, draw, finishRound, onBalanceChange, phase, stake]);

  const hit = useCallback(() => {
    if (phase !== 'player') return;
    const [next] = draw(1);
    const newPlayer = [...player, next];
    setPlayer(newPlayer);
    const ev = evalHand(newPlayer);
    if (ev.busted) {
      setPhase('dealer');
      dealerTimerRef.current = window.setTimeout(
        () => finishRound('player-bust', dealer),
        450,
      );
    } else if (ev.total === 21) {
      setPhase('dealer');
      playDealer(newPlayer, dealer);
    }
  }, [dealer, draw, finishRound, phase, playDealer, player]);

  const stand = useCallback(() => {
    if (phase !== 'player') return;
    setPhase('dealer');
    playDealer(player, dealer);
  }, [dealer, phase, playDealer, player]);

  const doubleDown = useCallback(() => {
    if (phase !== 'player') return;
    if (player.length !== 2) return;
    if (balance < stake) return;
    onBalanceChange((b) => b - stake);
    setActiveStake((s) => s + stake);
    activeStakeRef.current += stake;
    const [next] = draw(1);
    const newPlayer = [...player, next];
    setPlayer(newPlayer);
    const ev = evalHand(newPlayer);
    setPhase('dealer');
    if (ev.busted) {
      dealerTimerRef.current = window.setTimeout(
        () => finishRound('player-bust', dealer),
        450,
      );
    } else {
      playDealer(newPlayer, dealer);
    }
  }, [balance, dealer, draw, finishRound, onBalanceChange, phase, playDealer, player, stake]);

  const newHand = useCallback(() => {
    setPlayer([]);
    setDealer([]);
    setOutcome(null);
    setHideHole(true);
    setPhase('betting');
    setActiveStake(0);
    activeStakeRef.current = 0;
  }, []);

  const lastNet = useMemo(() => {
    if (!outcome) return 0;
    const m = payoutMultiplier(outcome);
    return activeStake * (m - 1);
  }, [activeStake, outcome]);

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle="Dealer hits soft 17 · Blackjack pays 3:2"
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Recent</div>
          <div className={styles.history}>
            {history.length === 0 && <span className={styles.empty}>No hands yet</span>}
            {history.map((o, i) => (
              <span key={i} className={`${styles.histItem} ${styles[`o_${o}`]}`}>
                {o.replace('-', ' ')}
              </span>
            ))}
          </div>
          <div className={styles.rulesTitle} style={{ marginTop: 18 }}>Payouts</div>
          <ul className={styles.payList}>
            <li><span>Blackjack</span><span>3:2</span></li>
            <li><span>Win</span><span>1:1</span></li>
            <li><span>Push</span><span>Bet returned</span></li>
            <li><span>Dealer hits</span><span>Soft 17</span></li>
          </ul>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.felt}>
          <div className={styles.handZone}>
            <div className={styles.handLabel}>
              <span>Dealer</span>
              <span className={styles.handTotal}>
                {dealer.length === 0
                  ? '—'
                  : hideHole
                    ? rankValue(dealer[0].rank)
                    : dealerVal.total}
              </span>
            </div>
            <div className={styles.cardRow}>
              {dealer.length === 0 ? (
                <PlayingCard size="lg" faceDown />
              ) : (
                dealer.map((c, i) => (
                  <PlayingCard
                    key={i}
                    size="lg"
                    card={c}
                    faceDown={hideHole && i === 1}
                  />
                ))
              )}
            </div>
          </div>

          <div className={styles.outcomeBox}>
            {outcome && (
              <span className={`${styles.outcomeLabel} ${styles[`o_${outcome}`]}`}>
                {OUTCOME_LABEL[outcome]}
              </span>
            )}
            {phase === 'player' && !outcome && (
              <span className={styles.outcomeLabel}>Your move</span>
            )}
            {phase === 'betting' && (
              <span className={styles.outcomeLabel}>Place your bet</span>
            )}
            {phase === 'dealer' && !outcome && (
              <span className={styles.outcomeLabel}>Dealer playing…</span>
            )}
          </div>

          <div className={styles.handZone}>
            <div className={styles.handLabel}>
              <span>Player</span>
              <span className={styles.handTotal}>
                {player.length === 0 ? '—' : playerVal.total}
              </span>
            </div>
            <div className={styles.cardRow}>
              {player.length === 0 ? (
                <PlayingCard size="lg" faceDown />
              ) : (
                player.map((c, i) => <PlayingCard key={i} size="lg" card={c} />)
              )}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <BetInput
            label="Bet"
            value={stake}
            onChange={setStake}
            disabled={phase === 'player' || phase === 'dealer'}
            max={Math.max(1, Math.min(10000, balance))}
          />
          <div className={styles.actionRow}>
            {phase === 'betting' || phase === 'result' ? (
              <button
                type="button"
                className={styles.primary}
                onClick={phase === 'result' ? newHand : deal}
                disabled={phase === 'betting' && balance < stake}
              >
                {phase === 'result' ? 'New hand' : 'Deal'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={hit}
                  disabled={phase !== 'player'}
                >
                  Hit
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={stand}
                  disabled={phase !== 'player'}
                >
                  Stand
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={doubleDown}
                  disabled={
                    phase !== 'player' || player.length !== 2 || balance < stake
                  }
                >
                  Double
                </button>
              </>
            )}
          </div>
          <div className={styles.totals}>
            <div className={styles.totalsRow}>
              <span>Stake</span>
              <span>
                ${(activeStake > 0 ? activeStake : stake).toFixed(2)}
              </span>
            </div>
            <div className={styles.totalsRow}>
              <span>Last net</span>
              <span style={{ color: lastNet >= 0 ? '#9affb1' : '#ff7373' }}>
                {phase === 'result'
                  ? `${lastNet >= 0 ? '+' : ''}$${lastNet.toFixed(2)}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
