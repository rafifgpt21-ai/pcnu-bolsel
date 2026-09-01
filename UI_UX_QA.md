# QA UI/UX publik PCNU Bolsel

Tanggal: 28 Agustus 2026.

## Redesign total kartu — versi terbaru

Foto kini selalu berada di atas isi kartu di semua ukuran, tanpa mode foto di samping. Bingkai foto memiliki rasio lanskap yang terjaga, padding pelindung di sudut, dan `object-fit: contain` secara eksplisit pada gambar. Judul panjang tidak dapat mengubah foto menjadi strip vertikal. Kategori dan tanggal berada di atas judul; CTA dengan ikon panah berada di bawah. Grid satu kolom di bawah 700 px dan dua kolom mulai 700 px.

Lebar 320, 375, 390, 428, 640, 699, 700, 768, 1024, 1050, 1100, 1280, 1440, 1536, dan 1920 px sudah diperiksa: tidak ada overflow; setiap foto memakai contain dan seluruh bingkai foto berada di atas judul. Lint berkas yang diubah, typecheck, dan 26 tes lulus. Tes thumbnail kini juga memeriksa kebijakan contain pada markup gambar.

Screenshot pengguna masih memperlihatkan markup lama dengan foto di kanan, sementara respons server port 3001 telah memuat NewsCard. Preview memakai URL baru agar tidak bergantung pada halaman lama yang masih terbuka; tidak ada penambahan rute atau fitur aplikasi.

Build produksi lulus. Smoke test `/?ui=cards-v3#arsip` pada 1000 px memastikan empat foto contain berada di atas judul dan tidak ada overflow.

[Preview kartu terbaru](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/editorial-cards/preview-desktop.jpg) · [Pengukuran 15 lebar](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/editorial-cards/audit.json)

## Riwayat: desain kartu granular

Versi ini menggantikan penyesuaian breakpoint kartu sebelumnya. Komponen `NewsCard` memakai CSS Modules dan container queries: bentuk kartu mengikuti ruang kartu yang tersedia, bukan hanya lebar layar. Grid kembali dua kolom mulai 1024 px, tetapi kartu yang sempit menampilkan foto di atas teks sehingga foto tidak menjadi strip vertikal.

| Lebar kartu | Susunan | Bingkai foto | Judul / padding isi |
| --- | --- | --- | --- |
| < 360 px | Foto di atas | 4:3 | 20 px / 16 px |
| 360–479 px | Foto di atas | 16:10 | 22 px / 20 px |
| 480–639 px | Foto di atas | 16:9 | 24 px / 24 px |
| 640–799 px | Foto di samping teks | 4:3, tinggi independen | 22 px / 24 px |
| ≥ 800 px | Foto di samping teks | 4:3, tinggi independen | 26 px / 28 px |

Ukuran font menggunakan rem. Foto memakai `object-fit: contain`, tanpa pembesaran gambar saat hover. Seluruh judul tetap tersedia; tanggal, kategori, dan tautan artikel tidak berubah. Thumbnail kosong memiliki placeholder yang stabil.

Pengukuran pada 320, 375, 390, 428, 640, 704, 768, 1023, 1024, 1100, 1280, 1440, 1536, dan 1920 px: tidak ada overflow halaman, seluruh gambar memakai `contain`, dan rasio bingkai tetap terjaga. Fixture kartu tanpa thumbnail dan judul panjang pada teks 200% di 320 px juga tidak meluber. Ini tetap pengujian Chromium/emulasi, bukan perangkat fisik.

Lint berkas yang diubah, typecheck, dan build produksi lulus. Total tes kini 26 dalam 8 berkas, termasuk tiga tes baru untuk kartu. Smoke test produksi pada 1100 px memastikan empat kartu memakai foto `contain` tanpa overflow.

[Kartu pada 1100 px](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/granular-cards/1100.jpg) · [Kartu pada 375 px](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/granular-cards/375.jpg) · [Pengukuran 14 lebar](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/granular-cards/audit.json)

## Perbaikan lanjutan: proporsi kartu Beranda

Kartu dua kolom terlalu sempit pada desktop menengah meskipun tidak terjadi overflow. Grid kini memakai satu kolom sampai 1279 px, lalu dua kolom mulai 1280 px. Padding, ukuran judul, porsi thumbnail, dan `sizes` gambar disesuaikan pada breakpoint tersebut; posisi gambar/teks dan isi kartu tetap.

Pemeriksaan pada 375, 768, 1024, 1100, 1279, 1280, 1440, dan 1536 px tidak menemukan overflow. Pada 1100 px, tinggi kartu pertama berkurang dari 681 px menjadi 429 px. Lint berkas Beranda, typecheck, dan 23 tes lulus.

[Screenshot kartu setelah perbaikan pada 1100 px](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/card-fix/after-1100.jpg) · [Pengukuran breakpoint kartu](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/card-fix/audit.json)

Saat memeriksa laporan smooth scrolling, browser melaporkan `prefers-reduced-motion: reduce` aktif. Lenis dinonaktifkan sesuai preferensi tersebut; keputusan untuk mengabaikan preferensi ini menunggu konfirmasi pengguna.

## Lingkup perubahan

Beranda, Jelajah, Tentang Kami, artikel, placeholder Arsip, PDF viewer, dan shell navigasi bersama. Warna hijau, font, urutan bagian, struktur desktop, rute, autentikasi, database, server actions, serta kontrak URL tetap. Tidak menambahkan dependency atau mengubah editor/form admin.

