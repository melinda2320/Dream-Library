import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import { api, ApiError, formatDateId, formatRupiah } from '../lib/api.ts';
import type {
  Book,
  CollectionCategory,
  CollectionFormat,
  LibraryStats,
  LoanWithDetails,
  PublicUser
} from '../types/library.ts';

interface LibrarianViewProps {
  token: string | null;
  currentUser: PublicUser | null;
  books: Book[];
  onRefreshCatalog: () => Promise<void>;
  onOpenLibrarianAuth: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
}

const CATEGORIES: CollectionCategory[] = [
  'Sejarah & Budaya',
  'Arsitektur & Desain',
  'Teknologi & Komputasi',
  'Sastra & Fiksi',
  'Ekonomi & Kebijakan',
  'Sains & Ekologi'
];

const FORMATS: CollectionFormat[] = [
  'Buku Cetak',
  'E-Book',
  'Jurnal Digital',
  'Arsip Langka'
];

export function LibrarianView({
  token,
  currentUser,
  books,
  onRefreshCatalog,
  onOpenLibrarianAuth,
  onNotify
}: LibrarianViewProps) {
  const [subTab, setSubTab] = useState<'collections' | 'circulation' | 'members'>('collections');
  const [overview, setOverview] = useState<{
    stats: LibraryStats;
    loans: LoanWithDetails[];
    members: PublicUser[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Add/Edit Book Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isbn, setIsbn] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [category, setCategory] = useState<CollectionCategory>('Sejarah & Budaya');
  const [format, setFormat] = useState<CollectionFormat>('Buku Cetak');
  const [pages, setPages] = useState(250);
  const [shelfLocation, setShelfLocation] = useState('Lantai 1 · Rak A-01');
  const [totalCopies, setTotalCopies] = useState(3);
  const [coverTone, setCoverTone] = useState<Book['coverTone']>('ivory');
  const [synopsis, setSynopsis] = useState('');
  const [sampleParagraph, setSampleParagraph] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadOverview() {
    if (!token || currentUser?.role !== 'librarian') return;
    setLoading(true);
    try {
      const data = await api.getAdminOverview(token);
      setOverview({ stats: data.stats, loans: data.loans, members: data.members });
    } catch (err) {
      onNotify(
        err instanceof ApiError ? err.message : 'Gagal memuat ringkasan pustakawan.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, [token, currentUser?.role]);

  if (!currentUser || currentUser.role !== 'librarian' || !token) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E2DDD3] bg-[#F8F6F1] text-[#1E3A5F]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
                Panel Pengelolaan Pustakawan
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                Bagian ini digunakan oleh Pustakawan untuk menambah, menyunting, dan menghapus data koleksi, memantau seluruh sirkulasi peminjaman anggota, serta memverifikasi pengembalian buku.
              </p>
              <button
                type="button"
                onClick={onOpenLibrarianAuth}
                className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Masuk / Aktivasi Akun Pustakawan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function openNewBookModal() {
    setEditingBook(null);
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setPublisher('');
    setYear(new Date().getFullYear());
    setIsbn('');
    setCallNumber('');
    setCategory('Sejarah & Budaya');
    setFormat('Buku Cetak');
    setPages(240);
    setShelfLocation('Lantai 1 · Rak A-01');
    setTotalCopies(3);
    setCoverTone('ivory');
    setSynopsis('');
    setSampleParagraph('');
    setFormOpen(true);
  }

  function openEditBookModal(book: Book) {
    setEditingBook(book);
    setTitle(book.title);
    setSubtitle(book.subtitle ?? '');
    setAuthor(book.author);
    setPublisher(book.publisher);
    setYear(book.year);
    setIsbn(book.isbn);
    setCallNumber(book.callNumber);
    setCategory(book.category);
    setFormat(book.format);
    setPages(book.pages);
    setShelfLocation(book.shelfLocation);
    setTotalCopies(book.totalCopies);
    setCoverTone(book.coverTone);
    setSynopsis(book.synopsis);
    setSampleParagraph('');
    setFormOpen(true);
  }

  async function handleSaveBook(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingBook) {
        await api.updateBook(token, editingBook.id, {
          title,
          subtitle,
          author,
          publisher,
          year: Number(year),
          isbn,
          callNumber,
          category,
          format,
          shelfLocation,
          totalCopies: Number(totalCopies),
          synopsis
        });
        onNotify('Data koleksi berhasil diperbarui.');
      } else {
        await api.createBook(token, {
          title,
          subtitle,
          author,
          publisher,
          year: Number(year),
          isbn,
          callNumber,
          category,
          format,
          language: 'Indonesia',
          pages: Number(pages),
          shelfLocation,
          totalCopies: Number(totalCopies),
          coverTone,
          synopsis,
          sampleParagraph
        });
        onNotify('Koleksi baru berhasil ditambahkan ke katalog.');
      }
      setFormOpen(false);
      await onRefreshCatalog();
      await loadOverview();
    } catch (err) {
      onNotify(err instanceof ApiError ? err.message : 'Gagal menyimpan koleksi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBook(book: Book) {
    if (!token) return;
    try {
      await api.deleteBook(token, book.id);
      onNotify(`Koleksi "${book.title}" telah dihapus.`);
      await onRefreshCatalog();
      await loadOverview();
    } catch (err) {
      onNotify(err instanceof ApiError ? err.message : 'Gagal menghapus koleksi.', 'error');
    }
  }

  async function handleAdminReturn(loanId: string) {
    if (!token) return;
    try {
      await api.returnLoan(token, loanId);
      onNotify('Pengembalian koleksi berhasil diverifikasi.');
      await onRefreshCatalog();
      await loadOverview();
    } catch (err) {
      onNotify(err instanceof ApiError ? err.message : 'Gagal memproses pengembalian.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E2DDD3] pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
            Panel Pengelolaan Pustakawan
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            Kelola katalog koleksi, verifikasi pengembalian pinjaman anggota, dan pantau statistik perpustakaan.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewBookModal}
          className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] transition-colors sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Koleksi Baru
        </button>
      </div>

      {/* Stats Grid */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4">
            <p className="text-xs text-[#78716C]">Total Judul</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
              {overview.stats.totalTitles}
            </p>
          </div>
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4">
            <p className="text-xs text-[#78716C]">Eksemplar Tersedia</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#14532D] tabular-nums">
              {overview.stats.availableCopies} / {overview.stats.totalCopies}
            </p>
          </div>
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4">
            <p className="text-xs text-[#78716C]">Peminjaman Aktif</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1C1917] tabular-nums">
              {overview.stats.activeLoans}
            </p>
          </div>
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4">
            <p className="text-xs text-[#78716C]">Melewati Jatuh Tempo</p>
            <p
              className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
                overview.stats.overdueLoans > 0 ? 'text-[#9A3412]' : 'text-[#1C1917]'
              }`}
            >
              {overview.stats.overdueLoans}
            </p>
          </div>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="inline-flex rounded-md bg-[#EFECE4] p-1">
        <button
          type="button"
          onClick={() => setSubTab('collections')}
          className={`whitespace-nowrap rounded px-4 py-2 text-xs font-semibold transition-colors ${
            subTab === 'collections'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Daftar Koleksi ({books.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('circulation')}
          className={`whitespace-nowrap rounded px-4 py-2 text-xs font-semibold transition-colors ${
            subTab === 'circulation'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Semua Sirkulasi ({overview?.loans.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('members')}
          className={`whitespace-nowrap rounded px-4 py-2 text-xs font-semibold transition-colors ${
            subTab === 'members'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Direktori Anggota ({overview?.members.length ?? 0})
        </button>
      </div>

      {/* Collections Management Table */}
      {subTab === 'collections' && (
        <div className="overflow-x-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2DDD3] bg-[#F8F6F1] text-xs font-semibold text-[#57534E]">
                <th className="px-4 py-3">Judul & Pengarang</th>
                <th className="px-4 py-3">Klasifikasi / ISBN</th>
                <th className="px-4 py-3">Kategori & Format</th>
                <th className="px-4 py-3 text-right">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE4]">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-[#FBF9F5]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1C1917]">{book.title}</p>
                    <p className="text-xs text-[#78716C]">{book.author}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-[#1C1917]">{book.callNumber}</p>
                    <p className="font-mono text-[11px] text-[#78716C]">{book.isbn}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#57534E]">
                    <p>{book.category}</p>
                    <p className="text-[#78716C]">{book.format}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium tabular-nums">
                    {book.availableCopies} / {book.totalCopies}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditBookModal(book)}
                        aria-label={`Edit ${book.title}`}
                        className="rounded p-2 text-[#57534E] hover:bg-[#EFECE4] hover:text-[#1C1917]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBook(book)}
                        aria-label={`Hapus ${book.title}`}
                        className="rounded p-2 text-[#9A3412] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Circulation Table */}
      {subTab === 'circulation' && (
        <div className="overflow-x-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF]">
          {loading ? (
            <p className="p-6 text-sm text-[#57534E]">Memuat data sirkulasi...</p>
          ) : !overview || overview.loans.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#57534E]">
              Belum ada transaksi peminjaman tercatat.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2DDD3] bg-[#F8F6F1] text-xs font-semibold text-[#57534E]">
                  <th className="px-4 py-3">Peminjam</th>
                  <th className="px-4 py-3">Koleksi</th>
                  <th className="px-4 py-3">Tgl Pinjam / Tempo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE4]">
                {overview.loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#FBF9F5]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1C1917]">{loan.userName}</p>
                      <p className="font-mono text-xs text-[#78716C]">{loan.userMemberNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1C1917]">{loan.bookTitle}</p>
                      <p className="font-mono text-xs text-[#78716C]">{loan.bookCallNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#57534E] tabular-nums">
                      <p>Pinjam: {formatDateId(loan.borrowedAt)}</p>
                      <p>Tempo: {formatDateId(loan.dueDate)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {loan.computedStatus === 'returned' ? (
                        <span className="inline-flex items-center gap-1 text-[#14532D]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Dikembalikan ({formatRupiah(loan.finePaidRp)})
                        </span>
                      ) : loan.computedStatus === 'overdue' ? (
                        <span className="text-[#9A3412]">
                          Terlambat {loan.daysOverdue} hr ({formatRupiah(loan.estimatedFineRp)})
                        </span>
                      ) : (
                        <span className="text-[#1E3A5F]">Sedang Dipinjam</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!loan.returnedAt && (
                        <button
                          type="button"
                          onClick={() => handleAdminReturn(loan.id)}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162C49]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Konfirmasi Kembali
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members Directory */}
      {subTab === 'members' && (
        <div className="overflow-x-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF]">
          {!overview || overview.members.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#57534E]">
              Belum ada anggota yang mendaftar.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2DDD3] bg-[#F8F6F1] text-xs font-semibold text-[#57534E]">
                  <th className="px-4 py-3">Nomor Kartu</th>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Institusi</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE4]">
                {overview.members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FBF9F5]">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#1C1917]">
                      {m.memberNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1C1917]">{m.name}</td>
                    <td className="px-4 py-3 text-xs text-[#57534E]">{m.email}</td>
                    <td className="px-4 py-3 text-xs text-[#57534E]">{m.institution}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#1E3A5F]">
                      {m.role === 'librarian' ? 'Pustakawan' : 'Anggota'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#78716C] tabular-nums">
                      {formatDateId(m.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EFECE4] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                {editingBook ? 'Sunting Data Koleksi' : 'Tambah Koleksi Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded text-[#57534E] hover:bg-[#F8F6F1]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#44403C]">Judul Koleksi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#44403C]">Subjudul (Opsional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Pengarang</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Penerbit</label>
                <input
                  type="text"
                  required
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">ISBN</label>
                <input
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="978-602-..."
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">No. Klasifikasi (DDC)</label>
                <input
                  type="text"
                  required
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                  placeholder="004.36 PRA a"
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CollectionCategory)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as CollectionFormat)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Tahun Terbit</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Jumlah Eksemplar</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#44403C]">Lokasi Rak</label>
                <input
                  type="text"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              {!editingBook && (
                <div>
                  <label className="block text-xs font-semibold text-[#44403C]">Warna Sampul</label>
                  <select
                    value={coverTone}
                    onChange={(e) => setCoverTone(e.target.value as Book['coverTone'])}
                    className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                  >
                    <option value="ivory">Kertas Gading</option>
                    <option value="lapis">Biru Lapis</option>
                    <option value="forest">Hijau Hutan</option>
                    <option value="terracotta">Terakota</option>
                    <option value="charcoal">Arang Klasik</option>
                    <option value="stone">Batu Kapur</option>
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#44403C]">Sinopsis</label>
                <textarea
                  rows={3}
                  required
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                />
              </div>
              {!editingBook && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#44403C]">
                    Paragraf Pratinjau Ruang Baca (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={sampleParagraph}
                    onChange={(e) => setSampleParagraph(e.target.value)}
                    placeholder="Kutipan bab pembuka untuk ditampilkan di Ruang Baca Digital..."
                    className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-[#EFECE4] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-md border border-[#D6D0C4] px-4 py-2 text-sm font-medium text-[#57534E] hover:bg-[#F8F6F1]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-[#1E3A5F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : editingBook ? 'Simpan Perubahan' : 'Tambahkan Koleksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
