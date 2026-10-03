'use client';
import { useEffect, useRef, useState } from 'react';
import { beep } from '@/lib/audio';
import type { GameProps } from '@/lib/store';
export default function Balon({ level, vol, onWin }: GameProps) {
  const [bs, setBs] = useState<{ id: number; x: number; hue: number }[]>([]); const n = useRef(0), id = useRef(0), need = 5 + level;
  useEffect(() => { const t = setInterval(() => setBs((b) => [...b, { id: id.current++, x: Math.random() * 80, hue: (Math.random() * 360) | 0 }]), Math.max(500, 1000 - level * 100)); return () => clearInterval(t); }, [level]);
  const pop = (i: number) => { beep(vol, 450 + n.current * 60); setBs((b) => b.filter((x) => x.id !== i)); if (++n.current === need) onWin(); };
  return <>{bs.map((b) => <button key={b.id} className="bl" aria-label="Balon" style={{ left: b.x + '%', filter: `hue-rotate(${b.hue}deg)`, animationDuration: Math.max(3, 7 - level * 0.7) + 's' }} onPointerDown={() => pop(b.id)} onAnimationEnd={() => setBs((l) => l.filter((x) => x.id !== b.id))}>🎈</button>)}</>;
}
