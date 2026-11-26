export type UserRole = 'member' | 'librarian';

export type CollectionFormat = 'Buku Cetak' | 'E-Book' | 'Jurnal Digital' | 'Arsip Langka';

export type CollectionCategory =
  | 'Sejarah & Budaya'
  | 'Arsitektur & Desain'
  | 'Teknologi & Komputasi'
  | 'Sastra & Fiksi'
  | 'Ekonomi & Kebijakan'
  | 'Sains & Ekologi';

export interface ChapterContent {
  number: string;
  title: string;
  paragraphs: string[];
}

export interface Book {
  id: string;
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
  availableCopies: number;
  borrowCount: number;
  coverImage?: string;
  coverTone: 'ivory' | 'lapis' | 'forest' | 'terracotta' | 'charcoal' | 'stone';
  synopsis: string;
  chapters: ChapterContent[];
  createdAt: string;
}

export interface PublicUser {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  institution: string;
  role: UserRole;
  createdAt: string;
}

export interface StoredUser extends PublicUser {
  passwordHash: string;
}

export type LoanStatus = 'borrowed' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  extendedCount: number;
  finePaidRp: number;
  notes?: string;
}

export interface LoanWithDetails extends Loan {
  bookTitle: string;
  bookAuthor: string;
  bookCallNumber: string;
  bookFormat: CollectionFormat;
  userName: string;
  userMemberNumber: string;
  userEmail: string;
  computedStatus: LoanStatus;
  daysOverdue: number;
  estimatedFineRp: number;
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  createdAt: string;
  status: 'waiting' | 'fulfilled' | 'cancelled';
}

export interface ReservationWithDetails extends Reservation {
  bookTitle: string;
  bookAuthor: string;
  bookAvailableCopies: number;
  userName: string;
  userMemberNumber: string;
}

export interface LibraryStats {
  totalTitles: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  totalMembers: number;
  waitingReservations: number;
}
