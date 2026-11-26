import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  hashPassword,
  signSessionToken,
  verifyAdminPasscode,
  verifyPassword,
  verifySessionToken
} from './server/auth.ts';
import {
  borrowBook,
  cancelReservation,
  createBook,
  createReservation,
  createUserAccount,
  deleteBook,
  extendLoan,
  findUserByEmail,
  findUserById,
  getBookById,
  getBookmarksForUser,
  getLibraryStats,
  hasLibrarianAccount,
  listAllLoans,
  listAllReservations,
  listBooks,
  listLoansForUser,
  listPublicUsers,
  listReservationsForUser,
  returnLoan,
  toPublicUser,
  toggleBookmarkForUser,
  updateBook
} from './server/store.ts';
import type { CollectionCategory, CollectionFormat, PublicUser, UserRole } from './src/types/library.ts';

interface AuthenticatedRequest extends Request {
  authUser?: {
    userId: string;
    role: UserRole;
  };
}

const VALID_CATEGORIES: CollectionCategory[] = [
  'Sejarah & Budaya',
  'Arsitektur & Desain',
  'Teknologi & Komputasi',
  'Sastra & Fiksi',
  'Ekonomi & Kebijakan',
  'Sains & Ekologi'
];

const VALID_FORMATS: CollectionFormat[] = [
  'Buku Cetak',
  'E-Book',
  'Jurnal Digital',
  'Arsip Langka'
];

function extractBearerUser(req: AuthenticatedRequest): { userId: string; role: UserRole } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return { userId: payload.userId, role: payload.role };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractBearerUser(req);
  if (!user) {
    res.status(401).json({ error: 'Silakan masuk terlebih dahulu untuk mengakses layanan ini.' });
    return;
  }
  req.authUser = user;
  next();
}

