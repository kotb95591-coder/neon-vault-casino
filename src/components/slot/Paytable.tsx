import { SYMBOLS } from '../../data/slotConfig';
import type { SymbolDef } from '../../types';
import { SymbolGlyph } from './symbols';
import styles from './Paytable.module.css';

const ORDER: SymbolDef['id'][] = [
  'crown',
  'diamond',
  'seven',
  'wild',
  'scatter',
  'bar',
  'bell',
  'cherry',
  'ace',
  'king',
  'queen',
  'jack',
  'ten',
];

const TIER_LABEL: Record<SymbolDef['tier'], string> = {
  high: 'High pay',
  mid: 'Mid pay',
  low: 'Low pay',
  special: 'Special',
};

export function Paytable() {
  return (
    <div className={styles.root}>
      <header className={styles.head}>
        <div className={styles.title}>Paytable</div>
        <div className={styles.sub}>Multipliers based on stake per line</div>
      </header>

      <ul className={styles.list}>
        {ORDER.map((id) => {
          const def = SYMBOLS[id];
          return (
            <li key={id} className={`${styles.row} ${styles[`tier_${def.tier}`]}`}>
              <div className={styles.iconBox}>
                <SymbolGlyph id={id} className={styles.icon} />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{def.label}</div>
                <div className={styles.tier}>{TIER_LABEL[def.tier]}</div>
              </div>
              <div className={styles.payouts}>
                {def.payouts.map((p, i) => (
                  <div key={i} className={styles.payout}>
                    <span className={styles.count}>{i + 3}×</span>
                    <span className={styles.mult}>{p}×</span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <footer className={styles.footer}>
        Wild substitutes for any symbol except Scatter. Three or more Scatters
        anywhere pay scatter multiplier × total bet.
      </footer>
    </div>
  );
}
