import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  Book,
  CollectionCategory,
  CollectionFormat,
  LibraryStats,
  Loan,
  LoanStatus,
  LoanWithDetails,
  PublicUser,
  Reservation,
  ReservationWithDetails,
  StoredUser
} from '../src/types/library.ts';
import { SEED_BOOKS } from './seed.ts';

interface DatabaseSchema {
  books: Book[];
  users: StoredUser[];
  loans: Loan[];
  reservations: Reservation[];
  bookmarks: Record<string, string[]>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'library.json');
const FINE_PER_DAY_RP = 2000;
const MAX_ACTIVE_LOANS_PER_USER = 5;

let dbState: DatabaseSchema | null = null;

function ensureDirExists(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (dbState) return dbState;
  ensureDirExists();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      dbState = {
        books: Array.isArray(parsed.books) ? parsed.books : [...SEED_BOOKS],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        loans: Array.isArray(parsed.loans) ? parsed.loans : [],
        reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
        bookmarks: parsed.bookmarks && typeof parsed.bookmarks === 'object' ? parsed.bookmarks : {}
      };
      return dbState;
    } catch {
      // Fall through to clean re-initialization if file is unreadable
    }
  }

  dbState = {
    books: structuredClone(SEED_BOOKS),
    users: [],
    loans: [],
    reservations: [],
    bookmarks: {}
  };
  saveDatabase();
  return dbState;
}

function saveDatabase(): void {
  if (!dbState) return;
  ensureDirExists();
  const tempFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dbState, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    memberNumber: user.memberNumber,
    name: user.name,
    email: user.email,
    institution: user.institution,
    role: user.role,
    createdAt: user.createdAt
  };
}

export function hasLibrarianAccount(): boolean {
  const db = loadDatabase();
  return db.users.some((u) => u.role === 'librarian');
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const db = loadDatabase();
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(userId: string): StoredUser | undefined {
  const db = loadDatabase();
  return db.users.find((u) => u.id === userId);
}

export function listPublicUsers(): PublicUser[] {
  const db = loadDatabase();
  return db.users.map(toPublicUser);
}

export function createUserAccount(input: {
  name: string;
  email: string;
  institution: string;
  passwordHash: string;
  role: 'member' | 'librarian';
}): PublicUser {
  const db = loadDatabase();
  const normalizedEmail = input.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('EMAIL_EXISTS');
  }

  const nextSeq = String(db.users.length + 1).padStart(4, '0');
  const year = new Date().getFullYear();
  const prefix = input.role === 'librarian' ? 'PST' : 'PN';

  const newUser: StoredUser = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    memberNumber: `${prefix}-${year}-${nextSeq}`,
    name: input.name.trim(),
    email: normalizedEmail,
    institution: input.institution.trim() || 'Anggota Umum',
    role: input.role,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase();
  return toPublicUser(newUser);
}

export function listBooks(): Book[] {
  const db = loadDatabase();
  return db.books;
}

export function getBookById(bookId: string): Book | undefined {
  const db = loadDatabase();
  return db.books.find((b) => b.id === bookId);
}

export function createBook(input: {
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  callNumber: string;
  category: CollectionCategory;
  format: CollectionFormat;
  language: string;
  pages: number;
  shelfLocation: string;
  totalCopies: number;
  coverTone: Book['coverTone'];
  synopsis: string;
  sampleParagraph?: string;
}): Book {
  const db = loadDatabase();
  const copies = Math.max(1, Math.floor(input.totalCopies));
  const book: Book = {
    id: `bk-${crypto.randomUUID().slice(0, 8)}`,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    author: input.author.trim(),
    publisher: input.publisher.trim(),
    year: input.year,
    isbn: input.isbn.trim(),
    callNumber: input.callNumber.trim(),
    category: input.category,
    format: input.format,
    language: input.language.trim() || 'Indonesia',
    pages: Math.max(1, Math.floor(input.pages)),
    shelfLocation: input.shelfLocation.trim() || 'Lantai 1 · Rak Umum',
    totalCopies: copies,
    availableCopies: copies,
    borrowCount: 0,
    coverTone: input.coverTone,
    synopsis: input.synopsis.trim(),
    chapters: input.sampleParagraph?.trim()
      ? [
          {
            number: 'Bab I',
            title: 'Pratinjau Koleksi',
            paragraphs: [input.sampleParagraph.trim()]
          }
        ]
      : [
          {
            number: 'Ringkasan',
            title: 'Sinopsis Koleksi',
            paragraphs: [input.synopsis.trim()]
          }
        ],
    createdAt: new Date().toISOString()
  };
  db.books.unshift(book);
  saveDatabase();
  return book;
}

