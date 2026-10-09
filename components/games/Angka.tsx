import { useMemo } from 'react';
import type { GameProps } from '@/lib/store';
import ChoiceGame, { type ChoiceItem } from './ChoiceGame';

export default function Angka({ level, ...props }: GameProps) {
  const max = Math.min(10, 3 + (level - 1) * 2);
  const items = useMemo<ChoiceItem[]>(() => Array.from({ length: max }, (_, i) => ({
    id: String(i + 1), name: `Angka ${i + 1}`, visual: <span className="number-choice">{i + 1}</span>,
  })), [max]);
  return <ChoiceGame {...props} level={level} title="🔢 TAMAN ANGKA" instruction="Hitung bintangnya" items={items}
    optionCount={Math.min(max, 2 + level)} prompt={(item) => `Ada berapa bintang? Hitung lalu pilih angkanya.`}
    target={(item) => <div className="number-stars" aria-label={`${item.id} bintang`}>{Array.from({ length: Number(item.id) }, (_, i) => <span key={i} aria-hidden="true">⭐</span>)}</div>} />;
}
