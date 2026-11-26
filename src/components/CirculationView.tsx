import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { daysUntilDue, formatDateId, formatRupiah } from '../lib/api.ts';
import type {
  Book,
  LoanWithDetails,
  PublicUser,
  ReservationWithDetails
} from '../types/library.ts';

interface CirculationViewProps {
  currentUser: PublicUser | null;
  loans: LoanWithDetails[];
  reservations: ReservationWithDetails[];
  books: Book[];
  onReturnLoan: (loanId: string) => Promise<void>;
  onExtendLoan: (loanId: string) => Promise<void>;
  onCancelReservation: (reservationId: string) => Promise<void>;
  onBorrowFromReservation: (bookId: string) => Promise<void>;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateCatalog: () => void;
}

export function CirculationView({
  currentUser,
  loans,
  reservations,
  books,
  onReturnLoan,
  onExtendLoan,
  onCancelReservation,
  onBorrowFromReservation,
  onOpenAuth,
  onNavigateCatalog
}: CirculationViewProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [quickBookId, setQuickBookId] = useState('');
  const [quickDuration, setQuickDuration] = useState<7 | 14>(7);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-8 sm:p-10">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#57534E]">
              Layanan Sirkulasi Anggota
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Peminjaman, Perpanjangan, dan Pengembalian Koleksi
            </h1>
            <p className="text-sm leading-relaxed text-[#57534E]">
              Masuk atau daftarkan akun anggota terlebih dahulu untuk meminjam koleksi, memantau tenggat waktu pengembalian, serta mengelola antrean reservasi Anda.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="whitespace-nowrap rounded-md bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] transition-colors"
            >
              Masuk Anggota
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-5 py-2.5 text-sm font-semibold text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
            >
              Daftar Kartu Anggota Baru
            </button>
          </div>

          <div className="mt-8 grid gap-6 border-t border-[#EFECE4] pt-6 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-[#1C1917]">Kuota Peminjaman</p>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                Maksimal 5 koleksi aktif secara bersamaan untuk setiap anggota terdaftar.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#1C1917]">Perpanjangan Daring</p>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                Dapat diperpanjang 1 kali selama +7 hari sebelum melewati tanggal jatuh tempo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#1C1917]">Ketentuan Keterlambatan</p>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                Denda keterlambatan dihitung otomatis sebesar Rp 2.000 per hari keterlambatan.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeLoans = loans.filter((l) => !l.returnedAt);
  const returnedLoans = loans.filter((l) => Boolean(l.returnedAt));
  const totalEstimatedFines = activeLoans.reduce((sum, l) => sum + l.estimatedFineRp, 0);
  const availableBooks = books.filter(
    (b) => b.availableCopies > 0 && !activeLoans.some((l) => l.bookId === b.id)
  );

  async function runAction(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  }

  async function handleQuickBorrow(e: React.FormEvent) {
    e.preventDefault();
    if (!quickBookId) return;
    setBusyId('quick-borrow');
    try {
      await onBorrowFromReservation(quickBookId);
      setQuickBookId('');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 lg:px-8">
      {/* Member Identity & Circulation Quota Strip */}
      <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFECE4] pb-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E2DDD3] bg-[#F8F6F1] text-[#1E3A5F]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
                Sirkulasi & Peminjaman Saya
              </h1>
              <p className="mt-0.5 text-xs text-[#57534E]">
                {currentUser.name} · Nomor Kartu{' '}
                <span className="font-mono font-medium text-[#1C1917]">{currentUser.memberNumber}</span> ·{' '}
                {currentUser.institution}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateCatalog}
            className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#EFECE4] transition-colors sm:self-auto"
          >
            Cari Koleksi Lain
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-xs text-[#78716C]">Pinjaman Aktif</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
              {activeLoans.length} / 5
            </p>
          </div>
          <div>
            <p className="text-xs text-[#78716C]">Antrean Reservasi</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
              {reservations.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#78716C]">Riwayat Dikembalikan</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
              {returnedLoans.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#78716C]">Estimasi Denda Aktif</p>
            <p
              className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
                totalEstimatedFines > 0 ? 'text-[#9A3412]' : 'text-[#14532D]'
              }`}
            >
              {formatRupiah(totalEstimatedFines)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Self-Checkout Bar */}
      <section className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-6">
        <h2 className="font-display text-lg font-semibold text-[#1C1917]">
          Peminjaman Cepat dari Katalog Tersedia
        </h2>
        <form onSubmit={handleQuickBorrow} className="mt-4 grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <select
              value={quickBookId}
              onChange={(e) => setQuickBookId(e.target.value)}
              aria-label="Pilih buku yang tersedia"
              className="w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
            >
              <option value="">-- Pilih koleksi yang tersedia untuk langsung dipinjam --</option>
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} (Tersedia {b.availableCopies})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <select
              value={quickDuration}
              onChange={(e) => setQuickDuration(Number(e.target.value) === 14 ? 14 : 7)}
              aria-label="Durasi pinjaman"
              className="w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
            >
              <option value={7}>7 Hari</option>
              <option value={14}>14 Hari</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={!quickBookId || busyId === 'quick-borrow' || activeLoans.length >= 5}
              className="w-full whitespace-nowrap rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-50 transition-colors"
            >
              {busyId === 'quick-borrow' ? 'Memproses...' : 'Pinjam Sekarang'}
            </button>
          </div>
        </form>
      </section>

      {/* Active Loans Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
            Peminjaman Aktif & Pengembalian
          </h2>
          <span className="text-xs text-[#57534E] tabular-nums">{activeLoans.length} koleksi</span>
        </div>

        {activeLoans.length === 0 ? (
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] px-6 py-10 text-center">
            <p className="text-sm font-medium text-[#1C1917]">
              Belum ada koleksi yang sedang Anda pinjam saat ini.
            </p>
            <p className="mt-1 text-xs text-[#57534E]">
              Gunakan formulir Peminjaman Cepat di atas atau jelajahi katalog untuk meminjam buku.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#E2DDD3] bg-[#FFFFFF]">
            <div className="divide-y divide-[#EFECE4]">
              {activeLoans.map((loan) => {
                const daysLeft = daysUntilDue(loan.dueDate);
                const isOverdue = loan.computedStatus === 'overdue';
                const isBusy = busyId === loan.id;

                return (
                  <div
                    key={loan.id}
                    className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C]">
                        <span className="font-mono">{loan.bookCallNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{loan.bookFormat}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Dipinjam {formatDateId(loan.borrowedAt)}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                        {loan.bookTitle}
                      </h3>
                      <p className="text-sm text-[#57534E]">{loan.bookAuthor}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[#78716C]">Jatuh Tempo</p>
                        <p className="text-sm font-semibold text-[#1C1917] tabular-nums">
                          {formatDateId(loan.dueDate)}
                        </p>
                        {isOverdue ? (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#9A3412] tabular-nums">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Terlambat {loan.daysOverdue} hari · Denda{' '}
                            {formatRupiah(loan.estimatedFineRp)}
                          </p>
                        ) : (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#14532D] tabular-nums">
                            <Clock className="h-3.5 w-3.5" />
                            Sisa {Math.max(0, daysLeft)} hari lagi
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy || isOverdue || loan.extendedCount >= 1}
                          onClick={() => runAction(loan.id, () => onExtendLoan(loan.id))}
                          title={
                            loan.extendedCount >= 1
                              ? 'Sudah diperpanjang 1 kali'
                              : isOverdue
                                ? 'Pinjaman terlambat tidak dapat diperpanjang'
                                : 'Perpanjang masa pinjam +7 hari'
                          }
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#EFECE4] disabled:opacity-45 transition-colors"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                          {loan.extendedCount >= 1 ? 'Sudah Diperpanjang' : 'Perpanjang +7 Hari'}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => runAction(loan.id, () => onReturnLoan(loan.id))}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#1E3A5F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#162C49] disabled:opacity-50 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {isBusy ? 'Memproses...' : 'Kembalikan Koleksi'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Reservations Queue */}
      {reservations.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
            Antrean Reservasi Anda
          </h2>
          <div className="overflow-hidden rounded-md border border-[#E2DDD3] bg-[#FFFFFF] divide-y divide-[#EFECE4]">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                    {res.bookTitle}
                  </h3>
                  <p className="text-xs text-[#57534E]">
                    {res.bookAuthor} · Didaftarkan {formatDateId(res.createdAt)} ·{' '}
                    <span
                      className={
                        res.bookAvailableCopies > 0
                          ? 'font-semibold text-[#14532D]'
                          : 'text-[#78716C]'
                      }
                    >
                      {res.bookAvailableCopies > 0
                        ? `Tersedia (${res.bookAvailableCopies} eksemplar siap dipinjam)`
                        : 'Menunggu pengembalian'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {res.bookAvailableCopies > 0 && (
                    <button
                      type="button"
                      disabled={busyId === res.id}
                      onClick={() =>
                        runAction(res.id, () => onBorrowFromReservation(res.bookId))
                      }
                      className="whitespace-nowrap rounded-md bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0F3F22]"
                    >
                      Pinjam Sekarang
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === res.id}
                    onClick={() => runAction(res.id, () => onCancelReservation(res.id))}
                    className="whitespace-nowrap rounded-md border border-[#D6D0C4] px-3.5 py-2 text-xs font-semibold text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917]"
                  >
                    Batalkan Antrean
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Return History Ledger */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
          Riwayat Pengembalian Koleksi
        </h2>
        {returnedLoans.length === 0 ? (
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] px-6 py-8 text-center text-sm text-[#57534E]">
            Belum ada riwayat pengembalian yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2DDD3] bg-[#F8F6F1] text-xs font-semibold text-[#57534E]">
                  <th className="px-4 py-3">Judul Koleksi</th>
                  <th className="px-4 py-3">No. Klasifikasi</th>
                  <th className="px-4 py-3">Tgl Pinjam</th>
                  <th className="px-4 py-3">Tgl Kembali</th>
                  <th className="px-4 py-3 text-right">Denda</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE4]">
                {returnedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#FBF9F5]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1C1917]">{loan.bookTitle}</p>
                      <p className="text-xs text-[#78716C]">{loan.bookAuthor}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#57534E]">
                      {loan.bookCallNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#57534E] tabular-nums">
                      {formatDateId(loan.borrowedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#57534E] tabular-nums">
                      {loan.returnedAt ? formatDateId(loan.returnedAt) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-[#1C1917] tabular-nums">
                      {formatRupiah(loan.finePaidRp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#14532D]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Dikembalikan
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
