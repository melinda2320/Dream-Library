import type {
  Book,
  CollectionCategory,
  CollectionFormat,
  LibraryStats,
  LoanWithDetails,
  PublicUser,
  ReservationWithDetails
} from '../types/library.ts';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Terjadi kesalahan pada server.';
    throw new ApiError(message, response.status);
  }
  return data as T;
}

export const api = {
  getStats: () => request<LibraryStats>('/api/stats'),

  getBooks: () => request<{ books: Book[] }>('/api/books'),

  getAdminStatus: () => request<{ claimed: boolean; envConfigured: boolean }>('/api/auth/admin-status'),

  register: (payload: { name: string; email: string; institution: string; password: string }) =>
    request<{ token: string; user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: payload
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: payload
    }),

  claimAdmin: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: PublicUser }>('/api/auth/claim-admin', {
      method: 'POST',
      body: payload
    }),

  adminLogin: (passcode: string) =>
    request<{ token: string; user: PublicUser }>('/api/auth/admin-login', {
      method: 'POST',
      body: { passcode }
    }),

  getMyLoans: (token: string) =>
    request<{ loans: LoanWithDetails[] }>('/api/loans/my', { token }),

  borrowBook: (token: string, payload: { bookId: string; durationDays: 7 | 14; notes?: string }) =>
    request<{ loan: LoanWithDetails }>('/api/loans/borrow', {
      method: 'POST',
      body: payload,
      token
    }),

  returnLoan: (token: string, loanId: string) =>
    request<{ loan: LoanWithDetails }>(`/api/loans/${encodeURIComponent(loanId)}/return`, {
      method: 'POST',
      token
    }),

  extendLoan: (token: string, loanId: string) =>
    request<{ loan: LoanWithDetails }>(`/api/loans/${encodeURIComponent(loanId)}/extend`, {
      method: 'POST',
      token
    }),

  getMyReservations: (token: string) =>
    request<{ reservations: ReservationWithDetails[] }>('/api/reservations/my', { token }),

  createReservation: (token: string, bookId: string) =>
    request<{ reservation: ReservationWithDetails }>('/api/reservations', {
      method: 'POST',
      body: { bookId },
      token
    }),

  cancelReservation: (token: string, reservationId: string) =>
    request<{ ok: boolean }>(`/api/reservations/${encodeURIComponent(reservationId)}`, {
      method: 'DELETE',
      token
    }),

  getBookmarks: (token: string) =>
    request<{ bookmarks: string[] }>('/api/bookmarks', { token }),

  toggleBookmark: (token: string, bookId: string) =>
    request<{ bookmarks: string[] }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: { bookId },
      token
    }),

  getAdminOverview: (token: string) =>
    request<{
      stats: LibraryStats;
      loans: LoanWithDetails[];
      reservations: ReservationWithDetails[];
      members: PublicUser[];
    }>('/api/admin/overview', { token }),

  createBook: (
    token: string,
    payload: {
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
    }
  ) =>
    request<{ book: Book }>('/api/admin/books', {
      method: 'POST',
      body: payload,
      token
    }),

  updateBook: (
    token: string,
    bookId: string,
    payload: Partial<{
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
  ) =>
    request<{ book: Book }>(`/api/admin/books/${encodeURIComponent(bookId)}`, {
      method: 'PATCH',
      body: payload,
      token
    }),

  deleteBook: (token: string, bookId: string) =>
    request<{ ok: boolean }>(`/api/admin/books/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
      token
    })
};

export function formatDateId(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function daysUntilDue(dueIso: string): number {
  const now = new Date();
  const due = new Date(dueIso);
  return Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
