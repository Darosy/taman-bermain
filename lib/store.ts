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
  mewarnai: { name: 'Mewarnai', icon: '🖍️', age: 2, skill: 'Kreativitas', tip: 'Ajak anak bercerita tentang gambarnya.' },
  puzzle: { name: 'Puzzle', icon: '🧩', age: 3, skill: 'Pemecahan masalah', tip: 'Susun potongan gambar bersama anak.' },
  bentuk: { name: 'Bentuk', icon: '🔺', age: 2, skill: 'Mengenal bentuk', tip: 'Cari bentuk lingkaran dan persegi di rumah.' },
  angka: { name: 'Angka', icon: '🔢', age: 3, skill: 'Berhitung', tip: 'Hitung benda sehari-hari bersama anak.' },
  huruf: { name: 'Huruf', icon: '🔤', age: 4, skill: 'Mengenal huruf', tip: 'Cari huruf awal nama anak pada benda di sekitar.' },
  pola: { name: 'Urutan Pola', icon: '✨', age: 4, skill: 'Mengenal pola', tip: 'Buat urutan warna atau benda dan minta anak melanjutkannya.' },
  tambah: { name: 'Penjumlahan', icon: '➕', age: 5, skill: 'Berhitung', tip: 'Gabungkan dua kelompok benda kecil lalu hitung bersama.' },
  susun: { name: 'Susun Huruf', icon: '🔡', age: 5, skill: 'Mengenal kata', tip: 'Sebutkan nama benda dan cari huruf awalnya bersama anak.' },
  labirin: { name: 'Labirin', icon: '🚀', age: 4, skill: 'Pemecahan masalah', tip: 'Ajak anak mencari jalan dengan jari di atas kertas.' },
  suara: { name: 'Suara di Sekitar', icon: '🔊', age: 2, skill: 'Mendengar dan mengenali suara', tip: 'Dengarkan suara hujan, jam, atau kendaraan bersama anak.' },
  pilah: { name: 'Pilah Barang', icon: '🧺', age: 3, skill: 'Mengelompokkan benda', tip: 'Ajak anak memilah mainan, pakaian, dan makanan di rumah.' },
  cerita: { name: 'Urutkan Cerita', icon: '📖', age: 4, skill: 'Berpikir berurutan', tip: 'Ceritakan tiga kejadian sederhana lalu susun urutannya bersama anak.' },
};
export const ymd = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const minsOn = (p: Profile, d = ymd()) => p.days[d] ?? 0;
export const shuf = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const open = () => new Promise<IDBDatabase>((res, rej) => { const q = indexedDB.open('taman', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
export async function loadProfiles(): Promise<Profile[]> {
  try {
    const db = await open();
    try { return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get('db'); q.onsuccess = () => res(q.result?.profiles ?? []); q.onerror = () => res([]); }); }
    finally { db.close(); }
  } catch { return []; }
}
let lastSave = Promise.resolve();
export function saveProfiles(profiles: Profile[]) {
  lastSave = lastSave.then(async () => {
    const db = await open();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put({ profiles }, 'db');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  }).catch((error) => { console.error('Gagal menyimpan profil:', error); });
  return lastSave;
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
export function parseBackup(value: unknown): Profile | null {
  if (!record(value)) return null;
  const { name, av, year, stars, limit, off, vol, plays, days } = value;
  const currentYear = new Date().getFullYear();
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 12 ||
      typeof av !== 'string' || !AVATARS.includes(av) ||
      !integer(year, 1900, currentYear) || !integer(stars, 0) ||
      ![10, 20, 30].includes(limit as number) ||
      !Array.isArray(off) || !off.every((g) => typeof g === 'string' && Object.hasOwn(GAMES, g)) ||
      typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 1 ||
      !record(plays) || !record(days)) return null;
  for (const [game, play] of Object.entries(plays)) {
    if (!Object.hasOwn(GAMES, game) || !record(play) || !integer(play.n, 0) || !integer(play.level, 1, 5) || !integer(play.streak, 0)) return null;
  }
  for (const [date, minutes] of Object.entries(days)) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date) || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 0 || minutes > 1440) return null;
  }
  return { id: Date.now(), name: name.trim(), av, year: year as number, stars: stars as number,
    limit: limit as number, off, vol, plays: plays as Record<string, Play>, days: days as Record<string, number> };
}
