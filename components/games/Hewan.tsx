'use client';
import { useEffect, useState } from 'react';
import { say } from '@/lib/audio';
import type { GameProps } from '@/lib/store';
const A = [['🐱', 'Kucing', 'Meong'], ['🐶', 'Anjing', 'Guk guk'], ['🐮', 'Sapi', 'Mooo'], ['🐑', 'Domba', 'Mbeek'], ['🐸', 'Katak', 'Kwek kwek'], ['🐔', 'Ayam', 'Kukuruyuk']];
export default function Hewan({ vol, onWin }: GameProps) {
  const [seen, setSeen] = useState<number[]>([]); const [last, setLast] = useState({ k: -1, t: 0 });
  useEffect(() => { if (seen.length === A.length) { const t = setTimeout(onWin, 1800); return () => clearTimeout(t); } }, [seen.length, onWin]);
  const tap = (k: number) => { say(vol, `${A[k][1]}. ${A[k][2]}!`); setLast((l) => ({ k, t: l.t + 1 })); setSeen((s) => (s.includes(k) ? s : [...s, k])); };
  return <>{A.map(([e, n], k) => <button key={k + '-' + (last.k === k ? last.t : 0)} className={'big' + (last.k === k ? ' bounce' : '')} aria-label={n} onPointerDown={() => tap(k)}>{e}</button>)}</>;
}
