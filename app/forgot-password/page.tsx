// frontend/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { passwordResetService } from '@/lib/api/passwordReset';

const FontStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
    .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
    .font-body { font-family: 'Work Sans', sans-serif; }
  `}</style>
);

const Wordmark = () => (
  <div className="font-display text-xl text-[#2A2622]">
    Hotel <span className="text-[#B8905B]">Manager</span>
  </div>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await passwordResetService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6EF] px-6 py-12">
        <FontStyles />
        <div className="w-full max-w-sm text-center">
          <Wordmark />

          <div className="mx-auto mt-8 flex h-11 w-11 items-center justify-center rounded-full border border-[#B8905B]">
            <svg className="h-5 w-5 text-[#B8905B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display mt-5 text-2xl text-[#2A2622]">Check your email</h1>
          <p className="font-body mt-2 text-sm leading-relaxed text-[#8A8377]">
            We&rsquo;ve sent a reset link to <strong className="text-[#2A2622]">{email}</strong>
          </p>

          <Link
            href="/login"
            className="font-body mt-8 inline-block text-sm text-[#B8905B] underline decoration-transparent underline-offset-4 hover:decoration-[#B8905B]"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6EF] px-6 py-12">
      <FontStyles />
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Wordmark />
          <h1 className="font-display mt-6 text-2xl text-[#2A2622]">Reset your password</h1>
          <p className="font-body mt-2 text-sm leading-relaxed text-[#8A8377]">
            Enter the email on your account and we&rsquo;ll send a link to reset it.
          </p>
        </div>

        <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377]"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="font-body mt-2 w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors placeholder:text-[#B7AF9E] focus:border-b-2 focus:border-[#B8905B] focus:pb-[7px]"
            />
          </div>

          {error && (
            <div className="border-l-2 border-[#A8483D] bg-[#A8483D]/5 py-2 pl-3">
              <p className="font-body text-sm text-[#A8483D]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-body group flex w-full items-center justify-center gap-2 bg-[#16302B] px-4 py-3 text-sm font-medium uppercase tracking-wide text-[#F7F1E4] transition-colors hover:bg-[#1D3B34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8905B] disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset link'}
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

          <div className="text-center">
            <Link
              href="/login"
              className="font-body text-sm text-[#B8905B] underline decoration-transparent underline-offset-4 hover:decoration-[#B8905B]"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}