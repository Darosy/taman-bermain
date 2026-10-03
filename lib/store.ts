export type Play = { n: number; level: number; streak: number };
export type Profile = { id: number; name: string; av: string; year: number; stars: number; limit: number; off: string[]; vol: number; plays: Record<string, Play>; days: Record<string, number> };
export type GameProps = { level: number; vol: number; onWin: () => void };
export const AVATARS = ['🐘', '🐯', '🐼', '🦊', '🐸', '🐙'];
// Tambah game baru: daftarkan di sini + di GAME_UI (components/App.tsx).
export const GAMES: Record<string, { name: string; icon: string; age: number; skill: string; tip: string }> = {
  balon: { name: 'Balon', icon: '🎈', age: 2, skill: 'Koordinasi', tip: 'Ajak anak melempar dan menangkap bola lembut.' },
  hewan: { name: 'Hewan', icon: '🐶', age: 2, skill: 'Kosakata hewan', tip: 'Tirukan suara hewan bersama anak.' },
  warna: { name: 'Warna', icon: '🎨', age: 2, skill: 'Warna', tip: 'Coba sebutkan warna benda di rumah.' },
  memori: { name: 'Kartu Memori', icon: '🃏', age: 4, skill: 'Memori', tip: 'Sembunyikan satu mainan, minta anak menebak yang hilang.' },
};
export const ymd = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const minsOn = (p: Profile, d = ymd()) => p.days[d] ?? 0;
export const shuf = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const open = () => new Promise<IDBDatabase>((res, rej) => { const q = indexedDB.open('taman', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
export async function loadProfiles(): Promise<Profile[]> {
  try { const d = await open(); return await new Promise((res) => { const q = d.transaction('kv').objectStore('kv').get('db'); q.onsuccess = () => res(q.result?.profiles ?? []); q.onerror = () => res([]); }); } catch { return []; }
}
export async function saveProfiles(profiles: Profile[]) { try { (await open()).transaction('kv', 'readwrite').objectStore('kv').put({ profiles }, 'db'); } catch {} }
