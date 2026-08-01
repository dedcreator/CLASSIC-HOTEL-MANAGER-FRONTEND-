// frontend/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF6EF]">
      {/* Google Fonts: swap for next/font in production */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Work Sans', sans-serif; }
      `}</style>

      {/* Left panel — identity */}
      <div className="relative md:w-[44%] bg-[#16302B] overflow-hidden flex flex-col justify-between px-8 py-10 md:px-14 md:py-14">
        {/* watermark bell motif */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 opacity-[0.07] md:h-96 md:w-96"
          fill="none"
        >
          <path
            d="M100 30c-27 0-45 20-45 48v22c0 10-4 19-13 27h116c-9-8-13-17-13-27V78c0-28-18-48-45-48z"
            stroke="#C9A468"
            strokeWidth="2.5"
          />
          <path d="M78 130a22 22 0 0044 0" stroke="#C9A468" strokeWidth="2.5" />
          <circle cx="100" cy="20" r="4" stroke="#C9A468" strokeWidth="2.5" />
        </svg>

        <div>
          <div className="font-display text-2xl tracking-tight text-[#F7F1E4]">
            Hotel <span className="text-[#C9A468]">Manager</span>
          </div>
          <div className="mt-3 h-px w-10 bg-[#C9A468]" />
        </div>

        <div className="relative z-10 max-w-xs">
          <p className="font-display text-[26px] leading-snug text-[#F7F1E4] md:text-[30px]">
            Front desk, streamlined.
          </p>
          <p className="font-body mt-3 text-sm leading-relaxed text-[#B9C4B9]">
            Reservations, housekeeping, and guest folios — one ledger for the whole property.
          </p>
        </div>

        <p className="font-body relative z-10 hidden text-xs text-[#7C8C82] md:block">
          Staff access only
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-14 md:py-10">
        <div className="w-full max-w-sm">
          <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-[#B8905B]">
            Staff sign in
          </p>
          <h1 className="font-display mt-2 text-3xl text-[#2A2622]">Welcome back</h1>
          <p className="font-body mt-2 text-sm text-[#8A8377]">
            Enter your credentials to open the front desk console.
          </p>

          <form className="mt-9 space-y-7" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377]"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-body mt-2 w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#B8905B] focus:pb-[7px]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377]"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 pr-9 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#B8905B] focus:pb-[7px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center rounded text-[#8A8377] hover:text-[#2A2622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B8905B]"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-me" className="font-body flex items-center gap-2 text-sm text-[#5B564B]">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border-[#DDD5C4] text-[#B8905B] focus:ring-[#B8905B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B8905B]"
                />
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="font-body text-sm text-[#B8905B] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[#B8905B]"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-body group mt-2 flex w-full items-center justify-center gap-2 bg-[#16302B] px-4 py-3 text-sm font-medium uppercase tracking-wide text-[#F7F1E4] transition-colors hover:bg-[#1D3B34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8905B] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                >
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="#C9A468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}