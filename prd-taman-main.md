# PRD: Taman Main (Game Edukasi Anak 2-5 Tahun, Web/PWA)

## 1. Ringkasan
Kumpulan mini-game edukasi berbasis web (PWA) untuk anak usia 2-5 tahun. Satu hub dengan ikon besar, dapat dimainkan offline, tanpa iklan, tanpa teks panjang, dan dipandu suara berbahasa Indonesia.

## 2. Tujuan & Metrik
| Tujuan | Metrik sukses |
|---|---|
| Anak bermain mandiri tanpa bantuan membaca | >80% sesi dimulai tanpa bantuan orang tua (uji pengamatan) |
| Sesi singkat & menyenangkan | Rata-rata 3-5 menit/game, tanpa frustrasi |
| Bisa dipakai offline | 100% game berjalan tanpa internet setelah instal |
| Orang tua percaya | 0 iklan, 0 tautan keluar di layar anak, 0 pelacakan pribadi |
| Dashboard bermanfaat | >50% orang tua membuka dashboard minimal 1x/minggu (diukur dari uji beta/wawancara, tanpa analitik) |
| Multi-profil mudah | Orang tua membuat profil anak <1 menit |

## 3. Pengguna
- **Utama:** anak 2-5 tahun (tap, seret sederhana, belum bisa membaca).
- **Sekunder:** orang tua/guru PAUD yang memilih dan mengawasi.

## 4. Prinsip Produk
1. Objek & tombol besar (min. 64 px), satu aksi per layar.
2. Instruksi lewat suara & visual, bukan teks.
3. Tanpa "game over" atau skor negatif; salah = coba lagi dengan lembut.
4. Umpan balik instan (suara, animasi) pada setiap sentuhan.
5. Aman: tanpa iklan, tanpa pembelian, tanpa tautan keluar.

## 5. Lingkup MVP (Fase 1)
| Game | Usia | Kemampuan dilatih | Mekanik |
|---|---|---|---|
| Balon | 2-3 | Koordinasi tangan-mata, sebab-akibat | Tap balon yang naik |
| Hewan | 2-4 | Kosakata, suara | Tap hewan: nama + suara |
| Warna | 2-4 | Mengenal warna | Cocokkan bola dengan mangkuk warna |
| Kartu Memori | 4-5 | Memori, fokus | Cari pasangan 4-8 kartu |

**Fitur umum MVP:** hub menu, tombol kembali besar, bintang hadiah, suara (TTS/rekaman bahasa Indonesia), dukungan portrait & landscape, mode gelap otomatis, **multi-profil anak**, **dashboard orang tua** (lihat bagian 7-8), dan tombol dukungan "Traktir Kopi" di area orang tua.

## 6. Fase Berikutnya
- **Fase 2:** Mewarnai bebas, Puzzle 3-6 keping, Cocokkan bentuk, Angka 1-10, Huruf A-Z.
- **Fase 3:** Urutan pola, penjumlahan dasar, susun huruf (kata sederhana), labirin mudah.
- Tingkat kesulitan adaptif: jumlah kartu/objek naik jika anak berhasil beruntun.

## 7. Multi-Profil Anak
- Satu perangkat dapat memiliki beberapa profil anak (disarankan maksimal 5).
- Profil: nama panggilan, avatar hewan/karakter (tanpa foto, tanpa data pribadi), tahun lahir/rentang usia.
- Layar pilih profil di awal: avatar besar, sentuh untuk masuk; tambah/ubah/hapus profil hanya lewat parent gate.
- Setiap profil punya bintang, progres, tingkat kesulitan, dan batas waktu sendiri.
- Rekomendasi game otomatis sesuai usia profil (mis. Kartu Memori tampil lebih awal untuk usia 4-5).
- Menghapus profil menghapus seluruh datanya (konfirmasi ganda di parent gate).

## 8. Dashboard Orang Tua & Pemantauan Progres
**Akses:** lewat parent gate (tahan 3 detik atau soal hitung), tidak terlihat oleh anak.

**Data per profil:**
| Data | Contoh tampilan |
|---|---|
| Waktu bermain | Grafik harian/mingguan, total menit |
| Game yang dimainkan | Frekuensi per game, game favorit |
| Progres keterampilan | Indikator sederhana per area: warna, hewan/kosakata, memori, koordinasi (Baru mulai / Berkembang / Mahir) |
| Pencapaian | Bintang total, lencana (mis. "Selesai 10 pasangan kartu") |
| Kesulitan saat ini | Level aktif per game dan kapan naik level |

