'use client';
import { useEffect, useRef, useState } from 'react';
export default function Gate({ onOk, onBack }: { onOk: () => void; onBack: () => void }) {
  const [on, setOn] = useState(false); const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const end = () => { setOn(false); clearTimeout(t.current); };
  return <div className="c"><p className="t">Khusus orang tua</p>
    <button className={'hold' + (on ? ' on' : '')} onPointerDown={() => { setOn(true); t.current = setTimeout(onOk, 3000); }} onPointerUp={end} onPointerLeave={end} onPointerCancel={end}><span />Tahan 3 detik</button>
    <button className="b2" onClick={onBack}>Kembali</button></div>;
}
