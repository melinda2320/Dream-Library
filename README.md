# Pustaka Nusantara — Sistem Perpustakaan Digital

Aplikasi web perpustakaan digital full-stack berbasis **React + TypeScript + Tailwind CSS + Express** yang siap diunggah ke GitHub dan dijalankan secara lokal maupun produksi.

## Fitur Utama

1. **Beranda & Ringkasan Operasional**
   - Statistik real-time jumlah judul koleksi, eksemplar tersedia, peminjaman aktif, dan anggota terdaftar.
   - Koleksi pilihan dan panduan tata cara peminjaman serta pengembalian.

2. **Katalog Koleksi Lengkap**
   - Pencarian langsung berdasarkan judul, pengarang, penerbit, ISBN, dan nomor klasifikasi Dewey (DDC).
   - Filter kategori disiplin ilmu, format koleksi (`Buku Cetak`, `E-Book`, `Jurnal Digital`, `Arsip Langka`), filter ketersediaan, serta pengurutan.
   - Kartu detail bibliografi lengkap dengan status stok eksemplar.

3. **Keanggotaan (Daftar, Masuk & Akses Pustakawan)**
   - Pendaftaran anggota baru dengan pembuatan Nomor Kartu Anggota otomatis (`PN-YYYY-XXXX`).
   - Kata sandi di-hash aman di sisi server menggunakan `crypto.scrypt` dengan salt acak dan token sesi bertanda tangan HMAC-SHA256.
   - Mendukung aktivasi akun Pustakawan pertama secara langsung melalui antarmuka atau melalui `ADMIN_PASSCODE` pada variabel lingkungan server.

4. **Sirkulasi Peminjaman & Pengembalian**
   - Peminjaman koleksi dengan pilihan durasi **7 hari** atau **14 hari** (maksimal 5 koleksi aktif per anggota).
   - Pengembalian koleksi daring dengan perhitungan otomatis denda keterlambatan (`Rp 2.000 / hari`).
   - Perpanjangan masa pinjam satu kali (`+7 hari`) sebelum jatuh tempo.
   - Antrean reservasi otomatis saat stok eksemplar sedang dipinjam semua.
   - Riwayat peminjaman dan pengembalian lengkap.

5. **Ruang Baca Digital & Daftar Bacaan**
   - Pembaca teks digital dengan pilihan ukuran huruf, tema kertas (`Hangat`, `Putih`, `Sepia`), navigasi bab, serta penyimpanan bookmark per anggota.

6. **Panel Pengelolaan Pustakawan**
   - Tambah, sunting, dan hapus data koleksi perpustakaan.
   - Pantau seluruh transaksi sirkulasi anggota dan verifikasi pengembalian buku.
   - Lihat direktori anggota terdaftar.

---

## Struktur Direktori

```text
├── server.ts                  # Entry point server Express + Vite middleware
├── server/
│   ├── auth.ts                # Hashing scrypt & penandatanganan token sesi HMAC
│   ├── seed.ts                # Data awal 12 koleksi perpustakaan & bab bacaan
│   └── store.ts               # Penyimpanan persisten JSON atomik (data/library.json)
├── src/
│   ├── App.tsx                # Root aplikasi & navigasi utama
│   ├── index.css              # Konfigurasi tema Tailwind v4
│   ├── lib/api.ts             # Klien REST API & utilitas format tanggal/rupiah
│   ├── types/library.ts       # Definisi tipe TypeScript bersama
│   └── components/
│       ├── AuthModal.tsx
│       ├── BookCover.tsx
│       ├── BookDetailModal.tsx
│       ├── CatalogView.tsx
│       ├── CirculationView.tsx
│       ├── HomeView.tsx
│       ├── LibrarianView.tsx
│       └── ReaderView.tsx
├── .env.example               # Template variabel lingkungan
└── package.json
```

---

## Menjalankan Secara Lokal

Pastikan **Node.js v20+** (disarankan v22+) sudah terpasang.

```bash
# 1. Instal dependensi
npm install

# 2. Salin konfigurasi lingkungan (opsional)
cp .env.example .env

# 3. Jalankan mode pengembangan (port 3000)
npm run dev
```

Buka browser dan kunjungi `http://localhost:3000`.

### Build Produksi

```bash
npm run build
npm start
```

---

## Cara Mengunggah ke GitHub

File `.gitignore` sudah dikonfigurasi agar `node_modules/`, `dist/`, `.env*`, dan `data/library.json` (data runtime) tidak ikut terunggah ke repositori.

```bash
git init
git add .
git commit -m "Initial commit: Sistem Perpustakaan Digital Pustaka Nusantara"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORI.git
git push -u origin main
```
