'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { GAMES, loadProfiles, saveProfiles, minsOn, ymd, type GameProps, type Profile } from '@/lib/store';
import { beep, say } from '@/lib/audio';
import Gate from './Gate';
import Parent from './Parent';
import Balon from './games/Balon';
import Hewan from './games/Hewan';
import Warna from './games/Warna';
import Memori from './games/Memori';

const GAME_UI: Record<string, ComponentType<GameProps>> = { balon: Balon, hewan: Hewan, warna: Warna, memori: Memori };
type Scr = { s: 'pick' } | { s: 'hub' } | { s: 'game'; g: string } | { s: 'win'; g: string } | { s: 'rest' } | { s: 'gate'; add: boolean } | { s: 'parent'; i: number };

export default function App() {
  const [ps, setPs] = useState<Profile[]>([]); const [ci, setCi] = useState<number | null>(null);
  const [scr, setScr] = useState<Scr>({ s: 'pick' }); const [upd, setUpd] = useState(false); const t0 = useRef(0);
  const cur = ci !== null ? ps[ci] : null;
  const commit = (n: Profile[]) => { setPs(n); saveProfiles(n); return n; };
  const patch = (i: number, f: (p: Profile) => Profile) => commit(ps.map((p, k) => (k === i ? f(p) : p)));

  // Catat waktu bermain ke hari ini; mengembalikan daftar profil terbaru.
  const leave = () => {
    if (ci === null || !t0.current) return ps;
    const m = (Date.now() - t0.current) / 6e4; t0.current = 0;
    return commit(ps.map((p, k) => (k === ci ? { ...p, days: { ...p.days, [ymd()]: minsOn(p) + m } } : p)));
  };
  const leaveRef = useRef(leave); leaveRef.current = leave;

  useEffect(() => {
    loadProfiles().then(setPs);
    navigator.storage?.persist?.();
    const noMenu = (e: Event) => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault(); }; document.addEventListener('contextmenu', noMenu);
    const vis = () => { if (document.hidden) leaveRef.current(); }; document.addEventListener('visibilitychange', vis);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then((r) => {
      const chk = () => { if (r.waiting && navigator.serviceWorker.controller) setUpd(true); }; chk();
      r.addEventListener('updatefound', () => r.installing?.addEventListener('statechange', chk));
    });
    return () => { document.removeEventListener('visibilitychange', vis); document.removeEventListener('contextmenu', noMenu); };
  }, []);

  const hub = () => { if (cur && minsOn(cur) >= cur.limit) { say(cur.vol, 'Waktunya istirahat'); return setScr({ s: 'rest' }); } setScr({ s: 'hub' }); };
  const play = (g: string) => {
    const n = leave(); const p = ci !== null ? n[ci] : null;
    if (p && minsOn(p) >= p.limit) return setScr({ s: 'rest' });
    t0.current = Date.now(); setScr({ s: 'game', g });
  };
  const win = (g: string) => {
    if (ci === null) return; t0.current && leave();
    patch(ci, (p) => { const q = { ...(p.plays[g] ?? { n: 0, level: 1, streak: 0 }) }; q.n++; q.streak++; if (q.streak >= 2 && q.level < 5) { q.level++; q.streak = 0; } return { ...p, stars: p.stars + 1, plays: { ...p.plays, [g]: q } }; });
    const v = cur?.vol ?? 1; beep(v, 660); setTimeout(() => beep(v, 880), 150); setTimeout(() => beep(v, 1100), 300); say(v, 'Hebat!');
    setScr({ s: 'win', g });
  };
  const pick = () => { leave(); setCi(null); setScr({ s: 'pick' }); };

  let body;
  if (scr.s === 'pick') body = <>
    <div className="c"><p className="t">Siapa yang main?</p><div className="grid">
      {ps.map((p, i) => <button key={p.id} className="tile" onClick={() => { setCi(i); setScr({ s: 'hub' }); }}>{p.av}<small>{p.name}</small></button>)}
      <button className="tile" aria-label="Tambah profil" onClick={() => setScr({ s: 'gate', add: true })}>➕</button></div></div>
    <button className="gear" aria-label="Area orang tua" onClick={() => setScr({ s: 'gate', add: false })}>⚙</button></>;
  else if (scr.s === 'gate') body = <Gate onBack={pick} onOk={() => setScr({ s: 'parent', i: scr.add ? -1 : 0 })} />;
  else if (scr.s === 'parent') body = <Parent ps={ps} i={scr.i} upd={upd} onSel={(i) => setScr({ s: 'parent', i })} onPatch={patch}
    onAdd={(p) => { commit([...ps, p]); setScr({ s: 'parent', i: ps.length }); }} onDel={(i) => { commit(ps.filter((_, k) => k !== i)); setScr({ s: 'parent', i: 0 }); }}
    onDone={pick} onUpdate={() => navigator.serviceWorker.getRegistration().then((r) => { r?.waiting?.postMessage('skip'); location.reload(); })} />;
  else if (scr.s === 'rest') body = <div className="c"><div style={{ fontSize: '6rem' }}>😴</div><p className="t">Waktunya istirahat!</p><button className="b1" onClick={pick}>🏠</button></div>;
  else if (cur && scr.s === 'hub') {
    const age = new Date().getFullYear() - cur.year;
    const gs = Object.keys(GAMES).filter((g) => !cur.off.includes(g)).sort((a, b) => Math.abs(GAMES[a].age - age) - Math.abs(GAMES[b].age - age));
    body = <><div className="bar"><button className="back" aria-label="Ganti profil" onClick={pick}>{cur.av}</button><span>⭐ {cur.stars}</span></div>
      <div className="c" style={{ height: 'calc(100% - 92px)' }}><div className="grid">{gs.map((g) => <button key={g} className="tile" onClick={() => play(g)}>{GAMES[g].icon}<small>{GAMES[g].name}</small></button>)}</div></div></>;
  } else if (cur && scr.s === 'win') body = <div className="c"><div style={{ fontSize: '7rem' }}>🎉⭐</div><div className="row"><button className="b1" onClick={() => play(scr.g)}>▶</button><button className="b1" style={{ background: 'var(--sun)', color: '#2B2A4C' }} onClick={() => { leave(); hub(); }}>🏠</button></div></div>;
  else if (cur && scr.s === 'game') {
    const Game = GAME_UI[scr.g];
    body = <><div className="bar"><button className="back" aria-label="Kembali" onClick={() => { leave(); hub(); }}>⬅</button><span>⭐ {cur.stars}</span></div>
      <div className="st"><Game key={cur.stars} level={cur.plays[scr.g]?.level ?? 1} vol={cur.vol} onWin={() => win(scr.g)} /></div></>;
  } else body = null;
  return <div className="app">{body}</div>;
}
