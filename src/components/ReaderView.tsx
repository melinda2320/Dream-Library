import { useEffect, useState } from 'react';
import { Bookmark, BookOpen } from 'lucide-react';
import type { Book, PublicUser } from '../types/library.ts';

interface ReaderViewProps {
  books: Book[];
  bookmarks: string[];
  activeBook: Book | null;
  currentUser: PublicUser | null;
  onSelectBook: (book: Book) => void;
  onToggleBookmark: (bookId: string) => Promise<void>;
  onRequireAuth: () => void;
}

export function ReaderView({
  books,
  bookmarks,
  activeBook,
  currentUser,
  onSelectBook,
  onToggleBookmark,
  onRequireAuth
}: ReaderViewProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(activeBook ?? books[0] ?? null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [paperTheme, setPaperTheme] = useState<'warm' | 'white' | 'sepia'>('warm');

  useEffect(() => {
    if (activeBook) {
      setSelectedBook(activeBook);
      setChapterIdx(0);
    } else if (!selectedBook && books.length > 0) {
      setSelectedBook(books[0]);
      setChapterIdx(0);
    }
  }, [activeBook, books, selectedBook]);

  const current = selectedBook ?? books[0];
  if (!current) return null;

  const chapters = current.chapters.length > 0
    ? current.chapters
    : [
        {
          number: 'Ringkasan',
          title: 'Sinopsis Koleksi',
          paragraphs: [current.synopsis]
        }
      ];

  const activeChapter = chapters[chapterIdx] ?? chapters[0];
  const isBookmarked = bookmarks.includes(current.id);
  const bookmarkedBooks = books.filter((b) => bookmarks.includes(b.id));

  const paperStyles =
    paperTheme === 'sepia'
      ? 'bg-[#F4ECD8] text-[#2C2416] border-[#DFD2B5]'
      : paperTheme === 'white'
        ? 'bg-[#FFFFFF] text-[#1C1917] border-[#E2DDD3]'
        : 'bg-[#FBF9F5] text-[#1C1917] border-[#E2DDD3]';

  const proseSize =
    fontSize === 'sm'
      ? 'text-[16px] leading-[1.75]'
      : fontSize === 'lg'
        ? 'text-[20px] leading-[1.85]'
        : 'text-[18px] leading-[1.8]';

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar: Bookmarks & Readable Catalog */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-5">
            <div className="flex items-center justify-between border-b border-[#EFECE4] pb-3">
              <h2 className="font-display text-lg font-semibold text-[#1C1917]">
                Daftar Bacaan Tersimpan
              </h2>
              <span className="text-xs text-[#78716C] tabular-nums">{bookmarkedBooks.length}</span>
            </div>

            {!currentUser ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs leading-relaxed text-[#57534E]">
                  Masuk sebagai anggota untuk menyimpan koleksi favorit ke daftar bacaan pribadi Anda.
                </p>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="text-xs font-semibold text-[#1E3A5F] hover:underline"
                >
                  Masuk / Daftar Anggota
                </button>
              </div>
            ) : bookmarkedBooks.length === 0 ? (
              <p className="mt-4 text-xs leading-relaxed text-[#57534E]">
                Belum ada judul yang disimpan. Klik ikon penanda pada katalog untuk menyimpannya di sini.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#EFECE4]">
                {bookmarkedBooks.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(item);
                        setChapterIdx(0);
                      }}
                      className={`block w-full text-left text-sm font-medium transition-colors ${
                        item.id === current.id
                          ? 'text-[#1E3A5F] font-semibold'
                          : 'text-[#1C1917] hover:text-[#1E3A5F]'
                      }`}
                    >
                      {item.title}
                    </button>
                    <p className="mt-0.5 text-xs text-[#78716C]">{item.author}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-5">
            <h2 className="border-b border-[#EFECE4] pb-3 font-display text-lg font-semibold text-[#1C1917]">
              Pilih Koleksi untuk Dibaca
            </h2>
            <ul className="mt-3 max-h-96 divide-y divide-[#EFECE4] overflow-y-auto pr-1">
              {books.map((item) => (
                <li key={item.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBook(item);
                      setChapterIdx(0);
                    }}
                    className={`block w-full text-left transition-colors ${
                      item.id === current.id ? 'text-[#1E3A5F]' : 'text-[#1C1917] hover:text-[#1E3A5F]'
                    }`}
                  >
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#78716C]">
                      {item.format} · {item.author}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Editorial Reading Canvas */}
        <article className={`rounded-md border p-6 sm:p-10 lg:col-span-8 ${paperStyles}`}>
          {/* Reader Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-current/10 pb-4">
            <div className="flex items-center gap-2 text-xs opacity-75">
              <BookOpen className="h-4 w-4" />
              <span className="font-mono">{current.callNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{current.format}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded border border-current/15 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`rounded px-2 py-1 ${
                    fontSize === 'sm' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('md')}
                  className={`rounded px-2 py-1 ${
                    fontSize === 'md' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`rounded px-2 py-1 ${
                    fontSize === 'lg' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  A+
                </button>
              </div>

              <div className="inline-flex rounded border border-current/15 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaperTheme('warm')}
                  className={`rounded px-2.5 py-1 ${
                    paperTheme === 'warm' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  Hangat
                </button>
                <button
                  type="button"
                  onClick={() => setPaperTheme('white')}
                  className={`rounded px-2.5 py-1 ${
                    paperTheme === 'white' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  Putih
                </button>
                <button
                  type="button"
                  onClick={() => setPaperTheme('sepia')}
                  className={`rounded px-2.5 py-1 ${
                    paperTheme === 'sepia' ? 'bg-[#1E3A5F] text-white' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  Sepia
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onRequireAuth();
                    return;
                  }
                  onToggleBookmark(current.id);
                }}
                className="inline-flex items-center gap-1.5 rounded border border-current/20 px-3 py-1 text-xs font-medium hover:bg-black/5"
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Tersimpan' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Reading Header */}
          <header className="mt-8 border-b border-current/10 pb-6">
            <p className="text-xs font-semibold tracking-widest uppercase opacity-65">
              {current.category} · {current.publisher} ({current.year})
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {current.title}
            </h1>
            {current.subtitle && (
              <p className="mt-2 text-base opacity-80">{current.subtitle}</p>
            )}
            <p className="mt-3 text-sm font-medium opacity-85">Oleh {current.author}</p>
          </header>

          {/* Chapter Navigation */}
          {chapters.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2 border-b border-current/10 pb-4">
              {chapters.map((ch, idx) => (
                <button
                  key={`${ch.number}-${idx}`}
                  type="button"
                  onClick={() => setChapterIdx(idx)}
                  className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    idx === chapterIdx
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-black/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  {ch.number}: {ch.title}
                </button>
              ))}
            </div>
          )}

          {/* Editorial Prose Column */}
          <div className="mx-auto mt-8 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase opacity-60">
              {activeChapter.number}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {activeChapter.title}
            </h2>

            <div className={`mt-6 space-y-5 font-serif ${proseSize}`}>
              {activeChapter.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:leading-none'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-current/15 pt-5 text-xs">
              <button
                type="button"
                onClick={() => onSelectBook(current)}
                className="font-semibold text-[#1E3A5F] hover:underline"
              >
                Lihat Informasi Bibliografi & Pinjam Koleksi
              </button>
              <span className="opacity-65 tabular-nums">{current.pages} halaman</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