**Fitur dashboard:**
- Ringkasan mingguan per anak, bisa berpindah antar profil.
- Saran kegiatan offline sederhana berdasarkan progres (mis. "Coba sebutkan warna benda di rumah").
- Atur batas waktu harian, pilih game yang aktif, atur volume per profil.
- Ekspor/hapus data per profil.

**Catatan:** progres bersifat indikatif untuk bermain dan belajar, bukan penilaian atau diagnosis perkembangan anak. Tampilkan dengan bahasa positif.

**Penyimpanan data:** lokal di perangkat (IndexedDB), tanpa akun. Konsekuensinya data tidak otomatis berpindah antar perangkat; sediakan ekspor/impor berkas cadangan. Sinkronisasi cloud **tidak termasuk lingkup** produk ini; data sepenuhnya lokal.

## 9. Parent Gate & Pengaturan
- Gerbang orang tua (mis. "tahan 3 detik" atau soal hitung sederhana) sebelum membuka pengaturan, dashboard, kelola profil, dan tautan dukungan.
- Pengaturan: volume, batas waktu bermain (10/20/30 menit), pilih game aktif, bahasa suara.
- Layar "waktunya istirahat" ramah saat batas waktu tercapai.

## 10. Model Dukungan (Tanpa Monetisasi)
- Aplikasi gratis sepenuhnya: tanpa iklan, tanpa pembelian dalam aplikasi, tanpa langganan, semua game terbuka.
- Terbuka untuk donasi sukarela ("Traktir Kopi") lewat **Saweria**.
- Tautan donasi **hanya** ada di area orang tua (di balik parent gate), tidak pernah muncul di layar anak, dan dibuka di tab eksternal.
- Donasi tidak membuka fitur khusus dan tidak memengaruhi pengalaman anak.
- Teks dukungan jujur dan singkat, tanpa tekanan (tanpa pop-up berulang).

## 11. Kebutuhan PWA
- Web App Manifest (nama, ikon 192/512 px, `display: standalone`, orientasi bebas).
- Service worker: pre-cache semua aset (strategi cache-first), update senyap dengan notifikasi di area orang tua.
- Dapat diinstal ke layar utama (Android/iOS/desktop); halaman offline fallback.
- Aset ringan: total <10 MB, sprite/SVG, audio kompres (mp3/ogg).
- Kunci zoom, cegah pull-to-refresh & seleksi teks, gunakan pointer events.
- Data profil dan progres di IndexedDB; minta `navigator.storage.persist()` agar data tidak terhapus otomatis oleh browser.

## 12. Deployment & Hosting
**Keputusan:** hosting di **Vercel** memakai subdomain bawaan `*.vercel.app` (tanpa domain kustom). Situs statis (HTML/CSS/JS + aset) tanpa backend, dengan HTTPS otomatis (wajib untuk PWA dan service worker).

| Opsi | Kelebihan | Catatan |
|---|---|---|
| Netlify | Deploy dari Git atau drag-and-drop, HTTPS otomatis, preview per branch, pengaturan header/redirect lewat `netlify.toml` | Paket gratis cukup untuk MVP; pantau batas bandwidth |
| **Vercel** (dipilih) | Deploy dari Git, preview per pull request, CDN global, `vercel.json` untuk header | Cocok jika memakai framework (Next.js/Vite); batas paket gratis untuk proyek non-komersial |
| Cloudflare Pages / GitHub Pages | Alternatif gratis dan stabil | GitHub Pages tidak punya kontrol header kustom |

*Batas paket gratis dan ketentuan layanan dapat berubah, cek halaman resmi masing-masing sebelum memilih.*

**Alur CI/CD:**
1. Kode di repositori Git (GitHub/GitLab).
2. Push ke `main` memicu build dan deploy otomatis ke produksi; branch lain mendapat URL preview untuk uji.
3. Build menghasilkan folder statis (mis. `dist/`) berisi service worker dan manifest.
4. Cek otomatis sebelum rilis: Lighthouse PWA (installable, offline), ukuran aset <10 MB.

**Konfigurasi penting:**
- Header cache: aset berversi (hash) `Cache-Control: public, max-age=31536000, immutable`; `index.html` dan `service-worker.js` `no-cache` agar update PWA cepat sampai.
- Fallback SPA: semua rute diarahkan ke `index.html`.
- Header keamanan: `Content-Security-Policy` ketat, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (nonaktifkan kamera/mikrofon/lokasi karena tidak dipakai).
- Kompresi Brotli/gzip untuk teks, audio mp3/ogg dan gambar sudah dikompres.
- HTTPS otomatis di domain `*.vercel.app`; `manifest.webmanifest` dan ikon (192/512, maskable) tersedia di root.
- Pengelolaan versi: tag rilis (mis. `v1.0.0`), rollback dengan men-deploy ulang build sebelumnya.