function requireLibrarian(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractBearerUser(req);
  if (!user) {
    res.status(401).json({ error: 'Autentikasi diperlukan.' });
    return;
  }
  if (user.role !== 'librarian') {
    res.status(403).json({ error: 'Akses khusus Pustakawan.' });
    return;
  }
  req.authUser = user;
  next();
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

async function startServer(): Promise<void> {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  // --- Public Catalog & Stats ---
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/stats', (_req, res) => {
    res.json(getLibraryStats());
  });

  app.get('/api/books', (_req, res) => {
    res.json({ books: listBooks() });
  });

  app.get('/api/books/:id', (req, res) => {
    const book = getBookById(req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
      return;
    }
    res.json({ book });
  });

  // --- Authentication Routes ---
  app.get('/api/auth/admin-status', (_req, res) => {
    res.json({
      claimed: hasLibrarianAccount(),
      envConfigured: Boolean(process.env.ADMIN_PASSCODE?.trim())
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, institution, password } = req.body ?? {};
    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      res.status(400).json({ error: 'Nama lengkap, email, dan kata sandi wajib diisi.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
      return;
    }

    try {
      const passwordHash = hashPassword(password);
      const user = createUserAccount({
        name,
        email,
        institution: typeof institution === 'string' ? institution : 'Anggota Umum',
        passwordHash,
        role: 'member'
      });
      const token = signSessionToken(user.id, user.role);
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_EXISTS') {
        res.status(409).json({ error: 'Email tersebut sudah terdaftar sebagai anggota.' });
        return;
      }
      res.status(500).json({ error: 'Gagal mendaftarkan akun anggota.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    const user = findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    const token = signSessionToken(user.id, user.role);
    res.json({ token, user: toPublicUser(user) });
  });

  app.post('/api/auth/claim-admin', (req, res) => {
    if (process.env.ADMIN_PASSCODE?.trim()) {
      res.status(403).json({
        error: 'Kode akses Pustakawan dikelola melalui variabel lingkungan server.'
      });
      return;
    }
    if (hasLibrarianAccount()) {
      res.status(409).json({
        error: 'Akun Pustakawan utama sudah diklaim. Silakan masuk melalui tab Masuk.'
      });
      return;
    }

    const { name, email, password } = req.body ?? {};
    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      res.status(400).json({ error: 'Nama, email, dan kata sandi Pustakawan wajib diisi.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
      return;
    }

    try {
      const passwordHash = hashPassword(password);
      const user = createUserAccount({
        name,
        email,
        institution: 'Pustakawan Pengelola',
        passwordHash,
        role: 'librarian'
      });
      const token = signSessionToken(user.id, user.role);
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_EXISTS') {
        res.status(409).json({ error: 'Email tersebut sudah digunakan.' });
        return;
      }
      res.status(500).json({ error: 'Gagal mengaktifkan akun Pustakawan.' });
    }
  });

  app.post('/api/auth/admin-login', (req, res) => {
    const { passcode } = req.body ?? {};
    if (!isNonEmptyString(passcode)) {
      res.status(400).json({ error: 'Kode akses Pustakawan wajib diisi.' });
      return;
    }
    if (!verifyAdminPasscode(passcode)) {
      res.status(401).json({ error: 'Kode akses Pustakawan tidak valid.' });
      return;
    }

    const adminUser: PublicUser = {
      id: 'ADMIN-001',
      memberNumber: 'PST-ADMIN',
      name: 'Pustakawan Utama',
      email: 'pustakawan@pustakanusantara.id',
      institution: 'Manajemen Perpustakaan',
      role: 'librarian',
      createdAt: new Date().toISOString()
    };
    const token = signSessionToken(adminUser.id, 'librarian');
    res.json({ token, user: adminUser });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const auth = req.authUser!;
    if (auth.userId === 'ADMIN-001') {
      res.json({
        user: {
          id: 'ADMIN-001',
          memberNumber: 'PST-ADMIN',
          name: 'Pustakawan Utama',
          email: 'pustakawan@pustakanusantara.id',
          institution: 'Manajemen Perpustakaan',
          role: 'librarian',
          createdAt: new Date().toISOString()
        }
      });
      return;
    }
    const user = findUserById(auth.userId);
    if (!user) {
      res.status(401).json({ error: 'Sesi pengguna tidak ditemukan.' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  });

  // --- Member Bookmarks ---
  app.get('/api/bookmarks', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ bookmarks: getBookmarksForUser(req.authUser!.userId) });
  });

  app.post('/api/bookmarks/toggle', requireAuth, (req: AuthenticatedRequest, res) => {
    const { bookId } = req.body ?? {};
    if (!isNonEmptyString(bookId)) {
      res.status(400).json({ error: 'ID koleksi tidak valid.' });
      return;
    }
    try {
      const bookmarks = toggleBookmarkForUser(req.authUser!.userId, bookId);
      res.json({ bookmarks });
    } catch {
      res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
    }
  });

  // --- Circulation: Borrowing, Returning, Extending & Reservations ---
  app.get('/api/loans/my', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ loans: listLoansForUser(req.authUser!.userId) });
  });

  app.post('/api/loans/borrow', requireAuth, (req: AuthenticatedRequest, res) => {
    const { bookId, durationDays, notes } = req.body ?? {};
    if (!isNonEmptyString(bookId)) {
      res.status(400).json({ error: 'Pilih koleksi yang ingin dipinjam.' });
      return;
    }
    const duration = durationDays === 14 ? 14 : 7;

    try {
      const loan = borrowBook({
        bookId,
        userId: req.authUser!.userId,
        durationDays: duration,
        notes: typeof notes === 'string' ? notes : undefined
      });
      res.status(201).json({ loan });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'BOOK_NOT_FOUND') {
        res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
        return;
      }
      if (code === 'NO_COPIES_AVAILABLE') {
        res.status(409).json({ error: 'Seluruh eksemplar sedang dipinjam. Anda dapat masuk antrean reservasi.' });
        return;
      }
      if (code === 'MAX_LOANS_REACHED') {
        res.status(409).json({ error: 'Batas maksimal 5 peminjaman aktif telah tercapai.' });
        return;
      }
      if (code === 'ALREADY_BORROWED') {
        res.status(409).json({ error: 'Anda masih meminjam koleksi yang sama saat ini.' });
        return;
      }
      res.status(500).json({ error: 'Gagal memproses peminjaman.' });
    }
  });

  app.post('/api/loans/:id/return', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const loan = returnLoan(
        req.params.id,
        req.authUser!.userId,
        req.authUser!.role === 'librarian'
      );
      res.json({ loan });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'LOAN_NOT_FOUND') {
        res.status(404).json({ error: 'Data peminjaman tidak ditemukan.' });
        return;
      }
      if (code === 'FORBIDDEN') {
        res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengembalikan pinjaman ini.' });
        return;
      }
      if (code === 'ALREADY_RETURNED') {
        res.status(409).json({ error: 'Koleksi ini sudah dikembalikan sebelumnya.' });
        return;
      }
      res.status(500).json({ error: 'Gagal memproses pengembalian.' });
    }
  });

  app.post('/api/loans/:id/extend', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const loan = extendLoan(
        req.params.id,
        req.authUser!.userId,
        req.authUser!.role === 'librarian'
      );
      res.json({ loan });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'LOAN_NOT_FOUND') {
        res.status(404).json({ error: 'Data peminjaman tidak ditemukan.' });
        return;
      }
      if (code === 'FORBIDDEN') {
        res.status(403).json({ error: 'Akses ditolak.' });
        return;
      }
      if (code === 'ALREADY_RETURNED') {
        res.status(409).json({ error: 'Pinjaman sudah dikembalikan.' });
        return;
      }
      if (code === 'MAX_EXTENSION_REACHED') {
        res.status(409).json({ error: 'Perpanjangan hanya dapat dilakukan 1 kali per peminjaman.' });
        return;
      }
      if (code === 'CANNOT_EXTEND_OVERDUE') {
        res.status(409).json({ error: 'Peminjaman yang sudah melewati jatuh tempo tidak dapat diperpanjang.' });
        return;
      }
      res.status(500).json({ error: 'Gagal memperpanjang masa pinjam.' });
    }
  });

  app.get('/api/reservations/my', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ reservations: listReservationsForUser(req.authUser!.userId) });
  });

  app.post('/api/reservations', requireAuth, (req: AuthenticatedRequest, res) => {
    const { bookId } = req.body ?? {};
    if (!isNonEmptyString(bookId)) {
      res.status(400).json({ error: 'ID koleksi wajib diisi.' });
      return;
    }
    try {
      const reservation = createReservation(bookId, req.authUser!.userId);
      res.status(201).json({ reservation });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'BOOK_NOT_FOUND') {
        res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
        return;
      }
      if (code === 'BOOK_IS_AVAILABLE') {
        res.status(409).json({ error: 'Koleksi masih tersedia dan dapat langsung dipinjam.' });
        return;
      }
      if (code === 'ALREADY_BORROWED') {
        res.status(409).json({ error: 'Anda sedang meminjam koleksi ini.' });
        return;
      }
      if (code === 'ALREADY_RESERVED') {
        res.status(409).json({ error: 'Anda sudah masuk dalam antrean reservasi koleksi ini.' });
        return;
      }
      res.status(500).json({ error: 'Gagal membuat reservasi.' });
    }
  });

  app.delete('/api/reservations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      cancelReservation(
        req.params.id,
        req.authUser!.userId,
        req.authUser!.role === 'librarian'
      );
      res.json({ ok: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'RESERVATION_NOT_FOUND') {
        res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
        return;
      }
      if (code === 'FORBIDDEN') {
        res.status(403).json({ error: 'Akses ditolak.' });
        return;
      }
      res.status(500).json({ error: 'Gagal membatalkan reservasi.' });
    }
  });

  // --- Librarian Admin Routes ---
  app.get('/api/admin/overview', requireLibrarian, (_req, res) => {
    res.json({
      stats: getLibraryStats(),
      loans: listAllLoans(),
      reservations: listAllReservations(),
      members: listPublicUsers()
    });
  });

  app.post('/api/admin/books', requireLibrarian, (req, res) => {
    const body = req.body ?? {};
    if (
      !isNonEmptyString(body.title) ||
      !isNonEmptyString(body.author) ||
      !isNonEmptyString(body.publisher) ||
      !isNonEmptyString(body.isbn) ||
      !isNonEmptyString(body.callNumber) ||
      !isNonEmptyString(body.synopsis)
    ) {
      res.status(400).json({ error: 'Judul, pengarang, penerbit, ISBN, nomor klasifikasi, dan sinopsis wajib diisi.' });
      return;
    }

    const category: CollectionCategory = VALID_CATEGORIES.includes(body.category)
      ? body.category
      : 'Sejarah & Budaya';
    const format: CollectionFormat = VALID_FORMATS.includes(body.format)
      ? body.format
      : 'Buku Cetak';
    const year = Number(body.year) || new Date().getFullYear();
    const pages = Number(body.pages) || 200;
    const totalCopies = Number(body.totalCopies) || 1;
    const validTones = ['ivory', 'lapis', 'forest', 'terracotta', 'charcoal', 'stone'] as const;
    const coverTone = validTones.includes(body.coverTone) ? body.coverTone : 'ivory';

    const book = createBook({
      title: body.title,
      subtitle: typeof body.subtitle === 'string' ? body.subtitle : undefined,
      author: body.author,
      publisher: body.publisher,
      year,
      isbn: body.isbn,
      callNumber: body.callNumber,
      category,
      format,
      language: typeof body.language === 'string' ? body.language : 'Indonesia',
      pages,
      shelfLocation: typeof body.shelfLocation === 'string' ? body.shelfLocation : 'Lantai 1 · Rak Umum',
      totalCopies,
      coverTone,
      synopsis: body.synopsis,
      sampleParagraph: typeof body.sampleParagraph === 'string' ? body.sampleParagraph : undefined
    });

    res.status(201).json({ book });
  });

  app.patch('/api/admin/books/:id', requireLibrarian, (req, res) => {
    try {
      const body = req.body ?? {};
      const book = updateBook(req.params.id, {
        title: typeof body.title === 'string' ? body.title : undefined,
        subtitle: typeof body.subtitle === 'string' ? body.subtitle : undefined,
        author: typeof body.author === 'string' ? body.author : undefined,
        publisher: typeof body.publisher === 'string' ? body.publisher : undefined,
        year: typeof body.year === 'number' ? body.year : undefined,
        isbn: typeof body.isbn === 'string' ? body.isbn : undefined,
        callNumber: typeof body.callNumber === 'string' ? body.callNumber : undefined,
        category: VALID_CATEGORIES.includes(body.category) ? body.category : undefined,
        format: VALID_FORMATS.includes(body.format) ? body.format : undefined,
        shelfLocation: typeof body.shelfLocation === 'string' ? body.shelfLocation : undefined,
        totalCopies: typeof body.totalCopies === 'number' ? body.totalCopies : undefined,
        synopsis: typeof body.synopsis === 'string' ? body.synopsis : undefined
      });
      res.json({ book });
    } catch (err) {
      if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
        res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
        return;
      }
      res.status(500).json({ error: 'Gagal memperbarui koleksi.' });
    }
  });

  app.delete('/api/admin/books/:id', requireLibrarian, (req, res) => {
    try {
      deleteBook(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'BOOK_HAS_ACTIVE_LOANS') {
        res.status(409).json({ error: 'Koleksi tidak dapat dihapus karena masih ada eksemplar yang dipinjam.' });
        return;
      }
      if (code === 'BOOK_NOT_FOUND') {
        res.status(404).json({ error: 'Koleksi tidak ditemukan.' });
        return;
      }
      res.status(500).json({ error: 'Gagal menghapus koleksi.' });
    }
  });

  // --- Vite / Static Serving ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Pustaka Nusantara server running on http://localhost:${port}`);
  });
}

startServer();