export function updateBook(
  bookId: string,
  patch: Partial<{
    title: string;
    subtitle: string;
    author: string;
    publisher: string;
    year: number;
    isbn: string;
    callNumber: string;
    category: CollectionCategory;
    format: CollectionFormat;
    shelfLocation: string;
    totalCopies: number;
    synopsis: string;
  }>
): Book {
  const db = loadDatabase();
  const idx = db.books.findIndex((b) => b.id === bookId);
  if (idx === -1) throw new Error('BOOK_NOT_FOUND');

  const existing = db.books[idx];
  const activeLoansForBook = db.loans.filter((l) => l.bookId === bookId && !l.returnedAt).length;
  const nextTotal =
    typeof patch.totalCopies === 'number'
      ? Math.max(activeLoansForBook, Math.floor(patch.totalCopies))
      : existing.totalCopies;
  const nextAvailable = Math.max(0, nextTotal - activeLoansForBook);

  const updated: Book = {
    ...existing,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    subtitle: patch.subtitle !== undefined ? patch.subtitle.trim() || undefined : existing.subtitle,
    author: patch.author !== undefined ? patch.author.trim() : existing.author,
    publisher: patch.publisher !== undefined ? patch.publisher.trim() : existing.publisher,
    year: patch.year !== undefined ? patch.year : existing.year,
    isbn: patch.isbn !== undefined ? patch.isbn.trim() : existing.isbn,
    callNumber: patch.callNumber !== undefined ? patch.callNumber.trim() : existing.callNumber,
    category: patch.category !== undefined ? patch.category : existing.category,
    format: patch.format !== undefined ? patch.format : existing.format,
    shelfLocation: patch.shelfLocation !== undefined ? patch.shelfLocation.trim() : existing.shelfLocation,
    totalCopies: nextTotal,
    availableCopies: nextAvailable,
    synopsis: patch.synopsis !== undefined ? patch.synopsis.trim() : existing.synopsis
  };

  db.books[idx] = updated;
  saveDatabase();
  return updated;
}

export function deleteBook(bookId: string): void {
  const db = loadDatabase();
  const hasActiveLoan = db.loans.some((l) => l.bookId === bookId && !l.returnedAt);
  if (hasActiveLoan) {
    throw new Error('BOOK_HAS_ACTIVE_LOANS');
  }
  const idx = db.books.findIndex((b) => b.id === bookId);
  if (idx === -1) throw new Error('BOOK_NOT_FOUND');
  db.books.splice(idx, 1);
  saveDatabase();
}

function computeLoanMetrics(loan: Loan): {
  computedStatus: LoanStatus;
  daysOverdue: number;
  estimatedFineRp: number;
} {
  if (loan.returnedAt) {
    return {
      computedStatus: 'returned',
      daysOverdue: 0,
      estimatedFineRp: loan.finePaidRp
    };
  }
  const now = Date.now();
  const due = new Date(loan.dueDate).getTime();
  if (now <= due) {
    return {
      computedStatus: 'borrowed',
      daysOverdue: 0,
      estimatedFineRp: 0
    };
  }
  const diffDays = Math.max(1, Math.ceil((now - due) / (24 * 60 * 60 * 1000)));
  return {
    computedStatus: 'overdue',
    daysOverdue: diffDays,
    estimatedFineRp: diffDays * FINE_PER_DAY_RP
  };
}

