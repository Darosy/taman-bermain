import { useEffect, useMemo, useRef, useState } from 'react';
import { beep, playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

type Picture = { id: string; icon: string; name: string };
const STORIES: { title: string; steps: Picture[] }[] = [
  { title: 'Bunga tumbuh', steps: [{ id: 'seed', icon: '🫘', name: 'Benih' }, { id: 'sprout', icon: '🌱', name: 'Tunas' }, { id: 'flower', icon: '🌻', name: 'Bunga' }] },
  { title: 'Cuci tangan', steps: [{ id: 'hands', icon: '🖐️', name: 'Tangan kotor' }, { id: 'soap', icon: '🧼', name: 'Pakai sabun' }, { id: 'clean', icon: '✨', name: 'Tangan bersih' }] },
  { title: 'Kupu-kupu', steps: [{ id: 'caterpillar', icon: '🐛', name: 'Ulat' }, { id: 'cocoon', icon: '🧵', name: 'Kepompong' }, { id: 'butterfly', icon: '🦋', name: 'Kupu-kupu' }] },
  { title: 'Hujan turun', steps: [{ id: 'cloud', icon: '☁️', name: 'Awan' }, { id: 'rain', icon: '🌧️', name: 'Hujan' }, { id: 'rainbow', icon: '🌈', name: 'Pelangi' }] },
];
const DISTRACTORS: Picture[] = [{ id: 'car', icon: '🚗', name: 'Mobil' }, { id: 'apple', icon: '🍎', name: 'Apel' }, { id: 'ball', icon: '⚽', name: 'Bola' }, { id: 'fish', icon: '🐟', name: 'Ikan' }];
export default function UrutkanCerita({ level, vol, onWin }: GameProps) {
  const stories = useMemo(() => shuf(STORIES), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const story = stories[index];
  const options = useMemo(() => shuf([...story.steps, ...shuf(DISTRACTORS).slice(0, level < 3 ? 0 : level < 5 ? 1 : 2)]), [story, level]);
  useEffect(() => { say(vol, `Urutkan cerita ${story.title.toLowerCase()}. Pilih gambar pertama.`); }, [story, vol]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const choose = (picture: Picture) => {
    if (solved || selected.includes(picture.id)) return;
    if (picture.id !== story.steps[selected.length].id) {
      clearTimeout(wrongTimer.current); setWrong(picture.id); playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450); return;
    }
    clearTimeout(wrongTimer.current); setWrong(null);
    const next = [...selected, picture.id]; setSelected(next);
    if (next.length === story.steps.length) {
      setSolved(true); playAnswer(true, vol);
      timer.current = setTimeout(() => {
        if (index + 1 === stories.length) onWin();
        else { setIndex(index + 1); setSelected([]); setSolved(false); }
      }, 1300);
    } else beep(vol, 560 + next.length * 100, .09);
  };
  return <div className="phase-game story-game">
    <div className="phase-game__top"><span className="phase-game__tag">📖 URUTKAN CERITA</span><span>{index + 1}/{stories.length} ⭐</span></div>
    <h2>{story.title}</h2><button type="button" className="story-speaker" aria-label="Dengarkan petunjuk lagi" onClick={() => say(vol, `Urutkan cerita ${story.title.toLowerCase()}. Pilih gambar pertama.`)}>🔊</button>
    <div className="story-slots" aria-label="Urutan gambar">{story.steps.map((_, i) => <div key={i}><span>{selected[i] ? story.steps[i].icon : '?'}</span><small>{i + 1}</small></div>)}</div>
    <div className="story-options" role="group" aria-label="Gambar pilihan">{options.map((picture) => <button key={picture.id} type="button" disabled={selected.includes(picture.id) || solved}
      className={wrong === picture.id ? 'shake' : ''} aria-label={picture.name} onClick={() => choose(picture)}><span aria-hidden="true">{picture.icon}</span><small>{picture.name}</small></button>)}</div>
    <p className="phase-game__feedback" role="status">{solved ? 'Ceritanya lengkap! Hebat!' : wrong ? 'Coba gambar yang lain, ya!' : selected.length === 0 ? 'Pilih gambar yang pertama.' : 'Sekarang pilih gambar berikutnya.'}</p>
  </div>;
}
