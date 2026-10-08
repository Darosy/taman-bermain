'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { GAMES, loadProfiles, saveProfiles, minsOn, ymd, type GameProps, type Profile } from '@/lib/store';
import { playWin, say } from '@/lib/audio';
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
  const [scr, setScr] = useState<Scr>({ s: 'pick' }); const [upd, setUpd] = useState(false); const [loaded, setLoaded] = useState(false); const t0 = useRef(0), winning = useRef(false);
  const psRef = useRef(ps), ciRef = useRef(ci), scrRef = useRef(scr);
  ciRef.current = ci; scrRef.current = scr;
  const cur = ci !== null ? ps[ci] : null;
  const commit = (n: Profile[]) => { psRef.current = n; setPs(n); void saveProfiles(n); return n; };
  const patch = (i: number, f: (p: Profile) => Profile) => commit(psRef.current.map((p, k) => (k === i ? f(p) : p)));

  // Catat waktu bermain ke hari ini; mengembalikan daftar profil terbaru.
  const leave = () => {
    const i = ciRef.current, start = t0.current;
    if (i === null || !start) return psRef.current;
    const end = Date.now(); t0.current = 0;
    return commit(psRef.current.map((p, k) => {
      if (k !== i) return p;
      const days = { ...p.days };
      for (let at = start; at < end;) {
        const next = new Date(at); next.setHours(24, 0, 0, 0);
        const until = Math.min(end, next.getTime());
        const day = ymd(new Date(at)); days[day] = (days[day] ?? 0) + (until - at) / 6e4;
        at = until;
      }
      return { ...p, days };
    }));
  };
  const leaveRef = useRef(leave); leaveRef.current = leave;

  useEffect(() => {
    let cancelled = false;
    loadProfiles().then((profiles) => { if (!cancelled) { psRef.current = profiles; setPs(profiles); setLoaded(true); } });
    navigator.storage?.persist?.();
    const noMenu = (e: Event) => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault(); }; document.addEventListener('contextmenu', noMenu);
    const vis = () => {
      if (document.hidden) leaveRef.current();
      else if (scrRef.current.s === 'game' && !t0.current) {
        const i = ciRef.current, p = i === null ? null : psRef.current[i];
        if (p && minsOn(p) >= p.limit) setScr({ s: 'rest' });
        else if (p) t0.current = Date.now();
      }
    }; document.addEventListener('visibilitychange', vis);
    const tick = setInterval(() => {
      if (document.hidden || scrRef.current.s !== 'game' || !t0.current) return;
      const i = ciRef.current, p = i === null ? null : psRef.current[i];
      if (!p) return;
      if (minsOn(p) + (Date.now() - t0.current) / 6e4 >= p.limit) {
        leaveRef.current(); say(p.vol, 'Waktunya istirahat'); setScr({ s: 'rest' });
      } else if (Date.now() - t0.current >= 5000) {
        leaveRef.current(); t0.current = Date.now();
      }
    }, 1000);
    const pagehide = () => leaveRef.current(); window.addEventListener('pagehide', pagehide);
    if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then((r) => {
      const chk = () => { if (r.waiting && navigator.serviceWorker.controller) setUpd(true); }; chk();
      r.addEventListener('updatefound', () => r.installing?.addEventListener('statechange', chk));
    });
    return () => { cancelled = true; clearInterval(tick); window.removeEventListener('pagehide', pagehide); document.removeEventListener('visibilitychange', vis); document.removeEventListener('contextmenu', noMenu); };
  }, []);

  const hub = () => { const p = ciRef.current === null ? null : psRef.current[ciRef.current]; if (p && minsOn(p) >= p.limit) { say(p.vol, 'Waktunya istirahat'); return setScr({ s: 'rest' }); } setScr({ s: 'hub' }); };
  const play = (g: string) => {
    const n = leave(); const p = ci !== null ? n[ci] : null;
    if (p && minsOn(p) >= p.limit) return setScr({ s: 'rest' });
    winning.current = false; t0.current = Date.now(); setScr({ s: 'game', g });
  };
  const win = (g: string) => {
    if (ci === null || winning.current || scrRef.current.s !== 'game') return;
    winning.current = true;
    const n = leave();
    if (minsOn(n[ci]) >= n[ci].limit) return setScr({ s: 'rest' });
    patch(ci, (p) => { const q = { ...(p.plays[g] ?? { n: 0, level: 1, streak: 0 }) }; q.n++; q.streak++; if (q.streak >= 2 && q.level < 5) { q.level++; q.streak = 0; } return { ...p, stars: p.stars + 1, plays: { ...p.plays, [g]: q } }; });
    playWin(cur?.vol ?? 1);
    setScr({ s: 'win', g });
  };
  const pick = () => { leave(); setCi(null); setScr({ s: 'pick' }); };
  const applyUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    registration.waiting.postMessage('skip');
  };

  let body;
  if (scr.s === 'pick') body = <>
    <div className="c"><p className="t">Siapa yang main?</p>{ps.length === 0 && <p>Ketuk ➕ untuk membuat profil bersama orang tua.</p>}<div className="grid">
      {ps.map((p, i) => <button key={p.id} className="tile" onClick={() => { setCi(i); setScr({ s: 'hub' }); }}>{p.av}<small>{p.name}</small></button>)}
      <button className="tile" aria-label="Tambah profil" onClick={() => setScr({ s: 'gate', add: true })}>➕</button></div></div>
    <button className="gear" aria-label="Area orang tua" onClick={() => setScr({ s: 'gate', add: false })}>⚙</button></>;
  else if (scr.s === 'gate') body = <Gate onBack={pick} onOk={() => setScr({ s: 'parent', i: scr.add ? -1 : 0 })} />;
  else if (scr.s === 'parent') body = <Parent ps={ps} i={scr.i} upd={upd} onSel={(i) => setScr({ s: 'parent', i })} onPatch={patch}
    onAdd={(p) => { const i = psRef.current.length; commit([...psRef.current, p]); if (scr.i < 0) { setCi(i); setScr({ s: 'hub' }); } else setScr({ s: 'parent', i }); }} onDel={(i) => { commit(psRef.current.filter((_, k) => k !== i)); setScr({ s: 'parent', i: 0 }); }}
    onDone={pick} onUpdate={applyUpdate} />;
  else if (scr.s === 'rest') body = <div className="c"><div style={{ fontSize: '6rem' }}>😴</div><p className="t">Waktunya istirahat!</p><button className="b1" aria-label="Ganti profil" onClick={pick}>🏠</button></div>;
  else if (cur && scr.s === 'hub') {
    const age = new Date().getFullYear() - cur.year;
    const gs = Object.keys(GAMES).filter((g) => !cur.off.includes(g)).sort((a, b) => Math.abs(GAMES[a].age - age) - Math.abs(GAMES[b].age - age));
    body = <><div className="bar"><button className="back" aria-label="Ganti profil" onClick={pick}>{cur.av}</button><span>⭐ {cur.stars}</span></div>
      <div className="c hub">{gs.length ? <div className="grid">{gs.map((g) => <button key={g} className="tile" onClick={() => play(g)}>{GAMES[g].icon}<small>{GAMES[g].name}</small></button>)}</div> : <div className="box"><p>Belum ada game aktif.</p><button className="b2" onClick={() => setScr({ s: 'gate', add: false })}>Pengaturan orang tua</button></div>}</div></>;
  } else if (cur && scr.s === 'win') body = <div className="c"><div style={{ fontSize: '7rem' }}>🎉⭐</div><div className="row"><button className="b1" aria-label="Main lagi" onClick={() => play(scr.g)}>▶</button><button className="b1" aria-label="Kembali ke daftar game" style={{ background: 'var(--sun)', color: '#2B2A4C' }} onClick={() => { leave(); hub(); }}>🏠</button></div></div>;
  else if (cur && scr.s === 'game') {
    const Game = GAME_UI[scr.g];
    body = <><div className="bar"><button className="back" aria-label="Kembali" onClick={() => { leave(); hub(); }}>⬅</button><span>⭐ {cur.stars}</span></div>
      <div className={'st' + (scr.g === 'balon' ? ' balloons' : '')}><Game key={cur.stars} level={cur.plays[scr.g]?.level ?? 1} vol={cur.vol} onWin={() => win(scr.g)} /></div></>;
  } else body = null;
  return <div className="app">{loaded ? body : <div className="c" role="status">Memuat profil…</div>}</div>;
}
