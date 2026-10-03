'use client';
import { useState } from 'react';
// Gerbang orang tua: soal jumlah sederhana, cukup ketuk (tanpa tekan lama).
const make = () => {
  const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7), r = a + b, o = new Set([r]);
  while (o.size < 4) o.add(Math.max(1, r + Math.floor(Math.random() * 9) - 4));
  return { a, b, r, o: [...o].sort(() => Math.random() - 0.5) };
};
export default function Gate({ onOk, onBack }: { onOk: () => void; onBack: () => void }) {
  const [q, setQ] = useState(make); const [bad, setBad] = useState(false);
  return <div className="c"><p className="t">Khusus orang tua</p>
    <p className="t">{q.a} + {q.b} = ?</p>
    <div className="row" style={{ justifyContent: 'center' }}>{q.o.map((n) => <button key={n} className="b2" style={{ fontSize: '2rem', minWidth: 88 }}
      onClick={() => (n === q.r ? onOk() : (setBad(true), setQ(make())))}>{n}</button>)}</div>
    {bad && <p className="note">Jawaban belum tepat, coba soal baru.</p>}
    <button className="b2" onClick={onBack}>Kembali</button></div>;
}
