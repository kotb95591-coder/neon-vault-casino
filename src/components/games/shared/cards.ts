export type Suit = 'spade' | 'heart' | 'diamond' | 'club';
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface CardData {
  rank: Rank;
  suit: Suit;
}

export const SUIT_GLYPH: Record<Suit, string> = {
  spade: '\u2660',
  heart: '\u2665',
  diamond: '\u2666',
  club: '\u2663',
};

export const isRed = (s: Suit) => s === 'heart' || s === 'diamond';

export function buildShoe(numDecks = 6): CardData[] {
  const ranks: Rank[] = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];
  const suits: Suit[] = ['spade', 'heart', 'diamond', 'club'];
  const shoe: CardData[] = [];
  for (let d = 0; d < numDecks; d += 1) {
    for (const r of ranks) {
      for (const s of suits) {
        shoe.push({ rank: r, suit: s });
      }
    }
  }
  // Fisher-Yates shuffle
  for (let i = shoe.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}
