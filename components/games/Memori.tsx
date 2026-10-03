'use client';
import { useEffect, useRef, useState } from 'react';
import { beep } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';
export default function Memori({ level, vol, onWin }: GameProps) {
  const [cards, setCards] = useState(() => { const E = ['🐱', '🐶', '🐸', '🐼'].slice(0, Math.min(4, 1 + level)); return shuf([...E, ...E]).map((e) => ({ e, up: false })); });
  const open = useRef<number | null>(null), lock = useRef(false), tm = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(tm.current), []);
  const flip = (i: number) => {
    if (lock.current || cards[i].up) return; beep(vol, 500);
    const up = cards.map((c, k) => (k === i ? { ...c, up: true } : c)); setCards(up);
    const o = open.current; if (o === null) { open.current = i; return; } open.current = null;
    if (up[o].e === up[i].e) { beep(vol, 900); if (up.every((c) => c.up)) tm.current = setTimeout(onWin, 600); }
    else { lock.current = true; tm.current = setTimeout(() => { setCards((c) => c.map((x, k) => (k === o || k === i ? { ...x, up: false } : x))); lock.current = false; }, 800); }
  };
  return <>{cards.map((c, i) => <button key={i} className={'card' + (c.up ? ' up' : '')} aria-label="Kartu" onPointerDown={() => flip(i)}>{c.up ? c.e : ''}</button>)}</>;
}
