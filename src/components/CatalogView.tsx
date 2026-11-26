import { useMemo, useState } from 'react';
import { Bookmark, Search, RotateCcw } from 'lucide-react';
import type {
  Book,
  CollectionCategory,
  CollectionFormat,
  PublicUser
} from '../types/library.ts';
import { BookCover } from './BookCover.tsx';

interface CatalogViewProps {
  books: Book[];
  bookmarks: string[];
  currentUser: PublicUser | null;
  onSelectBook: (book: Book) => void;
  onToggleBookmark: (bookId: string) => Promise<void>;
  onRequireAuth: () => void;
}

const CATEGORIES: Array<'Semua' | CollectionCategory> = [
  'Semua',
  'Sejarah & Budaya',
  'Arsitektur & Desain',
  'Teknologi & Komputasi',
  'Sastra & Fiksi',
  'Ekonomi & Kebijakan',
  'Sains & Ekologi'
];

const FORMATS: Array<'Semua Format' | CollectionFormat> = [
  'Semua Format',
  'Buku Cetak',
  'E-Book',
  'Jurnal Digital',
  'Arsip Langka'
];

export function CatalogView({
  books,
  bookmarks,
  currentUser,
  onSelectBook,
  onToggleBookmark,
  onRequireAuth
}: CatalogViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | CollectionCategory>('Semua');
  const [selectedFormat, setSelectedFormat] = useState<'Semua Format' | CollectionFormat>(
    'Semua Format'
  );
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'popular'>('newest');

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = books.filter((b) => {
      if (selectedCategory !== 'Semua' && b.category !== selectedCategory) return false;
      if (selectedFormat !== 'Semua Format' && b.format !== selectedFormat) return false;
      if (onlyAvailable && b.availableCopies < 1) return false;
      if (q) {
        const hay = `${b.title} ${b.subtitle ?? ''} ${b.author} ${b.isbn} ${b.callNumber} ${b.publisher}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'id');
      if (sortBy === 'popular') return b.borrowCount - a.borrowCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, query, selectedCategory, selectedFormat, onlyAvailable, sortBy]);

  function resetFilters() {
    setQuery('');
    setSelectedCategory('Semua');
    setSelectedFormat('Semua Format');
    setOnlyAvailable(false);
    setSortBy('newest');
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="border-b border-[#E2DDD3] pb-6">
        <h1 className="font-display text-3xl font-semibold text-[#1C1917] sm:text-4xl">
          Katalog Koleksi Perpustakaan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
          Telusuri buku cetak, e-book, jurnal digital, dan arsip naskah berdasarkan judul, pengarang, ISBN, atau nomor klasifikasi Dewey.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, pengarang, ISBN, atau no. klasifikasi..."
              aria-label="Cari koleksi perpustakaan"
              className="w-full rounded-md border border-[#D6D0C4] bg-[#FFFFFF] py-2.5 pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'Semua Format' | CollectionFormat)}
              aria-label="Filter format koleksi"
              className="w-full rounded-md border border-[#D6D0C4] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
            >
              {FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'popular')}
              aria-label="Urutkan koleksi"
              className="w-full rounded-md border border-[#D6D0C4] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
            >
              <option value="newest">Terbaru Ditambahkan</option>
              <option value="popular">Paling Sering Dipinjam</option>
              <option value="title">Judul A–Z</option>
            </select>
          </div>

          <div className="flex items-center lg:col-span-2">
            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`w-full whitespace-nowrap rounded-md border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                onlyAvailable
                  ? 'border-[#14532D] bg-[#14532D] text-white'
                  : 'border-[#D6D0C4] bg-white text-[#44403C] hover:bg-[#F8F6F1]'
              }`}
            >
              {onlyAvailable ? 'Hanya Tersedia ✓' : 'Semua Ketersediaan'}
            </button>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-[#EFECE4] text-[#44403C] hover:bg-[#E5E0D5] hover:text-[#1C1917]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-5 flex items-center justify-between text-xs text-[#57534E]">
        <span className="tabular-nums">
          Menampilkan <strong className="text-[#1C1917]">{filteredBooks.length}</strong> dari{' '}
          {books.length} koleksi
        </span>
        {(query || selectedCategory !== 'Semua' || selectedFormat !== 'Semua Format' || onlyAvailable) && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 font-semibold text-[#1E3A5F] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Catalog Grid or Empty State */}
      {filteredBooks.length === 0 ? (
        <div className="mt-10 rounded-md border border-[#E2DDD3] bg-[#FFFFFF] px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-[#1C1917]">
            Tidak ada koleksi yang sesuai dengan pencarian Anda
          </p>
          <p className="mt-2 text-sm text-[#57534E]">
            Coba ubah kata kunci pencarian atau setel ulang filter kategori dan format.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162C49]"
          >
            Tampilkan Semua Koleksi
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => {
            const isBookmarked = bookmarks.includes(book.id);
            const isAvailable = book.availableCopies > 0;
            return (
              <article
                key={book.id}
                className="flex flex-col justify-between rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-4 transition-colors hover:border-[#C5BEB0]"
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
                    <span className="font-mono text-[11px]">{book.callNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.format}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{book.year}</span>
                  </div>

                  <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug text-[#1C1917]">
                    <button
                      type="button"
                      onClick={() => onSelectBook(book)}
                      className="text-left hover:text-[#1E3A5F] transition-colors"
                    >
                      {book.title}
                    </button>
                  </h2>

                  <p className="mt-1 text-sm text-[#57534E]">{book.author}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#78716C]">
                    {book.synopsis}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#EFECE4] pt-3">
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isAvailable ? 'text-[#14532D]' : 'text-[#9A3412]'
                    }`}
                  >
                    {isAvailable
                      ? `Tersedia ${book.availableCopies}/${book.totalCopies}`
                      : 'Habis Dipinjam'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth();
                          return;
                        }
                        onToggleBookmark(book.id);
                      }}
                      aria-label={isBookmarked ? 'Hapus dari daftar baca' : 'Simpan ke daftar baca'}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                        isBookmarked
                          ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F]'
                          : 'border-[#E2DDD3] text-[#78716C] hover:text-[#1C1917]'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectBook(book)}
                      className="whitespace-nowrap rounded-md bg-[#1E3A5F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#162C49] transition-colors"
                    >
                      {isAvailable ? 'Detail & Pinjam' : 'Detail / Antre'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
