'use client';
import { useRef, useState } from 'react';
import { AVATARS, GAMES, minsOn, parseBackup, ymd, type Profile } from '@/lib/store';
const SAWERIA_URL = import.meta.env.VITE_SAWERIA_URL || 'https://saweria.co/GANTI_USERNAME';
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const level = (n: number) => (n < 3 ? 'Baru mulai' : n < 8 ? 'Berkembang' : 'Mahir');
type Props = { ps: Profile[]; i: number; upd: boolean; onSel: (i: number) => void; onPatch: (i: number, f: (p: Profile) => Profile) => void; onAdd: (p: Profile) => void; onDel: (i: number) => void; onDone: () => void; onUpdate: () => void };

export default function Parent({ ps, i, upd, onSel, onPatch, onAdd, onDel, onDone, onUpdate }: Props) {
  const p = ps[i];
  return <div className="p">
    <div className="row"><button onClick={onDone}>⬅ Selesai</button>
      {ps.map((q, k) => <button key={q.id} className={k === i ? 'on' : ''} aria-pressed={k === i} onClick={() => onSel(k)}>{q.av} {q.name}</button>)}
      {ps.length < 5 && <button className={i < 0 ? 'on' : ''} aria-pressed={i < 0} onClick={() => onSel(-1)}>➕ Profil</button>}</div>
    {upd && <div className="box">Versi baru tersedia. <button onClick={onUpdate}>Perbarui sekarang</button></div>}
    {p ? <Dash p={p} i={i} ps={ps} onPatch={onPatch} onAdd={onAdd} onDel={onDel} /> : <NewProfile onAdd={onAdd} />}
    <h2>Dukungan</h2><div className="box">Taman Main gratis, tanpa iklan. Jika berkenan, Anda bisa mentraktir kopi.<br /><br />
      <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">☕ Traktir Kopi (Saweria)</a></div>
  </div>;
}

function NewProfile({ onAdd }: { onAdd: (p: Profile) => void }) {
  const y = new Date().getFullYear(); const [name, setName] = useState(''); const [year, setYear] = useState(y - 3); const [av, setAv] = useState(0);
  return <><h2>Profil baru</h2><div className="box">
    <p className="note">Isi nama panggilan, pilih usia dan avatar, lalu simpan untuk mulai bermain.</p>
    <label>Nama panggilan <input maxLength={12} value={name} onChange={(e) => setName(e.target.value)} /></label>{' '}
    <label>Usia <select value={year} onChange={(e) => setYear(+e.target.value)}>{[0, 1, 2, 3, 4, 5].map((a) => <option key={a} value={y - a}>{a} th</option>)}</select></label>
    <div className="row" role="group" aria-label="Pilih avatar" style={{ margin: '10px 0' }}>{AVATARS.map((a, k) => <button key={a} className={k === av ? 'on' : ''} aria-label={`Avatar ${k + 1}`} aria-pressed={k === av} onClick={() => setAv(k)}>{a}</button>)}</div>
    <button className="on" disabled={!name.trim()} onClick={() => onAdd({ id: Date.now(), name: name.trim(), av: AVATARS[av], year, stars: 0, limit: 20, off: [], vol: 1, plays: {}, days: {} })}>Simpan profil</button></div></>;
}

function Dash({ p, i, ps, onPatch, onAdd, onDel }: { p: Profile; i: number; ps: Profile[]; onPatch: Props['onPatch']; onAdd: Props['onAdd']; onDel: Props['onDel'] }) {
  const file = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const wk = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - 6 + k); return { m: minsOn(p, ymd(d)), l: DAYS[d.getDay()] }; });
  const mx = Math.max(1, ...wk.map((w) => w.m)), tot = wk.reduce((s, w) => s + w.m, 0);
  const n = (g: string) => p.plays[g]?.n ?? 0, keys = Object.keys(GAMES);
  const fav = [...keys].sort((a, b) => n(b) - n(a))[0], weak = [...keys].sort((a, b) => n(a) - n(b))[0];
  const badges = [[1, 'Bintang pertama'], [10, '10 bintang'], [25, '25 bintang']].filter(([x]) => p.stars >= (x as number));
  const toggle = (g: string) => onPatch(i, (q) => ({ ...q, off: q.off.includes(g) ? q.off.filter((x) => x !== g) : [...q.off, g] }));
  const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(p)], { type: 'application/json' })); a.download = `taman-${p.name}.json`; a.click(); };
  const imp = async (f?: File) => {
    if (!f) return;
    setImportError('');
    if (ps.length >= 5) return setImportError('Maksimal 5 profil. Hapus satu profil sebelum mengimpor.');
    try {
      const q = parseBackup(JSON.parse(await f.text()));
      if (!q) return setImportError('Berkas cadangan tidak valid atau tidak kompatibel.');
      onAdd(q);
    } catch { setImportError('Berkas tidak dapat dibaca sebagai JSON.'); }
  };
  const del = () => { if (confirm('Hapus profil dan seluruh datanya?') && confirm('Yakin? Data tidak bisa dikembalikan.')) onDel(i); };
  return <>
    <h2>Ringkasan {p.av} {p.name}</h2>
    <div className="box"><b>Waktu bermain 7 hari:</b> {Math.round(tot)} menit
      <div className="wk" style={{ marginBottom: 40 }} role="img" aria-label={wk.map((w) => `${w.l}: ${Math.round(w.m)} menit`).join(', ')}>{wk.map((w, k) => <div key={k} aria-hidden="true" style={{ height: (w.m / mx) * 100 + '%' }}><i>{w.l}<br />{Math.round(w.m)}m</i></div>)}</div></div>
    <div className="box"><b>Game favorit:</b> {n(fav) ? GAMES[fav].name : 'Belum ada'}<br />
      {keys.map((g) => <div key={g}>{GAMES[g].icon} {GAMES[g].name}: {n(g)}x · Level {p.plays[g]?.level ?? 1} · {GAMES[g].skill}: <b>{level(n(g))}</b></div>)}</div>
    <div className="box">⭐ {p.stars} bintang{badges.map(([, t]) => <div key={t}>🏅 {t}</div>)}</div>
    <div className="box">💡 Kegiatan offline: {GAMES[weak].tip}</div>
    <p className="note">Progres bersifat indikatif untuk bermain dan belajar, bukan penilaian atau diagnosis perkembangan anak.</p>
    <h2>Pengaturan</h2>
    <div className="box"><div className="row" role="group" aria-label="Batas harian">Batas harian: {[10, 20, 30].map((m) => <button key={m} className={p.limit === m ? 'on' : ''} aria-pressed={p.limit === m} onClick={() => onPatch(i, (q) => ({ ...q, limit: m }))}>{m} mnt</button>)}</div><br />
      <div className="row" role="group" aria-label="Game aktif">Game aktif: {keys.map((g) => <button key={g} className={p.off.includes(g) ? '' : 'on'} aria-label={GAMES[g].name} aria-pressed={!p.off.includes(g)} onClick={() => toggle(g)}>{GAMES[g].icon}</button>)}</div><br />
      <label>Volume <input type="range" min={0} max={1} step={0.1} value={p.vol} onChange={(e) => onPatch(i, (q) => ({ ...q, vol: +e.target.value }))} /></label></div>
    <h2>Data</h2><div className="row"><button onClick={exp}>Ekspor cadangan</button><button onClick={() => file.current?.click()}>Impor cadangan</button><button onClick={del}>Hapus profil</button></div>
    {importError && <p role="alert" className="note">{importError}</p>}
    <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { imp(e.target.files?.[0]); e.target.value = ''; }} />
  </>;
}
