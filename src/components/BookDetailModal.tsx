import { useState } from 'react';
import { BookOpen, Bookmark, CalendarClock, CheckCircle2, Clock, X } from 'lucide-react';
import type { Book, PublicUser } from '../types/library.ts';
import { BookCover } from './BookCover.tsx';

interface BookDetailModalProps {
  book: Book | null;
  currentUser: PublicUser | null;
  isBookmarked: boolean;
  isAlreadyBorrowed: boolean;
  isAlreadyReserved: boolean;
  onClose: () => void;
  onBorrow: (bookId: string, durationDays: 7 | 14) => Promise<void>;
  onReserve: (bookId: string) => Promise<void>;
  onToggleBookmark: (bookId: string) => Promise<void>;
  onOpenReader: (book: Book) => void;
  onRequireAuth: () => void;
}

export function BookDetailModal({
  book,
  currentUser,
  isBookmarked,
  isAlreadyBorrowed,
  isAlreadyReserved,
  onClose,
  onBorrow,
  onReserve,
  onToggleBookmark,
  onOpenReader,
  onRequireAuth
}: BookDetailModalProps) {
  const [duration, setDuration] = useState<7 | 14>(7);
  const [busy, setBusy] = useState(false);

  if (!book) return null;

  const isAvailable = book.availableCopies > 0;

  async function handleBorrowClick() {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setBusy(true);
    try {
      await onBorrow(book!.id, duration);
    } finally {
      setBusy(false);
    }
  }

  async function handleReserveClick() {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setBusy(true);
    try {
      await onReserve(book!.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EFECE4] bg-[#FFFFFF]/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-xs text-[#57534E]">
            <span className="font-mono font-medium text-[#1C1917]">{book.callNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{book.category}</span>
            <span aria-hidden="true">·</span>
            <span>{book.format}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail koleksi"
            className="flex h-10 w-10 items-center justify-center rounded-md text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[240px_1fr] md:p-8">
          {/* Left column: Cover & Quick Reader */}
          <div className="space-y-4">
            <BookCover book={book} size="lg" />
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReader(book);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Buka di Ruang Baca
            </button>
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onRequireAuth();
                  return;
                }
                onToggleBookmark(book.id);
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                isBookmarked
                  ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F]'
                  : 'border-[#E2DDD3] bg-white text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Tersimpan di Daftar Baca' : 'Simpan ke Daftar Baca'}
            </button>
          </div>

          {/* Right column: Bibliographic Details & Borrowing Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <h2
                id="book-detail-title"
                className="font-display text-2xl font-semibold leading-tight text-[#1C1917] md:text-3xl"
              >
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="mt-1.5 text-base text-[#57534E]">{book.subtitle}</p>
              )}
              <p className="mt-3 text-sm font-medium text-[#1C1917]">Oleh {book.author}</p>

              <p className="mt-4 text-[15px] leading-relaxed text-[#44403C]">{book.synopsis}</p>

              {/* Bibliographic Metadata Definition List */}
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-[#EFECE4] py-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-[#78716C]">Penerbit & Tahun</dt>
                  <dd className="mt-0.5 font-medium text-[#1C1917]">
                    {book.publisher}, <span className="tabular-nums">{book.year}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#78716C]">ISBN</dt>
                  <dd className="mt-0.5 font-mono text-xs text-[#1C1917] tabular-nums">{book.isbn}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#78716C]">Bahasa & Halaman</dt>
                  <dd className="mt-0.5 font-medium text-[#1C1917] tabular-nums">
                    {book.language} · {book.pages} hlm
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#78716C]">Lokasi Rak / Repositori</dt>
                  <dd className="mt-0.5 font-medium text-[#1C1917]">{book.shelfLocation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#78716C]">Ketersediaan Eksemplar</dt>
                  <dd
                    className={`mt-0.5 font-semibold tabular-nums ${
                      isAvailable ? 'text-[#14532D]' : 'text-[#9A3412]'
                    }`}
                  >
                    {isAvailable
                      ? `Tersedia ${book.availableCopies} dari ${book.totalCopies}`
                      : `Sedang dipinjam semua (0/${book.totalCopies})`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#78716C]">Total Dipinjam</dt>
                  <dd className="mt-0.5 font-medium text-[#1C1917] tabular-nums">
                    {book.borrowCount} kali
                  </dd>
                </div>
              </dl>
            </div>

            {/* Borrowing Control Box */}
            <div className="rounded-md border border-[#E2DDD3] bg-[#F8F6F1] p-4">
              {isAlreadyBorrowed ? (
                <div className="flex items-center gap-3 text-sm font-medium text-[#14532D]">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>
                    Koleksi ini sedang tercatat dalam daftar pinjaman aktif Anda. Kelola pengembalian di menu Sirkulasi.
                  </span>
                </div>
              ) : isAvailable ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#44403C]">Pilih Durasi Peminjaman</p>
                    <div className="mt-2 inline-flex rounded-md border border-[#D6D0C4] bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setDuration(7)}
                        className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                          duration === 7
                            ? 'bg-[#1E3A5F] text-white'
                            : 'text-[#57534E] hover:text-[#1C1917]'
                        }`}
                      >
                        7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setDuration(14)}
                        className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                          duration === 14
                            ? 'bg-[#1E3A5F] text-white'
                            : 'text-[#57534E] hover:text-[#1C1917]'
                        }`}
                      >
                        14 Hari
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleBorrowClick}
                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
                  >
                    <CalendarClock className="h-4 w-4" />
                    {busy ? 'Memproses...' : currentUser ? 'Pinjam Koleksi Ini' : 'Masuk untuk Meminjam'}
                  </button>
                </div>
              ) : isAlreadyReserved ? (
                <div className="flex items-center gap-3 text-sm font-medium text-[#1E3A5F]">
                  <Clock className="h-5 w-5 shrink-0" />
                  <span>
                    Anda telah terdaftar pada antrean reservasi untuk judul ini.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#57534E]">
                    Semua eksemplar sedang dipinjam. Masuk antrean reservasi untuk mendapatkan giliran berikutnya.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleReserveClick}
                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#1E3A5F] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white disabled:opacity-60 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    {busy ? 'Mendaftarkan...' : 'Masuk Antrean Reservasi'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
