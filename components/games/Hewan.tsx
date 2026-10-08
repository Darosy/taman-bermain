'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, playClip, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const ANIMALS = [
  { emoji: '🐱', name: 'Kucing', file: 'cat.mp3' },
  { emoji: '🐶', name: 'Anjing', file: 'dog.mp3' },
  { emoji: '🐮', name: 'Sapi', file: 'cow.mp3' },
  { emoji: '🐑', name: 'Domba', file: 'sheep.mp3' },
  { emoji: '🐸', name: 'Katak', file: 'frog.mp3' },
  { emoji: '🐔', name: 'Ayam', file: 'chicken.mp3' },
];

export default function Hewan({ level, vol, onWin }: GameProps) {
  const [order] = useState(() => shuf(ANIMALS.map((_, i) => i)));
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [last, setLast] = useState(-1);
  const clip = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const locked = useRef(false);
  const target = order[round];
  const options = useMemo(() => shuf([target, ...shuf(ANIMALS.map((_, i) => i).filter((i) => i !== target)).slice(0, Math.min(ANIMALS.length - 1, 1 + level))]), [target, level]);

  useEffect(() => () => { clearTimeout(timer.current); clip.current?.pause(); stopAnswer(); }, []);

  const listen = () => {
    if (locked.current) return;
    stopAnswer();
    clip.current?.pause();
    clip.current = playClip(`/sounds/${ANIMALS[target].file}`, vol);
    setHeard(true);
  };
  const choose = (k: number) => {
    if (!heard || locked.current) return;
    setLast(k);
    if (k !== target) { clip.current?.pause(); playAnswer(false, vol); setFeedback('Coba lagi. Dengarkan suaranya sekali lagi.'); return; }
    locked.current = true;
    clip.current?.pause();
    playAnswer(true, vol);
    setFeedback(`Benar! ${ANIMALS[k].name}.`);
    timer.current = setTimeout(() => {
      if (round + 1 === order.length) onWin();
      else { setRound(round + 1); setHeard(false); setFeedback(''); locked.current = false; }
    }, 1500);
  };

  return <>
    <p className="prompt">Suara {round + 1} dari {order.length}. Hewan apa ini?</p>
    <button className="b2" onClick={listen} disabled={locked.current} aria-label="Dengarkan atau ulangi suara hewan">🔊 Dengarkan suara</button>
    {vol === 0 && heard && <p className="prompt">Cari {ANIMALS[target].name}</p>}
    <div className="animal-options">{options.map((k) => <button key={k} className={'big' + (last === k ? ' bounce' : '')} aria-label={ANIMALS[k].name} disabled={!heard || locked.current} onClick={() => choose(k)} onAnimationEnd={() => setLast((current) => current === k ? -1 : current)}>{ANIMALS[k].emoji}</button>)}</div>
    <p className="animal-feedback" role="status">{feedback || (heard ? 'Pilih hewan yang suaranya cocok.' : 'Ketuk tombol suara untuk mulai.')}</p>
  </>;
}
