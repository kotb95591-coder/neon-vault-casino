import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameMeta } from '../../../types';
import { GameShell } from '../GameShell';
import { buildShoe, type CardData } from '../shared/cards';
import { PlayingCard } from '../shared/PlayingCard';
import styles from './BaccaratGame.module.css';

interface BaccaratGameProps {
  game: GameMeta;
  balance: number;
  onBalanceChange: Dispatch<SetStateAction<number>>;
  onExit: () => void;
}

type BetSide = 'player' | 'banker' | 'tie';
type Phase = 'betting' | 'dealing' | 'result';

function cardValue(c: CardData): number {
  if (c.rank === 'A') return 1;
  if (c.rank === 'K' || c.rank === 'Q' || c.rank === 'J' || c.rank === '10') {
    return 0;
  }
  return parseInt(c.rank, 10);
}

function handTotal(cards: CardData[]): number {
  const sum = cards.reduce((s, c) => s + cardValue(c), 0);
  return sum % 10;
}

function dealRound(shoe: CardData[]): {
  player: CardData[];
  banker: CardData[];
  used: number;
} {
  let used = 0;
  const draw = () => shoe[used++];
  const player = [draw(), draw()];
  const banker = [draw(), draw()];
  const pTotal = handTotal(player);
  const bTotal = handTotal(banker);

  // Naturals: no third card.
  if (pTotal >= 8 || bTotal >= 8) {
    return { player, banker, used };
  }

  let playerThird: CardData | null = null;
  if (pTotal <= 5) {
    playerThird = draw();
    player.push(playerThird);
  }

  // Banker draw rules.
  let bankerDraws: boolean;
  if (!playerThird) {
    bankerDraws = bTotal <= 5;
  } else {
    const t = cardValue(playerThird);
    if (bTotal <= 2) bankerDraws = true;
    else if (bTotal === 3) bankerDraws = t !== 8;
    else if (bTotal === 4) bankerDraws = t >= 2 && t <= 7;
    else if (bTotal === 5) bankerDraws = t >= 4 && t <= 7;
    else if (bTotal === 6) bankerDraws = t === 6 || t === 7;
    else bankerDraws = false;
  }
  if (bankerDraws) banker.push(draw());

  return { player, banker, used };
}

