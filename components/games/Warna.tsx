'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const COLORS = [
  { name: 'Merah', hex: '#FF6574' },
  { name: 'Biru', hex: '#4B9FFF' },
  { name: 'Kuning', hex: '#FFD457' },
  { name: 'Hijau', hex: '#54C98A' },
];
const ROUNDS = 5;

export default function Warna({ level, vol, onWin }: GameProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const nextTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const round = useMemo(() => {
    const choices = shuf(COLORS).slice(0, Math.min(COLORS.length, 2 + level));
    return { target: choices[Math.floor(Math.random() * choices.length)], choices: shuf(choices) };
  }, [roundIndex, level]);

  useEffect(() => { stopAnswer(); say(vol, `Bola ${round.target.name.toLowerCase()}`); }, [round, vol]);
  useEffect(() => () => { clearTimeout(nextTimer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);

  const choose = (color: typeof COLORS[number]) => {
    if (nextTimer.current) return;
    if (color === round.target) {
      clearTimeout(wrongTimer.current);
      setWrong(null);
      setChosen(color.name);
      setFeedback(`Hebat! Itu warna ${color.name.toLowerCase()}!`);
      playAnswer(true, vol);
      nextTimer.current = setTimeout(() => {
        nextTimer.current = undefined;
        if (roundIndex + 1 === ROUNDS) onWin();
        else { setRoundIndex(roundIndex + 1); setChosen(null); setFeedback(''); }
      }, 1500);
    } else {
      clearTimeout(wrongTimer.current);
      setWrong(color.name);
      setFeedback('Belum tepat. Cari warna yang sama, ya!');
      playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450);
    }
  };

  return <div className="color-game">
    <div className="color-game__header">
      <span className="color-game__eyebrow">🎨 TAMAN WARNA</span>
      <div className="color-game__progress" role="progressbar" aria-label="Putaran selesai" aria-valuemin={0} aria-valuemax={ROUNDS} aria-valuenow={roundIndex}>
        {Array.from({ length: ROUNDS }, (_, i) => <span key={i} className={i < roundIndex ? 'is-filled' : i === roundIndex ? 'is-current' : ''} aria-hidden="true">★</span>)}
      </div>
      <h2>Warna apa bolanya?</h2>
      <p>Ketuk lingkaran dengan warna yang sama.</p>
    </div>
    <div className="color-game__scene">
      <span className="color-game__sparkle color-game__sparkle--left" aria-hidden="true">✦</span>
      <span className="color-game__sparkle color-game__sparkle--right" aria-hidden="true">✦</span>
      <div className={'color-game__ball' + (chosen ? ' is-happy' : '')} style={{ backgroundColor: round.target.hex }} role="img" aria-label={`Bola ${round.target.name}`}>
        <span className="color-game__smile" aria-hidden="true" />
      </div>
      <strong className="color-game__ball-name">Bola {round.target.name}</strong>
    </div>
    <div className="color-game__choices" role="group" aria-label="Pilihan warna">
      {round.choices.map((color) => <button key={color.name} type="button" className={'color-game__choice' + (wrong === color.name ? ' shake' : '') + (chosen === color.name ? ' is-correct' : '')}
        aria-label={`Pilih warna ${color.name}`} disabled={Boolean(chosen)} onClick={() => choose(color)}>
        <span className="color-game__swatch" style={{ backgroundColor: color.hex }} aria-hidden="true" />
        <span>{color.name}</span>
      </button>)}
    </div>
    <p className="color-game__feedback" role="status">{feedback || 'Ayo, pilih warnanya!'}</p>
  </div>;
}
