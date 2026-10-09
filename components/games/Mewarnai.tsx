import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { playAnswer, say, stopAnswer } from '@/lib/audio';
import type { GameProps } from '@/lib/store';

const COLORS = [
  { name: 'merah', hex: '#FF6B6B' }, { name: 'kuning', hex: '#FFC93C' },
  { name: 'hijau', hex: '#3DBE7A' }, { name: 'biru', hex: '#4CA6FF' },
  { name: 'ungu', hex: '#9B7CE8' }, { name: 'hitam', hex: '#2B2A4C' },
];
type Stroke = { color: string; points: string };
export default function Mewarnai({ vol, onWin }: GameProps) {
  const [color, setColor] = useState(COLORS[0].hex);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [active, setActive] = useState<Stroke | null>(null);
  const [done, setDone] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const activeRef = useRef<Stroke | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { say(vol, 'Ayo menggambar. Pilih warna lalu gerakkan jari di kertas.'); return () => { clearTimeout(timer.current); stopAnswer(); }; }, [vol]);
  const point = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svg.current!.getBoundingClientRect();
    return `${Math.max(0, Math.min(320, (event.clientX - rect.left) * 320 / rect.width)).toFixed(1)},${Math.max(0, Math.min(320, (event.clientY - rect.top) * 320 / rect.height)).toFixed(1)}`;
  };
  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    activeRef.current = { color, points: point(event) };
    setActive(activeRef.current);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return;
    const nextPoint = point(event);
    if (activeRef.current) { activeRef.current = { ...activeRef.current, points: `${activeRef.current.points} ${nextPoint}` }; setActive(activeRef.current); }
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const stroke = activeRef.current;
    if (stroke) setStrokes((all) => [...all, stroke]);
    activeRef.current = null;
    setActive(null);
  };
  const finish = () => { if (strokes.length < 3 || done) return; setDone(true); playAnswer(true, vol); timer.current = setTimeout(onWin, 1300); };
  const drawStroke = (stroke: Stroke, index: number) => {
    const points = stroke.points.split(' ');
    return points.length === 1 ? <circle key={index} cx={Number(points[0].split(',')[0])} cy={Number(points[0].split(',')[1])} r="6" fill={stroke.color} />
      : <polyline key={index} points={stroke.points} fill="none" stroke={stroke.color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />;
  };
  return <div className="phase-game drawing-game">
    <div className="phase-game__top"><span className="phase-game__tag">🖍️ TAMAN MEWARNAI</span></div>
    <h2>Gambar sesukamu!</h2><p>Pilih warna, lalu gerakkan jari di kertas.</p>
    <svg ref={svg} className="drawing-canvas" viewBox="0 0 320 320" role="img" aria-label="Kertas gambar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <rect width="320" height="320" fill="#fffdf5" />
      {strokes.map(drawStroke)}{active && drawStroke(active, -1)}
    </svg>
    <div className="drawing-palette" role="group" aria-label="Pilih warna">
      {COLORS.map((item) => <button key={item.hex} type="button" className={color === item.hex ? 'is-selected' : ''} aria-label={`Warna ${item.name}`} aria-pressed={color === item.hex} style={{ backgroundColor: item.hex }} onClick={() => setColor(item.hex)} />)}
    </div>
    <div className="drawing-actions"><button type="button" onClick={() => setStrokes((all) => all.slice(0, -1))} disabled={!strokes.length || done}>↶ Ulangi</button><button type="button" onClick={() => setStrokes([])} disabled={!strokes.length || done}>🗑️ Hapus</button><button type="button" className="drawing-finish" onClick={finish} disabled={strokes.length < 3 || done}>Selesai ⭐</button></div>
    <p className="phase-game__feedback" role="status">{done ? 'Gambarmu hebat!' : strokes.length < 3 ? `Buat ${3 - strokes.length} garis lagi, yuk!` : 'Sudah siap? Ketuk Selesai!'}</p>
  </div>;
}
