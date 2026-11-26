import { useEffect, useState } from 'react';
import { X, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { api, ApiError } from '../lib/api.ts';
import type { PublicUser } from '../types/library.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'librarian';
  onClose: () => void;
  onSuccess: (token: string, user: PublicUser) => void;
}

export function AuthModal({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'librarian'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState<{ claimed: boolean; envConfigured: boolean } | null>(
    null
  );

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Librarian form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .getAdminStatus()
      .then((res) => setAdminStatus(res))
      .catch(() => setAdminStatus(null));
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      onSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk ke akun.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        institution: regInstitution,
        password: regPassword
      });
      onSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mendaftarkan anggota baru.');
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.claimAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword
      });
      onSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengaktifkan akun Pustakawan.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasscodeLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.adminLogin(adminPasscode);
      onSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kode akses Pustakawan tidak valid.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-md border border-[#E2DDD3] bg-[#FFFFFF] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFECE4] pb-4">
          <div>
            <h2 id="auth-modal-title" className="font-display text-2xl font-semibold text-[#1C1917]">
              Layanan Keanggotaan
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Masuk atau daftar untuk meminjam koleksi dan menyimpan daftar bacaan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mt-5 grid grid-cols-3 gap-1 rounded-md bg-[#F2EFE9] p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`whitespace-nowrap rounded px-3 py-2 text-xs font-semibold transition-colors ${
              tab === 'login'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`whitespace-nowrap rounded px-3 py-2 text-xs font-semibold transition-colors ${
              tab === 'register'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Daftar Anggota
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('librarian');
              setError(null);
            }}
            className={`whitespace-nowrap rounded px-3 py-2 text-xs font-semibold transition-colors ${
              tab === 'librarian'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Pustakawan
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded border border-[#9A3412]/30 bg-[#FEF2F2] px-3.5 py-2.5 text-sm text-[#9A3412]">
            {error}
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#44403C]">
                Alamat Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@institusi.ac.id"
                className="mt-1.5 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#44403C]">
                Kata Sandi
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="mt-1.5 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Memverifikasi...' : 'Masuk ke Perpustakaan'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[#44403C]">
                Nama Lengkap
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Contoh: Dwi Melinda"
                className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-[#44403C]">
                Alamat Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="reg-inst" className="block text-xs font-semibold text-[#44403C]">
                Institusi / Program Studi (Opsional)
              </label>
              <input
                id="reg-inst"
                type="text"
                value={regInstitution}
                onChange={(e) => setRegInstitution(e.target.value)}
                placeholder="Universitas / Peneliti / Umum"
                className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold text-[#44403C]">
                Kata Sandi
              </label>
              <input
                id="reg-pass"
                type="password"
                required
                minLength={8}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Mendaftarkan...' : 'Buat Kartu Anggota Digital'}
            </button>
          </form>
        )}

        {tab === 'librarian' && (
          <div className="mt-5">
            {adminStatus?.envConfigured ? (
              <form onSubmit={handlePasscodeLogin} className="space-y-4">
                <p className="text-xs leading-relaxed text-[#57534E]">
                  Masukkan kode akses Pustakawan yang terkonfigurasi pada server untuk membuka panel pengelolaan koleksi dan sirkulasi.
                </p>
                <div>
                  <label htmlFor="admin-passcode" className="block text-xs font-semibold text-[#44403C]">
                    Kode Akses Pustakawan
                  </label>
                  <input
                    id="admin-passcode"
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Masukkan kode akses"
                    className="mt-1.5 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? 'Memeriksa...' : 'Masuk sebagai Pustakawan'}
                </button>
              </form>
            ) : adminStatus && !adminStatus.claimed ? (
              <form onSubmit={handleClaimAdmin} className="space-y-3.5">
                <div className="rounded border border-[#E2DDD3] bg-[#F8F6F1] p-3 text-xs leading-relaxed text-[#44403C]">
                  Belum ada akun Pustakawan yang terdaftar. Daftarkan akun Pustakawan utama pertama untuk mengelola katalog koleksi dan memverifikasi sirkulasi.
                </div>
                <div>
                  <label htmlFor="adm-name" className="block text-xs font-semibold text-[#44403C]">
                    Nama Pustakawan
                  </label>
                  <input
                    id="adm-name"
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Nama kepala perpustakaan / pustakawan"
                    className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adm-email" className="block text-xs font-semibold text-[#44403C]">
                    Email Pustakawan
                  </label>
                  <input
                    id="adm-email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="pustakawan@perpustakaan.id"
                    className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adm-pass" className="block text-xs font-semibold text-[#44403C]">
                    Kata Sandi
                  </label>
                  <input
                    id="adm-pass"
                    type="password"
                    required
                    minLength={8}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="mt-1 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? 'Mengaktifkan...' : 'Aktifkan Akun Pustakawan Pertama'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-xs leading-relaxed text-[#57534E]">
                  Akun Pustakawan telah diaktifkan. Masuk menggunakan email dan kata sandi Pustakawan Anda.
                </p>
                <div>
                  <label htmlFor="adm-login-email" className="block text-xs font-semibold text-[#44403C]">
                    Email Pustakawan
                  </label>
                  <input
                    id="adm-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="pustakawan@perpustakaan.id"
                    className="mt-1.5 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adm-login-pass" className="block text-xs font-semibold text-[#44403C]">
                    Kata Sandi
                  </label>
                  <input
                    id="adm-login-pass"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="mt-1.5 w-full rounded-md border border-[#D6D0C4] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? 'Memverifikasi...' : 'Masuk ke Panel Pustakawan'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
