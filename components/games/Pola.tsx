import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const SYMBOLS = ['🔴', '⭐', '🔷', '🍀', '🟣'];
const ROUNDS = 5;
export default function Pola({ level, vol, onWin }: GameProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const round = useMemo(() => {
    const length = Math.min(4, 2 + Math.floor((level - 1) / 2));
    const symbols = shuf(SYMBOLS).slice(0, length);
    const start = Math.floor(Math.random() * length);
    const shown = Array.from({ length: length * 2 - 1 }, (_, i) => symbols[(start + i) % length]);
    return { shown, answer: symbols[(start + shown.length) % length], choices: shuf(symbols) };
  }, [index, level]);
  useEffect(() => { say(vol, 'Lihat polanya. Gambar apa selanjutnya?'); }, [index, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const choose = (symbol: string) => {
    if (correct) return;
    if (symbol !== round.answer) { clearTimeout(wrongTimer.current); setWrong(symbol); playAnswer(false, vol); wrongTimer.current = setTimeout(() => setWrong(null), 450); return; }
    clearTimeout(wrongTimer.current); setWrong(null); setCorrect(symbol); playAnswer(true, vol);
    timer.current = setTimeout(() => { if (index + 1 === ROUNDS) onWin(); else { setIndex(index + 1); setCorrect(null); } }, 1200);
  };
  return <div className="phase-game sequence-game">
    <div className="phase-game__top"><span className="phase-game__tag">✨ TAMAN POLA</span><span>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>Apa gambar selanjutnya?</h2><p>Lihat urutannya, lalu pilih gambar.</p>
    <div className="sequence-row" aria-label="Urutan gambar">{round.shown.map((symbol, i) => <span key={i} aria-label={symbol}>{symbol}</span>)}<span className="sequence-empty">?</span></div>
    <div className="sequence-choices" role="group" aria-label="Pilihan gambar">{round.choices.map((symbol) => <button key={symbol} type="button" disabled={correct !== null} className={(wrong === symbol ? 'shake' : '') + (correct === symbol ? ' is-correct' : '')} aria-label={`Pilih ${symbol}`} onClick={() => choose(symbol)}>{symbol}</button>)}</div>
    <p className="phase-game__feedback" role="status">{correct ? 'Pola lengkap! Hebat!' : wrong ? 'Coba gambar yang lain, ya!' : 'Ketuk gambar selanjutnya.'}</p>
  </div>;
}
