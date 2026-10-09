import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, playEverydaySound, say, stopAnswer, type EverydaySound } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const SOUNDS: { id: EverydaySound; name: string; icon: string }[] = [
  { id: 'bell', name: 'Lonceng', icon: '🔔' },
  { id: 'rain', name: 'Hujan', icon: '🌧️' },
  { id: 'clock', name: 'Jam', icon: '⏰' },
  { id: 'horn', name: 'Klakson mobil', icon: '🚗' },
];
const ROUNDS = 5;
export default function SuaraSekitar({ level, vol, onWin }: GameProps) {
  const order = useMemo(() => [...shuf(SOUNDS), SOUNDS[Math.floor(Math.random() * SOUNDS.length)]], []);
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState(false);
  const [correct, setCorrect] = useState<EverydaySound | null>(null);
  const [wrong, setWrong] = useState<EverydaySound | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stopSound = useRef<() => void>(() => {});
  const answer = order[index];
  const options = useMemo(() => shuf([answer, ...shuf(SOUNDS.filter((item) => item.id !== answer.id)).slice(0, Math.min(3, level))]), [answer, index, level]);
  useEffect(() => { say(vol, 'Dengarkan suara, lalu pilih gambar yang cocok.'); }, [index, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopSound.current(); stopAnswer(); }, []);
  const listen = () => {
    if (correct) return;
    stopAnswer(); stopSound.current(); stopSound.current = playEverydaySound(answer.id, vol); setHeard(true);
  };
  const choose = (item: typeof SOUNDS[number]) => {
    if (!heard || correct) return;
    stopSound.current();
    if (item.id !== answer.id) {
      clearTimeout(wrongTimer.current); setWrong(item.id); playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450); return;
    }
    clearTimeout(wrongTimer.current); setWrong(null); setCorrect(item.id); playAnswer(true, vol);
    timer.current = setTimeout(() => {
      if (index + 1 === ROUNDS) onWin();
      else { setIndex(index + 1); setHeard(false); setCorrect(null); }
    }, 1300);
  };
  return <div className="phase-game sound-game">
    <div className="phase-game__top"><span className="phase-game__tag">🔊 SUARA DI SEKITAR</span><span>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>Suara apa itu?</h2>
    <button type="button" className="sound-listen" disabled={correct !== null} onClick={listen} aria-label="Dengarkan atau ulangi suara">🔊<span>Dengarkan</span></button>
    {vol === 0 && heard && <p>Suara {answer.name}</p>}
    <div className="sound-options" role="group" aria-label="Pilihan gambar">{options.map((item) => <button key={item.id} type="button" disabled={!heard || correct !== null}
      className={(correct === item.id ? ' is-correct' : '') + (wrong === item.id ? ' shake' : '')} aria-label={item.name} onClick={() => choose(item)}><span aria-hidden="true">{item.icon}</span><small>{item.name}</small></button>)}</div>
    <p className="phase-game__feedback" role="status">{correct ? `Benar, suara ${answer.name}!` : wrong ? 'Dengarkan lagi, lalu coba ya!' : heard ? 'Pilih gambar yang cocok.' : 'Ketuk tombol suara untuk mulai.'}</p>
  </div>;
}
