import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import type { GameProps } from '@/lib/store';

const ART = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#bdeafa"/><circle cx="465" cy="95" r="68" fill="#ffd45b"/><path d="M0 300Q150 160 300 300T600 300V400H0Z" fill="#8bd29b"/><path d="M0 340Q150 245 300 350T600 335V400H0Z" fill="#48bd7e"/><path d="M208 300V180" stroke="#805737" stroke-width="22"/><circle cx="205" cy="150" r="72" fill="#38a96e"/><circle cx="465" cy="83" r="6" fill="#644b36"/><circle cx="493" cy="83" r="6" fill="#644b36"/><path d="M466 107q13 15 27 0" fill="none" stroke="#644b36" stroke-width="5" stroke-linecap="round"/><path d="M42 354q100-54 190 0M340 370q80-46 170 0" fill="none" stroke="#f9ecad" stroke-width="16"/></svg>')}`;
function scramble(size: number) {
  const pieces = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
  if (pieces.every((value, index) => value === index)) [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
  return pieces;
}

export default function Puzzle({ level, vol, onWin }: GameProps) {
  const [cols, rows] = level === 1 ? [3, 1] : level === 2 ? [2, 2] : [3, 2];
  const size = cols * rows;
  const initial = useMemo(() => scramble(size), [size]);
  const [pieces, setPieces] = useState(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { say(vol, 'Ketuk dua keping untuk menukar tempatnya'); return () => { clearTimeout(timer.current); stopAnswer(); }; }, [vol]);

  const choose = (index: number) => {
    if (done) return;
    if (selected === null) { setSelected(index); return; }
    if (selected === index) { setSelected(null); return; }
    const next = [...pieces]; [next[selected], next[index]] = [next[index], next[selected]];
    setPieces(next); setSelected(null);
    if (next.every((value, position) => value === position)) {
      setDone(true); playAnswer(true, vol); timer.current = setTimeout(onWin, 1300);
    }
  };

  return <div className="phase-game puzzle-game">
    <div className="phase-game__top"><span className="phase-game__tag">🧩 TAMAN PUZZLE</span><span>{size} keping</span></div>
    <h2>Susun gambarnya!</h2><p>Ketuk dua keping untuk menukar tempat.</p>
    <div className="puzzle-board" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="group" aria-label="Keping puzzle">
      {pieces.map((piece, index) => <button key={index} type="button" onClick={() => choose(index)} disabled={done}
        className={'puzzle-piece' + (selected === index ? ' is-selected' : '')}
        aria-label={`Keping ${index + 1}${selected === index ? ', dipilih' : ''}`}
        style={{ aspectRatio: `${3 / cols} / ${2 / rows}`, backgroundImage: `url("${ART}")`, backgroundSize: `${cols * 100}% ${rows * 100}%`, backgroundPosition: `${cols === 1 ? 0 : (piece % cols) * 100 / (cols - 1)}% ${rows === 1 ? 0 : Math.floor(piece / cols) * 100 / (rows - 1)}%` }} />)}
    </div>
    <p className="phase-game__feedback" role="status">{done ? 'Gambar lengkap! Hebat!' : selected === null ? 'Pilih satu keping.' : 'Sekarang pilih keping lain.'}</p>
  </div>;
}
