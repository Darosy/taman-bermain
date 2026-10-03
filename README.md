# Taman Main (Next.js)
Next.js (App Router, TypeScript) dengan static export. Tanpa backend, data lokal (IndexedDB), PWA offline.

## Jalankan lokal
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # hasil statis di out/
npm start          # sajikan out/ untuk uji PWA/offline
```
Service worker hanya dibuat saat `dev`/`build` (skrip `scripts/stamp-sw.mjs`), dan paling mudah diuji lewat `npm run build && npm start`.

## Struktur
- `app/` layout, halaman, CSS global
- `components/App.tsx` alur layar, profil, waktu bermain
- `components/Parent.tsx` dashboard dan pengaturan orang tua
- `components/games/*` satu berkas per game. Tambah game: buat komponen, daftarkan di `lib/store.ts` (GAMES) dan `components/App.tsx` (GAME_UI)
- `lib/` penyimpanan IndexedDB, audio
- `scripts/sw.template.js` service worker (diberi versi tiap build)

## Deploy ke Vercel
Push ke GitHub, Import Project di Vercel (terdeteksi Next.js, tanpa pengaturan tambahan). `vercel.json` mengatur header keamanan dan cache.
Tautan donasi: set env `NEXT_PUBLIC_SAWERIA_URL` di Vercel (Project Settings, Environment Variables).