function enrichLoan(loan: Loan, db: DatabaseSchema): LoanWithDetails {
  const book = db.books.find((b) => b.id === loan.bookId);
  const user = db.users.find((u) => u.id === loan.userId);
  const metrics = computeLoanMetrics(loan);
  return {
    ...loan,
    bookTitle: book?.title ?? 'Koleksi Terhapus',
    bookAuthor: book?.author ?? '-',
    bookCallNumber: book?.callNumber ?? '-',
    bookFormat: book?.format ?? 'Buku Cetak',
    userName: user?.name ?? (loan.userId === 'ADMIN-001' ? 'Pustakawan Utama' : 'Anggota'),
    userMemberNumber: user?.memberNumber ?? (loan.userId === 'ADMIN-001' ? 'PST-ADMIN' : '-'),
    userEmail: user?.email ?? '-',
    ...metrics
  };
}

export function listLoansForUser(userId: string): LoanWithDetails[] {
  const db = loadDatabase();
  return db.loans
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime())
    .map((l) => enrichLoan(l, db));
}

export function listAllLoans(): LoanWithDetails[] {
  const db = loadDatabase();
  return db.loans
    .slice()
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime())
    .map((l) => enrichLoan(l, db));
}

export function borrowBook(input: {
  bookId: string;
  userId: string;
  durationDays: number;
  notes?: string;
}): LoanWithDetails {
  const db = loadDatabase();
  const book = db.books.find((b) => b.id === input.bookId);
  if (!book) throw new Error('BOOK_NOT_FOUND');
  if (book.availableCopies < 1) throw new Error('NO_COPIES_AVAILABLE');

  const userActiveLoans = db.loans.filter((l) => l.userId === input.userId && !l.returnedAt);
  if (userActiveLoans.length >= MAX_ACTIVE_LOANS_PER_USER) {
    throw new Error('MAX_LOANS_REACHED');
  }
  if (userActiveLoans.some((l) => l.bookId === input.bookId)) {
    throw new Error('ALREADY_BORROWED');
  }

  const days = input.durationDays === 14 ? 14 : 7;
  const now = new Date();
  const due = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const newLoan: Loan = {
    id: `ln-${crypto.randomUUID().slice(0, 8)}`,
    bookId: book.id,
    userId: input.userId,
    borrowedAt: now.toISOString(),
    dueDate: due.toISOString(),
    returnedAt: null,
    extendedCount: 0,
    finePaidRp: 0,
    notes: input.notes?.trim() || undefined
  };

  book.availableCopies = Math.max(0, book.availableCopies - 1);
  book.borrowCount += 1;

  // Fulfill any waiting reservation by this user for this book
  const waitingRes = db.reservations.find(
    (r) => r.bookId === book.id && r.userId === input.userId && r.status === 'waiting'
  );
  if (waitingRes) {
    waitingRes.status = 'fulfilled';
  }

  db.loans.unshift(newLoan);
  saveDatabase();
  return enrichLoan(newLoan, db);
}

export function returnLoan(loanId: string, actorUserId: string, isLibrarian: boolean): LoanWithDetails {
  const db = loadDatabase();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) throw new Error('LOAN_NOT_FOUND');
  if (!isLibrarian && loan.userId !== actorUserId) throw new Error('FORBIDDEN');
  if (loan.returnedAt) throw new Error('ALREADY_RETURNED');

  const metrics = computeLoanMetrics(loan);
  loan.returnedAt = new Date().toISOString();
  loan.finePaidRp = metrics.estimatedFineRp;

  const book = db.books.find((b) => b.id === loan.bookId);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  saveDatabase();
  return enrichLoan(loan, db);
}

export function extendLoan(loanId: string, actorUserId: string, isLibrarian: boolean): LoanWithDetails {
  const db = loadDatabase();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) throw new Error('LOAN_NOT_FOUND');
  if (!isLibrarian && loan.userId !== actorUserId) throw new Error('FORBIDDEN');
  if (loan.returnedAt) throw new Error('ALREADY_RETURNED');
  if (loan.extendedCount >= 1) throw new Error('MAX_EXTENSION_REACHED');

  const metrics = computeLoanMetrics(loan);
  if (metrics.computedStatus === 'overdue') throw new Error('CANNOT_EXTEND_OVERDUE');

  const currentDue = new Date(loan.dueDate).getTime();
  loan.dueDate = new Date(currentDue + 7 * 24 * 60 * 60 * 1000).toISOString();
  loan.extendedCount += 1;

  saveDatabase();
  return enrichLoan(loan, db);
}

