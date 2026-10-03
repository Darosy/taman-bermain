'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { beep, say } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';
const C = [['Merah', '#ff4d4d'], ['Biru', '#3d8bff'], ['Kuning', '#ffd23c'], ['Hijau', '#38c172']];
export default function Warna({ level, vol, onWin }: GameProps) {
  const [r, setR] = useState(0); const [bad, setBad] = useState({ c: '', t: 0 }); const tm = useRef<ReturnType<typeof setTimeout>>(undefined);
  const round = useMemo(() => { const o = shuf(C).slice(0, Math.min(4, 2 + level)); return { t: o[Math.floor(Math.random() * o.length)], s: shuf(o) }; }, [r, level]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { say(vol, 'Bola ' + round.t[0].toLowerCase()); }, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(tm.current), []);
  const tap = (c: string[]) => {
    if (c === round.t) { beep(vol, 800); say(vol, c[0]); tm.current = setTimeout(() => (r + 1 >= 5 ? onWin() : setR(r + 1)), 900); }
    else { setBad((b) => ({ c: c[0], t: b.t + 1 })); beep(vol, 250); say(vol, 'Coba lagi'); }
  };
  return <><div className="ball" style={{ background: round.t[1] }} />{round.s.map((c) => <button key={c[0] + (bad.c === c[0] ? bad.t : 0)} className={'bowl' + (bad.c === c[0] ? ' shake' : '')} aria-label={c[0]} style={{ background: c[1] }} onPointerDown={() => tap(c)} />)}</>;
}
