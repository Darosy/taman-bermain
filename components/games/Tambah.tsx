import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const ROUNDS = 5;
export default function Tambah({ level, vol, onWin }: GameProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const round = useMemo(() => {
    const max = Math.min(10, 3 + (level - 1) * 2);
    const first = 1 + Math.floor(Math.random() * Math.min(5, max - 1));
    const second = 1 + Math.floor(Math.random() * Math.min(5, max - first));
    const answer = first + second;
    const other = shuf(Array.from({ length: max - 1 }, (_, i) => i + 2).filter((n) => n !== answer)).slice(0, Math.min(3, level + 1));
    return { first, second, answer, choices: shuf([answer, ...other]) };
  }, [index, level]);
  useEffect(() => { say(vol, `${round.first} tambah ${round.second}, berapa semuanya?`); }, [round, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const choose = (number: number) => {
    if (correct !== null) return;
    if (number !== round.answer) { clearTimeout(wrongTimer.current); setWrong(number); playAnswer(false, vol); wrongTimer.current = setTimeout(() => setWrong(null), 450); return; }
    clearTimeout(wrongTimer.current); setWrong(null); setCorrect(number); playAnswer(true, vol);
    timer.current = setTimeout(() => { if (index + 1 === ROUNDS) onWin(); else { setIndex(index + 1); setCorrect(null); } }, 1200);
  };
  return <div className="phase-game addition-game">
    <div className="phase-game__top"><span className="phase-game__tag">➕ TAMAN TAMBAH</span><span>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>Berapa semuanya?</h2>
    <div className="addition-scene" aria-label={`${round.first} tambah ${round.second}`}><div>{Array.from({ length: round.first }, (_, i) => <span key={i}>🍎</span>)}</div><strong>+</strong><div>{Array.from({ length: round.second }, (_, i) => <span key={i}>🍎</span>)}</div></div>
    <div className="addition-equation">{round.first} + {round.second} = ?</div>
    <div className="addition-choices" role="group" aria-label="Pilihan jumlah">{round.choices.map((number) => <button key={number} type="button" disabled={correct !== null} className={(wrong === number ? 'shake' : '') + (correct === number ? ' is-correct' : '')} onClick={() => choose(number)}>{number}</button>)}</div>
    <p className="phase-game__feedback" role="status">{correct !== null ? 'Betul! Hebat berhitung!' : wrong !== null ? 'Coba hitung lagi, ya!' : 'Hitung semua apelnya.'}</p>
  </div>;
}
