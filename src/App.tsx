import { useCallback, useEffect, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { AuthModal } from './components/AuthModal.tsx';
import { BookDetailModal } from './components/BookDetailModal.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { CirculationView } from './components/CirculationView.tsx';
import { HomeView } from './components/HomeView.tsx';
import { LibrarianView } from './components/LibrarianView.tsx';
import { ReaderView } from './components/ReaderView.tsx';
import { api, ApiError } from './lib/api.ts';
import type {
  Book,
  LibraryStats,
  LoanWithDetails,
  PublicUser,
  ReservationWithDetails
} from './types/library.ts';

type ActiveTab = 'home' | 'catalog' | 'circulation' | 'reader' | 'librarian';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state held strictly in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'librarian'>('login');

  // Library data state
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Detail & Reader state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  const notify = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadCatalogAndStats = useCallback(async () => {
    try {
      const [booksRes, statsRes] = await Promise.all([api.getBooks(), api.getStats()]);
      setBooks(booksRes.books);
      setStats(statsRes);
      setSelectedBook((prev) =>
        prev ? booksRes.books.find((b) => b.id === prev.id) ?? null : null
      );
    } catch {
      notify('Gagal memuat katalog perpustakaan.', 'error');
    } finally {
      setLoadingCatalog(false);
    }
  }, [notify]);

  const loadUserLibraryData = useCallback(async (authToken: string) => {
    try {
      const [loansRes, resRes, bmRes] = await Promise.all([
        api.getMyLoans(authToken),
        api.getMyReservations(authToken),
        api.getBookmarks(authToken)
      ]);
      setLoans(loansRes.loans);
      setReservations(resRes.reservations);
      setBookmarks(bmRes.bookmarks);
    } catch {
      // If session expired cleanly reset
    }
  }, []);

  useEffect(() => {
    loadCatalogAndStats();
  }, [loadCatalogAndStats]);

  useEffect(() => {
    if (token) {
      loadUserLibraryData(token);
    } else {
      setLoans([]);
      setReservations([]);
      setBookmarks([]);
    }
  }, [token, loadUserLibraryData]);

  function openAuth(mode: 'login' | 'register' | 'librarian') {
    setAuthInitialTab(mode);
    setAuthModalOpen(true);
  }

  function handleAuthSuccess(newToken: string, user: PublicUser) {
    setToken(newToken);
    setCurrentUser(user);
    notify(`Selamat datang, ${user.name}.`);
  }

  function handleLogout() {
    setToken(null);
    setCurrentUser(null);
    setLoans([]);
    setReservations([]);
    setBookmarks([]);
    if (activeTab === 'librarian') {
      setActiveTab('home');
    }
    notify('Anda telah keluar dari akun.');
  }

  async function handleBorrow(bookId: string, durationDays: 7 | 14) {
    if (!token) {
      openAuth('login');
      return;
    }
    try {
      const res = await api.borrowBook(token, { bookId, durationDays });
      notify(`Berhasil meminjam "${res.loan.bookTitle}" selama ${durationDays} hari.`);
      await Promise.all([loadCatalogAndStats(), loadUserLibraryData(token)]);
      setSelectedBook(null);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal meminjam koleksi.', 'error');
    }
  }

  async function handleReturnLoan(loanId: string) {
    if (!token) return;
    try {
      const res = await api.returnLoan(token, loanId);
      notify(`Koleksi "${res.loan.bookTitle}" telah dikembalikan.`);
      await Promise.all([loadCatalogAndStats(), loadUserLibraryData(token)]);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal mengembalikan koleksi.', 'error');
    }
  }

  async function handleExtendLoan(loanId: string) {
    if (!token) return;
    try {
      const res = await api.extendLoan(token, loanId);
      notify(`Masa pinjam "${res.loan.bookTitle}" diperpanjang +7 hari.`);
      await loadUserLibraryData(token);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal memperpanjang pinjaman.', 'error');
    }
  }

  async function handleReserve(bookId: string) {
    if (!token) {
      openAuth('login');
      return;
    }
    try {
      const res = await api.createReservation(token, bookId);
      notify(`Anda masuk antrean reservasi untuk "${res.reservation.bookTitle}".`);
      await loadUserLibraryData(token);
      setSelectedBook(null);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal membuat reservasi.', 'error');
    }
  }

  async function handleCancelReservation(reservationId: string) {
    if (!token) return;
    try {
      await api.cancelReservation(token, reservationId);
      notify('Antrean reservasi dibatalkan.');
      await loadUserLibraryData(token);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal membatalkan reservasi.', 'error');
    }
  }

  async function handleToggleBookmark(bookId: string) {
    if (!token) {
      openAuth('login');
      return;
    }
    try {
      const res = await api.toggleBookmark(token, bookId);
      setBookmarks(res.bookmarks);
      const saved = res.bookmarks.includes(bookId);
      notify(saved ? 'Koleksi disimpan ke daftar bacaan.' : 'Koleksi dihapus dari daftar bacaan.');
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Gagal memperbarui daftar bacaan.', 'error');
    }
  }

  function navigateTo(tab: ActiveTab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'home', label: 'Beranda' },
    { id: 'catalog', label: 'Katalog' },
    { id: 'circulation', label: 'Sirkulasi' },
    { id: 'reader', label: 'Ruang Baca' },
    { id: 'librarian', label: 'Pustakawan' }
  ];

  const isSelectedBookBorrowed = selectedBook
    ? loans.some((l) => l.bookId === selectedBook.id && !l.returnedAt)
    : false;
  const isSelectedBookReserved = selectedBook
    ? reservations.some((r) => r.bookId === selectedBook.id && r.status === 'waiting')
    : false;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F6F1] text-[#1C1917]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E2DDD3] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="font-display text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0"
          >
            Pustaka Nusantara
          </button>

          {/* Zone 2: Single-line Navigation Links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  activeTab === item.id
                    ? 'border-[#1E3A5F] text-[#1C1917] font-semibold'
                    : 'border-transparent hover:text-[#1C1917]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo(currentUser.role === 'librarian' ? 'librarian' : 'circulation')}
                  className="max-w-[180px] truncate text-xs font-semibold text-[#1C1917] hover:text-[#1E3A5F]"
                  title={`${currentUser.name} (${currentUser.memberNumber})`}
                >
                  {currentUser.name}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Keluar dari akun"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#D6D0C4] bg-[#F8F6F1] px-3 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="hidden md:inline-flex whitespace-nowrap shrink-0 rounded-md bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#162C49] transition-colors"
              >
                Masuk / Daftar
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Buka menu navigasi"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E2DDD3] text-[#1C1917] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#EFECE4] bg-[#FFFFFF] px-6 py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`rounded-md px-3 py-2.5 text-left text-sm font-medium ${
                    activeTab === item.id
                      ? 'bg-[#1E3A5F] text-white'
                      : 'text-[#44403C] hover:bg-[#F8F6F1]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-[#EFECE4] pt-3">
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1C1917]">
                      {currentUser.name} ({currentUser.memberNumber})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-md border border-[#D6D0C4] px-3 py-1.5 text-xs font-semibold text-[#1C1917]"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuth('login');
                    }}
                    className="w-full rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Masuk / Daftar Anggota
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          className={`fixed right-5 bottom-5 z-50 max-w-sm rounded-md border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.tone === 'error'
              ? 'border-[#9A3412]/30 bg-[#FEF2F2] text-[#9A3412]'
              : 'border-[#14532D]/25 bg-[#FFFFFF] text-[#14532D]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {loadingCatalog ? (
          <div className="mx-auto max-w-7xl px-6 py-16 text-center text-sm text-[#57534E]">
            Memuat koleksi perpustakaan...
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                books={books}
                stats={stats}
                currentUser={currentUser}
                onNavigate={navigateTo}
                onSelectBook={(book) => setSelectedBook(book)}
                onOpenAuth={(mode) => openAuth(mode)}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogView
                books={books}
                bookmarks={bookmarks}
                currentUser={currentUser}
                onSelectBook={(book) => setSelectedBook(book)}
                onToggleBookmark={handleToggleBookmark}
                onRequireAuth={() => openAuth('login')}
              />
            )}

            {activeTab === 'circulation' && (
              <CirculationView
                currentUser={currentUser}
                loans={loans}
                reservations={reservations}
                books={books}
                onReturnLoan={handleReturnLoan}
                onExtendLoan={handleExtendLoan}
                onCancelReservation={handleCancelReservation}
                onBorrowFromReservation={(bookId) => handleBorrow(bookId, 7)}
                onOpenAuth={(mode) => openAuth(mode)}
                onNavigateCatalog={() => navigateTo('catalog')}
              />
            )}

            {activeTab === 'reader' && (
              <ReaderView
                books={books}
                bookmarks={bookmarks}
                activeBook={readerBook}
                currentUser={currentUser}
                onSelectBook={(book) => setSelectedBook(book)}
                onToggleBookmark={handleToggleBookmark}
                onRequireAuth={() => openAuth('login')}
              />
            )}

            {activeTab === 'librarian' && (
              <LibrarianView
                token={token}
                currentUser={currentUser}
                books={books}
                onRefreshCatalog={loadCatalogAndStats}
                onOpenLibrarianAuth={() => openAuth('librarian')}
                onNotify={notify}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-[#E2DDD3] bg-[#FFFFFF] py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 text-xs text-[#57534E] sm:flex-row sm:items-center lg:px-8">
          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-[#1C1917]">
              Pustaka Nusantara
            </p>
            <p>
              Sistem Perpustakaan Digital Terpadu — Katalog Koleksi, Sirkulasi, dan Ruang Baca.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => navigateTo('catalog')}
              className="hover:text-[#1C1917] hover:underline"
            >
              Katalog Koleksi
            </button>
            <button
              type="button"
              onClick={() => navigateTo('circulation')}
              className="hover:text-[#1C1917] hover:underline"
            >
              Layanan Sirkulasi
            </button>
            <button
              type="button"
              onClick={() => navigateTo('reader')}
              className="hover:text-[#1C1917] hover:underline"
            >
              Ruang Baca Digital
            </button>
            <button
              type="button"
              onClick={() => openAuth('register')}
              className="hover:text-[#1C1917] hover:underline"
            >
              Daftar Anggota
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <BookDetailModal
        book={selectedBook}
        currentUser={currentUser}
        isBookmarked={selectedBook ? bookmarks.includes(selectedBook.id) : false}
        isAlreadyBorrowed={isSelectedBookBorrowed}
        isAlreadyReserved={isSelectedBookReserved}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrow}
        onReserve={handleReserve}
        onToggleBookmark={handleToggleBookmark}
        onOpenReader={(book) => {
          setReaderBook(book);
          navigateTo('reader');
        }}
        onRequireAuth={() => {
          setSelectedBook(null);
          openAuth('login');
        }}
      />
    </div>
  );
}