**Pembaruan PWA:** service worker baru diunduh di latar belakang dan aktif setelah aplikasi ditutup; notifikasi "Versi baru tersedia" hanya tampil di area orang tua, tidak pernah saat anak bermain.

**Lingkungan:** Produksi (`main`) dan Preview (branch/PR). Tidak ada rahasia atau API key karena tidak ada backend.

**Pemantauan:** uptime sederhana (mis. UptimeRobot). Tidak ada analitik maupun pelacakan pengguna.

## 13. Kebutuhan Non-Fungsional
- **Performa:** 60 fps di perangkat Android entry-level; muat awal <3 dtk.
- **Aksesibilitas:** kontras tinggi, `aria-label` untuk orang tua, hormati `prefers-reduced-motion`.
- **Kompatibilitas:** Chrome Android, Safari iOS 15+, tablet.
- **Privasi:** tanpa akun, data profil, bintang, progres, dan pengaturan hanya disimpan lokal di perangkat (profil anak tanpa foto/nama lengkap); patuhi regulasi perlindungan data anak yang berlaku (mis. UU PDP, PP perlindungan anak di ranah digital) dan konsultasikan dengan ahli hukum sebelum rilis.

## 14. Konten & Audio
- Suara bahasa Indonesia ramah (rekaman suara asli lebih baik daripada TTS untuk rilis).
- Palet cerah, ilustrasi bulat & sederhana, tanpa elemen menakutkan.

## 15. Rencana Rilis
| Tahap | Isi | Perkiraan |
|---|---|---|
| Prototipe | 4 game inti (tersedia) | Selesai |
| Alpha | PWA offline, parent gate, multi-profil, pencatatan progres, aset final | 4-5 minggu |
| Beta | Dashboard orang tua, uji dengan 10-15 anak & orang tua, perbaiki | 3-4 minggu |
| Rilis 1.0 | Deploy produksi di Vercel (`*.vercel.app`), instal PWA | +1-2 minggu |

## 16. Risiko
| Risiko | Mitigasi |
|---|---|
| Anak keluar game tak sengaja | Tombol kembali besar, tanpa tautan keluar |
| TTS terdengar kaku/tidak tersedia | Rekam suara asli; fallback visual |
| Data lokal hilang/ganti perangkat | Minta penyimpanan persisten, sediakan ekspor/impor cadangan |
| Dashboard dianggap penilaian perkembangan | Bahasa indikatif & positif, beri catatan bukan diagnosis |
| Donasi mengganggu anak/orang tua | Hanya di balik parent gate, tanpa pop-up |
| Batas paket gratis Vercel terlampaui | Aset ringan + CDN, pantau penggunaan, siapkan alternatif (Cloudflare Pages/Netlify) |
| Pengguna tertahan di versi lama | Header no-cache untuk service worker, notifikasi update di area orang tua |
| iOS membatasi PWA/audio | Audio dimulai dari sentuhan pertama; uji di Safari |
| Layar kecil bikin salah tap | Area sentuh besar, jarak antar objek lega |

## 17. Keputusan & Di Luar Lingkup
**Keputusan:**
- Platform donasi: **Saweria**.
- Hosting: **Vercel**, tanpa domain kustom (memakai `*.vercel.app`).

**Di luar lingkup (tidak dikerjakan):**
- Sinkronisasi cloud / akun orang tua.
- Analitik anonim atau pelacakan penggunaan.
- Laporan progres yang dapat dibagikan (PDF/tautan). Orang tua hanya melihat dashboard di perangkat; cadangan data tetap lewat ekspor/impor berkas.

**Pertanyaan terbuka:** tidak ada saat ini.

| Age | Game idea | Simple interaction |
|---|---|---|
| 2–3 | **Suara di Sekitar** | Hear a sound, tap the matching animal or object. |
| 2–3 | **Beri Makan Hewan** | Drag one large food item to an animal. |
| 3–4 | **Pilah Barang** | Put toys, clothes, and food into matching baskets. |
| 3–4 | **Kenali Perasaan** | Match a spoken situation to a happy, sad, or surprised face. |
| 4–5 | **Urutkan Cerita** | Arrange three pictures: first, next, last. |
| 4–5 | **Ikuti Irama** | Repeat a short sequence of drum taps. |