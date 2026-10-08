'use client';
import { useEffect, useRef, useState } from 'react';
import { balloonPop } from '@/lib/audio';
import type { GameProps } from '@/lib/store';
export default function Balon({ level, vol, onWin }: GameProps) {
  const [bs, setBs] = useState<{ id: number; x: number; hue: number }[]>([]);
  const n = useRef(0), id = useRef(0), popped = useRef(new Set<number>()), winTimer = useRef<ReturnType<typeof setTimeout>>(undefined), need = 5 + level;
  useEffect(() => { const t = setInterval(() => { if (n.current < need) setBs((b) => [...b, { id: id.current++, x: Math.random() * 80, hue: (Math.random() * 360) | 0 }]); }, Math.max(500, 1000 - level * 100)); return () => { clearInterval(t); clearTimeout(winTimer.current); }; }, [level, need]);
  const pop = (i: number) => {
    if (popped.current.has(i) || n.current >= need) return;
    popped.current.add(i);
    balloonPop(vol);
    setBs((b) => b.filter((x) => x.id !== i));
    if (++n.current === need) winTimer.current = setTimeout(onWin, 180);
  };
  return <>{bs.map((b) => <button key={b.id} className="bl" aria-label="Pecahkan balon" style={{ left: b.x + '%', filter: `hue-rotate(${b.hue}deg)`, animationDuration: Math.max(3, 7 - level * 0.7) + 's' }} onClick={() => pop(b.id)} onAnimationEnd={() => setBs((l) => l.filter((x) => x.id !== b.id))}>🎈</button>)}</>;
}
