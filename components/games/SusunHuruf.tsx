import { useEffect, useMemo, useRef, useState } from 'react';
import { beep, playAnswer, say, stopAnswer } from '@/lib/audio';
import { shuf, type GameProps } from '@/lib/store';

const WORDS = [
  [{ text: 'API', icon: '🔥' }, { text: 'IBU', icon: '👩' }, { text: 'TAS', icon: '🎒' }, { text: 'JAM', icon: '⏰' }],
  [{ text: 'BOLA', icon: '⚽' }, { text: 'BUKU', icon: '📚' }, { text: 'IKAN', icon: '🐟' }, { text: 'SAPI', icon: '🐄' }],
  [{ text: 'GAJAH', icon: '🐘' }, { text: 'RUMAH', icon: '🏠' }, { text: 'KAPAL', icon: '🚢' }, { text: 'KURSI', icon: '🪑' }],
  [{ text: 'PISANG', icon: '🍌' }, { text: 'KUCING', icon: '🐱' }, { text: 'KELAPA', icon: '🥥' }, { text: 'BEBEK', icon: '🦆' }],
  [{ text: 'PELANGI', icon: '🌈' }, { text: 'JERAPAH', icon: '🦒' }, { text: 'KELINCI', icon: '🐰' }, { text: 'SEMANGKA', icon: '🍉' }],
];
type Tile = { id: number; letter: string };
export default function SusunHuruf({ level, vol, onWin }: GameProps) {
  const rounds = useMemo(() => shuf(WORDS[Math.min(5, Math.max(1, level)) - 1]), [level]);
  const [index, setIndex] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const nextTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const word = rounds[index];
  const tiles = useMemo<Tile[]>(() => shuf(word.text.split('').map((letter, id) => ({ id, letter }))), [word]);
  useEffect(() => { say(vol, `Susun huruf menjadi ${word.text.toLowerCase()}`); }, [word, vol]);
  useEffect(() => () => { clearTimeout(nextTimer.current); clearTimeout(wrongTimer.current); stopAnswer(); }, []);
  const choose = (tile: Tile) => {
    if (solved || used.includes(tile.id)) return;
    if (tile.letter !== word.text[used.length]) {
      clearTimeout(wrongTimer.current); setWrong(tile.id); playAnswer(false, vol);
      wrongTimer.current = setTimeout(() => setWrong(null), 450); return;
    }
    setWrong(null); clearTimeout(wrongTimer.current);
    const next = [...used, tile.id]; setUsed(next);
    if (next.length === word.text.length) {
      setSolved(true); playAnswer(true, vol);
      nextTimer.current = setTimeout(() => {
        if (index + 1 === rounds.length) onWin();
        else { setIndex(index + 1); setUsed([]); setSolved(false); }
      }, 1300);
    } else beep(vol, 540 + next.length * 70, .09);
  };
  return <div className="phase-game word-game">
    <div className="phase-game__top"><span className="phase-game__tag">🔤 SUSUN HURUF</span><span>{index + 1}/{rounds.length} ⭐</span></div>
    <h2>Susun namanya!</h2><button type="button" className="word-speaker" aria-label="Dengarkan kata lagi" onClick={() => say(vol, word.text.toLowerCase())}>🔊</button>
    <div className="word-picture" role="img" aria-label={word.text}>{word.icon}</div>
    <div className="word-slots" aria-label="Huruf yang sudah disusun">{word.text.split('').map((_, i) => <span key={i}>{i < used.length ? tiles.find((tile) => tile.id === used[i])?.letter : ''}</span>)}</div>
    <div className="word-tiles" role="group" aria-label="Huruf pilihan">{tiles.map((tile) => <button key={tile.id} type="button" disabled={used.includes(tile.id) || solved} className={wrong === tile.id ? 'shake' : ''} aria-label={`Huruf ${tile.letter}`} onClick={() => choose(tile)}>{tile.letter}</button>)}</div>
    <p className="phase-game__feedback" role="status">{solved ? `${word.text} benar! Hebat!` : wrong !== null ? 'Coba huruf yang lain, ya!' : 'Ketuk huruf satu per satu.'}</p>
  </div>;
}
