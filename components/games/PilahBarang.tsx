import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const CATEGORIES = [
  { id: 'food', name: 'Makanan', icon: '🍽️' },
  { id: 'toy', name: 'Mainan', icon: '🧸' },
  { id: 'clothes', name: 'Pakaian', icon: '👕' },
];
const ITEMS = [
  { name: 'Apel', icon: '🍎', kind: 'food' }, { name: 'Pisang', icon: '🍌', kind: 'food' },
  { name: 'Roti', icon: '🍞', kind: 'food' }, { name: 'Wortel', icon: '🥕', kind: 'food' },
  { name: 'Bola', icon: '⚽', kind: 'toy' }, { name: 'Boneka', icon: '🪆', kind: 'toy' },
  { name: 'Mobil mainan', icon: '🚗', kind: 'toy' }, { name: 'Layangan', icon: '🪁', kind: 'toy' },
  { name: 'Baju', icon: '👚', kind: 'clothes' }, { name: 'Celana', icon: '👖', kind: 'clothes' },
  { name: 'Sepatu', icon: '👟', kind: 'clothes' }, { name: 'Topi', icon: '🧢', kind: 'clothes' },
];
const ROUNDS = 6;
export default function PilahBarang({ level, vol, onWin }: GameProps) {
  const categories = useMemo(() => CATEGORIES.slice(0, level < 3 ? 2 : 3), [level]);
  const rounds = useMemo(() => shuf(categories.flatMap((category) => shuf(ITEMS.filter((item) => item.kind === category.id)).slice(0, ROUNDS / categories.length))), [categories]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const item = rounds[index];
  useEffect(() => { say(vol, `${item.name} masuk ke keranjang mana?`); }, [item, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const choose = (kind: string) => {
    if (correct) return;
    if (kind !== item.kind) {
      clearTimeout(wrongTimer.current); setWrong(kind); playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450); return;
    }
    clearTimeout(wrongTimer.current); setWrong(null); setCorrect(kind); playAnswer(true, vol);
    timer.current = setTimeout(() => {
      if (index + 1 === ROUNDS) onWin();
      else { setIndex(index + 1); setCorrect(null); }
    }, 1100);
  };
  return <div className="phase-game sort-game">
    <div className="phase-game__top"><span className="phase-game__tag">🧺 PILAH BARANG</span><span>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>Masuk keranjang mana?</h2>
    <div className="sort-item" role="img" aria-label={item.name}><span>{item.icon}</span><strong>{item.name}</strong></div>
    <div className="sort-baskets" role="group" aria-label="Pilih keranjang">{categories.map((category) => <button key={category.id} type="button" disabled={correct !== null}
      className={(correct === category.id ? ' is-correct' : '') + (wrong === category.id ? ' shake' : '')}
      aria-label={`Keranjang ${category.name}`} onClick={() => choose(category.id)}><span aria-hidden="true">{category.icon}</span><small>{category.name}</small></button>)}</div>
    <p className="phase-game__feedback" role="status">{correct ? 'Cocok! Hebat memilah!' : wrong ? 'Coba keranjang yang lain, ya!' : 'Ketuk keranjang yang cocok.'}</p>
  </div>;
}