export function BaccaratGame({ game, balance, onBalanceChange, onExit }: BaccaratGameProps) {
  const [chip, setChip] = useState(10);
  const [bets, setBets] = useState<Record<BetSide, number>>({
    player: 0,
    banker: 0,
    tie: 0,
  });
  const [phase, setPhase] = useState<Phase>('betting');
  const [player, setPlayer] = useState<CardData[]>([]);
  const [banker, setBanker] = useState<CardData[]>([]);
  const [revealStep, setRevealStep] = useState<number>(0);
  const [outcome, setOutcome] = useState<BetSide | null>(null);
  const [history, setHistory] = useState<BetSide[]>([]);
  const [lastNet, setLastNet] = useState(0);
  const shoeRef = useRef<CardData[]>(buildShoe(8));
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const totalStaked = bets.player + bets.banker + bets.tie;

  const placeBet = useCallback(
    (side: BetSide) => {
      if (phase !== 'betting') return;
      if (balance < chip) return;
      onBalanceChange((b) => b - chip);
      setBets((prev) => ({ ...prev, [side]: prev[side] + chip }));
    },
    [balance, chip, onBalanceChange, phase],
  );

  const clearBets = useCallback(() => {
    if (phase !== 'betting') return;
    onBalanceChange((b) => b + totalStaked);
    setBets({ player: 0, banker: 0, tie: 0 });
  }, [onBalanceChange, phase, totalStaked]);

  const deal = useCallback(() => {
    if (phase !== 'betting') return;
    if (totalStaked === 0) return;

    if (shoeRef.current.length < 16) {
      shoeRef.current = buildShoe(8);
    }
    const { player: p, banker: b, used } = dealRound(shoeRef.current);
    shoeRef.current = shoeRef.current.slice(used);

    setPlayer([]);
    setBanker([]);
    setRevealStep(0);
    setPhase('dealing');
    setOutcome(null);

    const totalSteps = p.length + b.length;
    let step = 0;
    const tick = () => {
      step += 1;
      if (step <= 2) setPlayer(p.slice(0, step));
      else if (step <= 4) setBanker(b.slice(0, step - 2));
      else if (step === 5 && p.length >= 3) setPlayer(p);
      else if (step === 6 && b.length >= 3) setBanker(b);
      setRevealStep(step);
      if (step < totalSteps) {
        timerRef.current = window.setTimeout(tick, 450);
      } else {
        // Determine outcome.
        const pT = handTotal(p);
        const bT = handTotal(b);
        const out: BetSide = pT > bT ? 'player' : bT > pT ? 'banker' : 'tie';
        let net = 0;
        if (out === 'player' && bets.player > 0) net += bets.player * 2;
        if (out === 'banker' && bets.banker > 0) net += bets.banker * 1.95; // 5% commission
        if (out === 'tie' && bets.tie > 0) net += bets.tie * 9;
        // Banker push on tie returns banker bet, player push on tie returns player bet.
        if (out === 'tie' && bets.player > 0) net += bets.player;
        if (out === 'tie' && bets.banker > 0) net += bets.banker;
        setOutcome(out);
        setHistory((h) => [out, ...h].slice(0, 24));
        setLastNet(net - totalStaked);
        if (net > 0) onBalanceChange((bal) => bal + net);
        setPhase('result');
      }
    };
    timerRef.current = window.setTimeout(tick, 250);
  }, [bets, onBalanceChange, phase, totalStaked]);

  const newRound = useCallback(() => {
    setPlayer([]);
    setBanker([]);
    setRevealStep(0);
    setBets({ player: 0, banker: 0, tie: 0 });
    setOutcome(null);
    setLastNet(0);
    setPhase('betting');
  }, []);

  const playerVal = useMemo(() => handTotal(player), [player]);
  const bankerVal = useMemo(() => handTotal(banker), [banker]);

  const sides: { side: BetSide; label: string; pay: string }[] = [
    { side: 'player', label: 'Player', pay: '1:1' },
    { side: 'tie', label: 'Tie', pay: '8:1' },
    { side: 'banker', label: 'Banker', pay: '0.95:1' },
  ];

  return (
    <GameShell
      game={game}
      balance={balance}
      subtitle="Punto Banco · 8 decks"
      onExit={onExit}
      aside={
        <div className={styles.rules}>
          <div className={styles.rulesTitle}>Recent</div>
          <div className={styles.history}>
            {history.length === 0 && <span className={styles.empty}>No rounds yet</span>}
            {history.map((o, i) => (
              <span key={i} className={`${styles.histDot} ${styles[`o_${o}`]}`}>
                {o[0].toUpperCase()}
              </span>
            ))}
          </div>
          <div className={styles.rulesTitle} style={{ marginTop: 18 }}>Payouts</div>
          <ul className={styles.payList}>
            <li><span>Player</span><span>1:1</span></li>
            <li><span>Banker</span><span>0.95:1</span></li>
            <li><span>Tie</span><span>8:1</span></li>
          </ul>
        </div>
      }
    >
      <div className={styles.frame}>
        <div className={styles.felt}>
          <div className={styles.handsRow}>
            <div className={styles.handZone}>
              <div className={`${styles.handLabel} ${styles.player}`}>
                <span>Player</span>
                <span className={styles.handTotal}>
                  {revealStep === 0 ? '—' : playerVal}
                </span>
              </div>
              <div className={styles.cardRow}>
                {player.length === 0 ? (
                  <>
                    <PlayingCard size="md" faceDown />
                    <PlayingCard size="md" faceDown />
                  </>
                ) : (
                  player.map((c, i) => <PlayingCard key={i} size="md" card={c} />)
                )}
              </div>
            </div>
            <div className={styles.vs}>VS</div>
            <div className={styles.handZone}>
              <div className={`${styles.handLabel} ${styles.banker}`}>
                <span>Banker</span>
                <span className={styles.handTotal}>
                  {revealStep <= 2 ? '—' : bankerVal}
                </span>
              </div>
              <div className={styles.cardRow}>
                {banker.length === 0 ? (
                  <>
                    <PlayingCard size="md" faceDown />
                    <PlayingCard size="md" faceDown />
                  </>
                ) : (
                  banker.map((c, i) => <PlayingCard key={i} size="md" card={c} />)
                )}
              </div>
            </div>
          </div>
          <div className={styles.outcomeBox}>
            {phase === 'betting' && (
              <span className={styles.outcomeLabel}>Place your bets</span>
            )}
            {phase === 'dealing' && !outcome && (
              <span className={styles.outcomeLabel}>Dealing…</span>
            )}
            {outcome && (
              <span className={`${styles.outcomeLabel} ${styles[`o_${outcome}`]}`}>
                {outcome.toUpperCase()} WINS · {outcome === 'player' ? playerVal : outcome === 'banker' ? bankerVal : `${playerVal} = ${bankerVal}`}
              </span>
            )}
          </div>
        </div>

        <div className={styles.betsRow}>
          {sides.map(({ side, label, pay }) => (
            <button
              key={side}
              type="button"
              className={`${styles.betBox} ${styles[`box_${side}`]}`}
              onClick={() => placeBet(side)}
              disabled={phase !== 'betting'}
            >
              <span className={styles.betBoxLabel}>{label}</span>
              <span className={styles.betBoxPay}>{pay}</span>
              {bets[side] > 0 && (
                <span className={styles.betChip}>${bets[side]}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.chipPicker}>
            <span className={styles.chipLabel}>Chip value</span>
            <div className={styles.chipRow}>
              {[1, 5, 10, 25, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.chipBtn} ${styles[`chip_${v}`]}`}
                  data-active={v === chip ? '' : undefined}
                  onClick={() => setChip(v)}
                  disabled={phase !== 'betting'}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.totals}>
            <div className={styles.totalsRow}>
              <span>On table</span>
              <span>${totalStaked.toFixed(2)}</span>
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
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={clearBets}
              disabled={phase !== 'betting' || totalStaked === 0}
            >
              Clear
            </button>
            {phase !== 'result' ? (
              <button
                type="button"
                className={styles.primary}
                onClick={deal}
                disabled={phase !== 'betting' || totalStaked === 0}
              >
                Deal
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={newRound}>
                New round
              </button>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
