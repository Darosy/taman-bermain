import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

export type ChoiceItem = { id: string; name: string; visual: ReactNode };
type Props = GameProps & {
  title: string;
  instruction: string;
  items: ChoiceItem[];
  optionCount: number;
  prompt: (item: ChoiceItem) => string;
  target?: (item: ChoiceItem) => ReactNode;
};
const ROUNDS = 5;

export default function ChoiceGame({ title, instruction, items, optionCount, prompt, target, vol, onWin }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const nextTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const round = useMemo(() => {
    const answer = items[Math.floor(Math.random() * items.length)];
    const choices = shuf([answer, ...shuf(items.filter((item) => item.id !== answer.id)).slice(0, Math.min(optionCount, items.length) - 1)]);
    return { answer, choices };
  }, [index, items, optionCount]);
  const spokenPrompt = prompt(round.answer);

  useEffect(() => { stopAnswer(); say(vol, spokenPrompt); }, [spokenPrompt, vol]);
  useEffect(() => () => { clearTimeout(nextTimer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);

  const choose = (item: ChoiceItem) => {
    if (nextTimer.current) return;
    if (item.id === round.answer.id) {
      clearTimeout(wrongTimer.current);
      setWrong(null);
      setCorrect(item.id);
      setFeedback('Hebat! Jawabanmu benar!');
      playAnswer(true, vol);
      nextTimer.current = setTimeout(() => {
        nextTimer.current = undefined;
        if (index + 1 === ROUNDS) onWin();
        else { setIndex(index + 1); setCorrect(null); setFeedback(''); }
      }, 1200);
    } else {
      clearTimeout(wrongTimer.current);
      setWrong(item.id);
      setFeedback('Coba lagi, ya!');
      playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 500);
    }
  };

  return <div className="phase-game choice-game">
    <div className="phase-game__top"><span className="phase-game__tag">{title}</span><span aria-label={`Putaran ${index + 1} dari ${ROUNDS}`}>{index + 1}/{ROUNDS} ⭐</span></div>
    <h2>{instruction}</h2>
    <div className="choice-game__target" aria-label={round.answer.name}>{target ? target(round.answer) : round.answer.visual}</div>
    <div className="choice-game__options" role="group" aria-label="Pilihan jawaban">
      {round.choices.map((item) => <button key={item.id} type="button" disabled={correct !== null}
        className={'choice-game__option' + (correct === item.id ? ' is-correct' : '') + (wrong === item.id ? ' shake' : '')}
        aria-label={`Pilih ${item.name}`} onClick={() => choose(item)}>{item.visual}</button>)}
    </div>
    <p className="phase-game__feedback" role="status">{feedback || 'Ketuk jawabanmu!'}</p>
  </div>;
}
