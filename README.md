# Taman Main (Vite + React)
React dan TypeScript dibangun dengan Vite. Tanpa backend, data lokal (IndexedDB), PWA offline.

Tersedia 16 game: Balon, Hewan, Warna, Kartu Memori, Mewarnai, Puzzle 3–6 keping, Bentuk, Angka 1–10, Huruf A–Z, Urutan Pola, Penjumlahan, Susun Huruf, Labirin, Suara di Sekitar, Pilah Barang, dan Urutkan Cerita. Semua game mengikuti tingkat kesulitan profil, kontrol orang tua, batas waktu bermain, dan suara umpan balik.

## Jalankan lokal
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil statis di dist/
npm start          # pratinjau dist/ di http://localhost:4173 untuk uji PWA/offline
```
Gerbang orang tua memakai soal hitung (ketuk jawaban). Service worker dibuat setelah `build` dari daftar aset Vite di `dist/`, termasuk suara. Mode `dev` tidak mendaftarkan service worker agar perubahan kode langsung terlihat. Uji offline dengan `npm run build` lalu `npm start`.

## Pasang di ponsel
Buka situs yang sudah di-deploy melalui **HTTPS**. Alamat `http://192.168...` atau IP lokal dari komputer tidak dapat mendaftarkan service worker di ponsel. `npm run dev` juga tidak mendaftarkan service worker. Di Android Chrome, gunakan tombol **Pasang** jika muncul atau menu browser **Instal aplikasi / Tambahkan ke layar utama**. Di iPhone Safari, gunakan **Bagikan → Tambahkan ke Layar Utama**.

## Struktur
- `index.html` dan `main.tsx` entry point; `app/globals.css` gaya global
- `components/App.tsx` alur layar, profil, waktu bermain
- `components/Parent.tsx` dashboard dan pengaturan orang tua
- `components/games/*` satu berkas per game. Tambah game: buat komponen, daftarkan di `lib/store.ts` (GAMES) dan `components/App.tsx` (GAME_UI)
- `lib/` penyimpanan IndexedDB, audio
- `scripts/sw.template.js` service worker (diberi versi dan daftar aset tiap build)
- `public/sounds/` suara game hewan, jawaban, dan kemenangan

## Suara instruksi bahasa Indonesia

Instruksi memakai rekaman jika tersedia; jika belum, aplikasi memilih suara perempuan bahasa Indonesia yang tersedia di perangkat. Pilihan suara browser berbeda antar perangkat dan tidak menjamin suara perempuan atau kualitas rekaman manusia. Agar konsisten dan terdengar alami, rekam instruksi dengan penutur perempuan bahasa Indonesia dan simpan berkas MP3/M4A/OGG/WAV di `public/sounds/voice/`. Daftarkan kalimat dan nama berkasnya di `public/sounds/voice/manifest.json`, misalnya:

```json
{
  "Dengarkan suara, lalu pilih gambar yang cocok.": "suara-sekitar.mp3"
}
```

Kalimat pada manifest harus sama dengan kalimat yang dikirim ke `say()`; huruf besar dan spasi berlebih diabaikan. Rekaman ikut tersimpan dalam cache PWA saat build, sehingga bisa dipakai offline.

## Deploy ke Vercel
Push ke GitHub, Import Project di Vercel. `vercel.json` memilih preset Vite, menjalankan `npm run build`, menyajikan `dist/`, dan mengatur header keamanan serta cache.
Tautan donasi: set env `VITE_SAWERIA_URL` di Vercel (Project Settings, Environment Variables). Setelah migrasi dari Next.js, pindahkan nilai lama `NEXT_PUBLIC_SAWERIA_URL` ke nama baru ini.
