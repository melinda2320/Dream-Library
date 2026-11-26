import { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Book, LibraryStats, PublicUser } from '../types/library.ts';
import { BookCover } from './BookCover.tsx';

interface HomeViewProps {
  books: Book[];
  stats: LibraryStats | null;
  currentUser: PublicUser | null;
  onNavigate: (tab: 'home' | 'catalog' | 'circulation' | 'reader' | 'librarian') => void;
  onSelectBook: (book: Book) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function HomeView({
  books,
  stats,
  currentUser,
  onNavigate,
  onSelectBook,
  onOpenAuth
}: HomeViewProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const featuredBooks = books.slice(0, 4);

  return (
    <div className="space-y-14 pb-16">
      {/* Institutional Editorial Hero */}
      <section className="border-b border-[#E2DDD3] bg-[#FFFFFF]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="flex flex-col justify-between space-y-6 lg:col-span-6 lg:pr-4">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#57534E]">
                  Repositori Pengetahuan & Layanan Sirkulasi Digital
                </p>
                <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#1C1917] sm:text-5xl">
                  Akses Terbuka ke Koleksi Ilmiah, Sastra, dan Arsip Nusantara
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-[#44403C]">
                  Jelajahi katalog terkurasi lintas disiplin ilmu, kelola peminjaman dan pengembalian buku secara daring, serta baca naskah digital di ruang baca bebas distraksi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#162C49] transition-colors"
                >
                  Jelajahi Katalog Koleksi
                  <ArrowRight className="h-4 w-4" />
                </button>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('circulation')}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-5 py-3 text-sm font-semibold text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                  >
                    Lihat Sirkulasi Saya
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-5 py-3 text-sm font-semibold text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                  >
                    Daftar Anggota Gratis
                  </button>
                )}
              </div>

              <p className="border-t border-[#EFECE4] pt-4 text-xs text-[#57534E]">
                Jam Layanan Digital: 24 Jam · Batas Pinjam: 5 Koleksi / Anggota · Durasi: 7–14 Hari
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="h-72 overflow-hidden rounded-sm border border-[#E2DDD3] bg-[#EFECE4] sm:h-96 lg:h-full lg:min-h-[380px]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_library_hall_1795658418867.jpg"
                    alt="Ruang baca utama Pustaka Nusantara dengan rak kayu dan pencahayaan alami"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EFECE4] p-8 text-center">
                    <BookOpen className="h-10 w-10 text-[#57534E]" />
                    <p className="font-display text-lg text-[#1C1917]">Ruang Baca Pustaka Nusantara</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-Column Operational Metrics Strip */}
          <div className="mt-10 grid grid-cols-2 divide-y divide-[#EFECE4] border-t border-[#E2DDD3] pt-6 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="py-2 sm:pr-6">
              <p className="text-xs text-[#78716C]">Total Judul Koleksi</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
                {stats ? stats.totalTitles : books.length}
              </p>
            </div>
            <div className="py-2 pl-4 sm:px-6">
              <p className="text-xs text-[#78716C]">Eksemplar Tersedia</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#14532D] tabular-nums">
                {stats ? `${stats.availableCopies} / ${stats.totalCopies}` : '-'}
              </p>
            </div>
            <div className="py-2 sm:px-6">
              <p className="text-xs text-[#78716C]">Peminjaman Aktif</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
                {stats ? stats.activeLoans : 0}
              </p>
            </div>
            <div className="py-2 pl-4 sm:pl-6">
              <p className="text-xs text-[#78716C]">Anggota Terdaftar</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
                {stats ? stats.totalMembers : 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Collections */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E2DDD3] pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#1C1917] sm:text-3xl">
              Koleksi Pilihan Bulan Ini
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Edisi monograf, buku riset, dan karya sastra yang siap dipinjam atau dibaca langsung.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#1E3A5F] hover:underline"
          >
            Lihat Seluruh Katalog
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book) => (
            <article
              key={book.id}
              className="group flex flex-col justify-between rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4 transition-colors hover:border-[#C5BEB0]"
            >
              <div>
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="block w-full text-left"
                >
                  <BookCover book={book} />
                </button>
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-[#78716C]">
                  <span>{book.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{book.format}</span>
                </div>
                <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-[#1C1917]">
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="text-left hover:text-[#1E3A5F] transition-colors"
                  >
                    {book.title}
                  </button>
                </h3>
                <p className="mt-1 text-sm text-[#57534E]">{book.author}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#EFECE4] pt-3 text-xs">
                <span
                  className={`font-semibold tabular-nums ${
                    book.availableCopies > 0 ? 'text-[#14532D]' : 'text-[#9A3412]'
                  }`}
                >
                  {book.availableCopies > 0
                    ? `Tersedia ${book.availableCopies}/${book.totalCopies}`
                    : 'Dipinjam Semua'}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="font-semibold text-[#1E3A5F] hover:underline"
                >
                  Detail
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Editorial 3-Step Service Guide */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-6 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
              Tata Cara Peminjaman & Pengembalian Koleksi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
              Seluruh proses sirkulasi tercatat otomatis pada kartu anggota digital Anda tanpa formulir kertas.
            </p>
          </div>

          <div className="mt-8 grid gap-8 border-t border-[#EFECE4] pt-8 md:grid-cols-3">
            <div className="space-y-2">
              <p className="font-mono text-xs font-medium text-[#78716C]">01. Keanggotaan</p>
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                Daftar & Aktivasi Kartu Digital
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Buat akun anggota dengan alamat email aktif untuk memperoleh nomor kartu perpustakaan digital dan akses peminjaman hingga 5 koleksi sekaligus.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs font-medium text-[#78716C]">02. Peminjaman & Antrean</p>
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                Pilih Durasi 7 atau 14 Hari
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Pinjam langsung koleksi yang tersedia atau masuk daftar antrean reservasi jika seluruh eksemplar sedang dipinjam anggota lain.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs font-medium text-[#78716C]">03. Pengembalian & Ruang Baca</p>
              <p className="font-display text-lg font-semibold text-[#1C1917]">
                Perpanjang atau Kembalikan Tepat Waktu
              </p>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Perpanjang masa pinjam satu kali (+7 hari) sebelum jatuh tempo, atau klik Kembalikan Koleksi di menu Sirkulasi setelah selesai membaca.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