Perbaikan utama: padding dan wrapping mobile, kontras, kontrol sentuh, fokus keyboard, drawer dengan penguncian scroll, Lenis tanpa remount saat resize, reset pencarian, feedback share, serta PDF dengan zoom nyata dan toolbar responsif.

## Pemeriksaan otomatis

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run typecheck` | Lulus |
| `npm test` | 23 tes lulus dalam 7 berkas; baseline 14 tes |
| ESLint seluruh berkas TS/TSX yang diubah dan `lib/ui` | 0 error; 2 warning font lama di root layout |
| `npm run lint` | Masih gagal: 365 error / 12.216 warning; baseline 380 error / 12.222 warning |
| `npm run build` | Lulus; satu warning tracing Turbopack pada rantai konfigurasi/Prisma yang tidak diubah |
| `git diff --check` | Lulus |

Lint seluruh repositori mencakup artefak `.next-validation` dan masalah source lama di luar lingkup perubahan. Konfigurasi lint tidak diubah untuk menyembunyikan masalah tersebut. Warning build tidak dibandingkan dengan build baseline; sumber pada import trace berada di luar perubahan ini.

## Pemeriksaan browser

Server PCNU menggunakan port **3001**. Port 3000 menjalankan aplikasi lain dan tidak digunakan untuk audit.

- Screenshot sebelum/sesudah pada 320, 375, 390, 428, 768, 1024, dan 1440 px untuk enam halaman publik, ditambah komponen PDF pada fixture terpisah.
- 42 pengukuran halaman publik: tidak ada lebar dokumen melebihi viewport. Lebar aktual diperiksa pada setiap pengambilan final.
- Batas 639/640, 767/769, dan 1023/1025 px diperiksa. Menu mobile hilang pada desktop, dan drawer terbuka ditutup ketika viewport mencapai 1024 px.
- Header terukur 80 px. Target anchor Beranda berhenti pada posisi 96 px, yaitu 16 px di bawah header.
- Menu: buka/tutup, Escape, Tab/Shift+Tab, pengembalian fokus, navigasi, dan pelepasan scroll lock diperiksa.
- Pencarian: submit, hasil kosong, reset search/category sekaligus dengan parameter lain tetap, serta kembali melalui history tanpa input terkunci diperiksa.
- Produksi: tujuh rute merespons HTTP 200; enam halaman publik pada landscape 844 × 390 px tidak mengalami overflow halaman.
- Screenshot produksi tambahan untuk hero, Jelajah, profil, artikel, menu, dan landscape. Screenshot baseline landscape tidak diambil.

## Fixture komponen

Fixture lokal memakai komponen proyek yang sebenarnya, dengan adaptor routing/gambar untuk menjalankannya di Vite. Fixture bukan rute aplikasi publik dan tidak dimasukkan ke source aplikasi. Tidak mengubah database atau melewati otorisasi PDF.

- PDF empat halaman lokal: loading/render, fit awal 100% pada mobile, zoom 110% memperbesar canvas, scroll horizontal hanya di area dokumen, pencarian 18 kecocokan, navigasi hasil, lompat halaman, validasi nomor halaman, serta kegagalan dan retry.
- Toolbar PDF: tidak ada kontrol terpotong pada tujuh lebar target dan landscape; tetap dapat diakses ketika ukuran teks dasar 200%.
- Artikel tanpa thumbnail dengan judul, tag, dan tautan panjang; teks 200%; kegagalan clipboard; pembatalan native share tanpa error.
- Skeleton Jelajah pada 320 px tidak meluber.
- Simulasi media query untuk Lenis/reduced motion: scroll native pada mode sentuh/reduced motion; form tidak remount saat resize; Lenis berhenti saat drawer terbuka.
- Akses PDF tidak sah tetap ditolak pada rute aplikasi sebenarnya. Data publik saat audit tidak menyediakan blok PDF untuk pengujian viewer terotorisasi secara end-to-end.

## Batas verifikasi dan tindak lanjut

- Browser yang tersedia adalah Chromium dengan emulasi viewport. **Chrome Android, Safari iOS, keyboard virtual, safe area perangkat fisik, dan rotasi perangkat nyata belum diverifikasi.** Landscape diuji dengan perubahan ukuran viewport.
- Reduced motion dan teks 200% diuji melalui fixture; belum diuji menggunakan pengaturan OS/peramban pada perangkat nyata. Pengumuman live region diperiksa melalui DOM, bukan screen reader fisik.
- Smoke test admin terbatas pada form login yang tidak masuk scope styling publik dan mempertahankan isian setelah resize. Dashboard, editor, menu akun terautentikasi, dan workflow penyimpanan belum diuji setelah login karena tidak tersedia sesi admin.
- Nama pengurus pada data saat ini tetap tampil dengan wrapping; belum memasukkan data pengurus sintetis ke aplikasi.
- Sebelum rilis, lakukan pengujian perangkat nyata dan smoke test dengan sesi admin yang sah. Tidak ada deployment atau migrasi pada pekerjaan ini.

## Bukti lokal

[Indeks screenshot sebelum/sesudah dan log](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/README.md)

[Preview Beranda mobile](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/after/home-mobile-production.jpg) · [PDF 320 px](C:/Users/rafif/AppData/Local/Temp/pcnu-public-ui-qa/after/pdf-viewer-320.jpg)

Artefak besar dan salinan fixture disimpan di folder temporary lokal, bukan di Git. Salin folder bukti bila dibutuhkan untuk arsip jangka panjang.