export function createReservation(bookId: string, userId: string): ReservationWithDetails {
  const db = loadDatabase();
  const book = db.books.find((b) => b.id === bookId);
  if (!book) throw new Error('BOOK_NOT_FOUND');
  if (book.availableCopies > 0) throw new Error('BOOK_IS_AVAILABLE');

  const alreadyBorrowed = db.loans.some((l) => l.bookId === bookId && l.userId === userId && !l.returnedAt);
  if (alreadyBorrowed) throw new Error('ALREADY_BORROWED');

  const existingRes = db.reservations.find(
    (r) => r.bookId === bookId && r.userId === userId && r.status === 'waiting'
  );
  if (existingRes) throw new Error('ALREADY_RESERVED');

  const reservation: Reservation = {
    id: `res-${crypto.randomUUID().slice(0, 8)}`,
    bookId,
    userId,
    createdAt: new Date().toISOString(),
    status: 'waiting'
  };
  db.reservations.unshift(reservation);
  saveDatabase();
  return enrichReservation(reservation, db);
}

export function cancelReservation(reservationId: string, actorUserId: string, isLibrarian: boolean): void {
  const db = loadDatabase();
  const res = db.reservations.find((r) => r.id === reservationId);
  if (!res) throw new Error('RESERVATION_NOT_FOUND');
  if (!isLibrarian && res.userId !== actorUserId) throw new Error('FORBIDDEN');
  res.status = 'cancelled';
  saveDatabase();
}

function enrichReservation(res: Reservation, db: DatabaseSchema): ReservationWithDetails {
  const book = db.books.find((b) => b.id === res.bookId);
  const user = db.users.find((u) => u.id === res.userId);
  return {
    ...res,
    bookTitle: book?.title ?? 'Koleksi Terhapus',
    bookAuthor: book?.author ?? '-',
    bookAvailableCopies: book?.availableCopies ?? 0,
    userName: user?.name ?? 'Anggota',
    userMemberNumber: user?.memberNumber ?? '-'
  };
}

export function listReservationsForUser(userId: string): ReservationWithDetails[] {
  const db = loadDatabase();
  return db.reservations
    .filter((r) => r.userId === userId && r.status === 'waiting')
    .map((r) => enrichReservation(r, db));
}

export function listAllReservations(): ReservationWithDetails[] {
  const db = loadDatabase();
  return db.reservations
    .filter((r) => r.status === 'waiting')
    .map((r) => enrichReservation(r, db));
}

export function getBookmarksForUser(userId: string): string[] {
  const db = loadDatabase();
  return db.bookmarks[userId] ?? [];
}

export function toggleBookmarkForUser(userId: string, bookId: string): string[] {
  const db = loadDatabase();
  const book = db.books.find((b) => b.id === bookId);
  if (!book) throw new Error('BOOK_NOT_FOUND');
  const current = db.bookmarks[userId] ?? [];
  const exists = current.includes(bookId);
  const next = exists ? current.filter((id) => id !== bookId) : [bookId, ...current];
  db.bookmarks[userId] = next;
  saveDatabase();
  return next;
}

export function getLibraryStats(): LibraryStats {
  const db = loadDatabase();
  const activeLoansList = db.loans.filter((l) => !l.returnedAt);
  const overdueCount = activeLoansList.filter(
    (l) => computeLoanMetrics(l).computedStatus === 'overdue'
  ).length;

  return {
    totalTitles: db.books.length,
    totalCopies: db.books.reduce((sum, b) => sum + b.totalCopies, 0),
    availableCopies: db.books.reduce((sum, b) => sum + b.availableCopies, 0),
    activeLoans: activeLoansList.length,
    overdueLoans: overdueCount,
    totalMembers: db.users.filter((u) => u.role === 'member').length,
    waitingReservations: db.reservations.filter((r) => r.status === 'waiting').length
  };
}
