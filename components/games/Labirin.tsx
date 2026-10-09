import { useEffect, useRef, useState } from 'react';
import { beep, playAnswer, say, stopAnswer } from '@/lib/audio';
import type { GameProps } from '@/lib/store';

const MAZES = [
  [0, 1, 2, 4, 5, 6, 9, 10, 11, 14, 15],
  [0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
  [0, 1, 2, 5, 6, 8, 9, 10, 12, 13, 14, 15],
];
const ROUNDS = 3;
export default function Labirin({ level, vol, onWin }: GameProps) {
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const open = MAZES[(index + Math.min(level - 1, 2)) % MAZES.length];
  useEffect(() => { say(vol, 'Bantu roket menuju bintang. Ketuk kotak di sebelah roket.'); }, [index, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const move = (cell: number) => {
    if (done || cell === position) return;
    const adjacent = Math.abs(Math.floor(cell / 4) - Math.floor(position / 4)) + Math.abs(cell % 4 - position % 4) === 1;
    if (!adjacent || !open.includes(cell)) {
      clearTimeout(wrongTimer.current); setWrong(cell); playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450); return;
    }
    clearTimeout(wrongTimer.current); setWrong(null); setPosition(cell); setVisited((all) => all.includes(cell) ? all : [...all, cell]);
    if (cell === 15) {
      setDone(true); playAnswer(true, vol);
      timer.current = setTimeout(() => { if (index + 1 === ROUNDS) onWin(); else { setIndex(index + 1); setPosition(0); setVisited([0]); setDone(false); } }, 1300);
    } else beep(vol, 550, .07);
  };
  return <div className="phase-game maze-game">
    <div className="phase-game__top"><span className="phase-game__tag">🚀 TAMAN LABIRIN</span><span>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>Bantu roket ke bintang!</h2><p>Ketuk kotak di sebelah roket.</p>
    <div className="maze-board" role="group" aria-label="Labirin empat kali empat">{Array.from({ length: 16 }, (_, cell) => <button key={cell} type="button" disabled={done} onClick={() => move(cell)}
      className={'maze-cell' + (!open.includes(cell) ? ' is-wall' : '') + (visited.includes(cell) ? ' is-visited' : '') + (wrong === cell ? ' shake' : '')}
      aria-label={cell === position ? 'Roket, posisi sekarang' : cell === 15 ? 'Bintang tujuan' : open.includes(cell) ? 'Jalan' : 'Pohon penghalang'}>{cell === position ? '🚀' : cell === 15 ? '⭐' : !open.includes(cell) ? '🌳' : visited.includes(cell) ? '✨' : ''}</button>)}</div>
    <p className="phase-game__feedback" role="status">{done ? 'Roket sampai! Hebat!' : wrong !== null ? 'Cari jalan di sebelah roket, ya!' : 'Ikuti jalan menuju bintang.'}</p>
  </div>;
}
