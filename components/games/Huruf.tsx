import { useMemo } from 'react';
import type { GameProps } from '@/lib/store';
import ChoiceGame, { type ChoiceItem } from './ChoiceGame';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export default function Huruf({ level, ...props }: GameProps) {
  const count = [5, 10, 16, 21, 26][Math.min(level, 5) - 1];
  const items = useMemo<ChoiceItem[]>(() => ALPHABET.slice(0, count).split('').map((letter) => ({
    id: letter, name: `Huruf ${letter}`, visual: <span className="letter-choice">{letter}</span>,
  })), [count]);
  return <ChoiceGame {...props} level={level} title="🔤 TAMAN HURUF" instruction="Cari huruf yang sama" items={items}
    optionCount={Math.min(count, 2 + level)} prompt={(item) => `Cari huruf ${item.id}`} />;
}
