import { useMemo } from 'react';
import type { GameProps } from '@/lib/store';
import ChoiceGame, { type ChoiceItem } from './ChoiceGame';

const SHAPES = [
  { id: 'circle', name: 'Lingkaran', color: '#FF6B6B', path: <circle cx="50" cy="50" r="35" /> },
  { id: 'square', name: 'Persegi', color: '#4CA6FF', path: <rect x="16" y="16" width="68" height="68" rx="6" /> },
  { id: 'triangle', name: 'Segitiga', color: '#FFC93C', path: <path d="M50 12 91 84H9Z" /> },
  { id: 'star', name: 'Bintang', color: '#9B7CE8', path: <path d="m50 7 11 30 32 1-25 20 9 31-27-18-27 18 9-31L7 38l32-1Z" /> },
  { id: 'heart', name: 'Hati', color: '#EF70A8', path: <path d="M50 87 14 52C-3 29 18 7 39 20l11 11 11-11C82 7 103 29 86 52Z" /> },
];

export default function Bentuk({ level, ...props }: GameProps) {
  const items = useMemo<ChoiceItem[]>(() => SHAPES.slice(0, Math.min(5, 2 + level)).map((shape) => ({
    id: shape.id, name: shape.name,
    visual: <svg className="shape-icon" viewBox="0 0 100 100" role="img" aria-label={shape.name} fill={shape.color}>{shape.path}</svg>,
  })), [level]);
  return <ChoiceGame {...props} level={level} title="🔺 TAMAN BENTUK" instruction="Cari bentuk yang sama" items={items}
    optionCount={Math.min(items.length, 2 + level)} prompt={(item) => `Cari bentuk ${item.name.toLowerCase()}`} />;
}
