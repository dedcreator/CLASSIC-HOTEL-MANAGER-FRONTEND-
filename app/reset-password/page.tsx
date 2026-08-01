// frontend/app/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { passwordResetService } from '@/lib/api/passwordReset';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link');
        setVerifying(false);
        return;
      }

      try {
        const result = await passwordResetService.verifyToken(token);
        if (result.valid) {
          setTokenValid(true);
        } else {
          setError(result.message || 'Invalid reset token');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired reset link');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await passwordResetService.resetPassword(token!, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 rounded-full border-4 border-[#DDD5C4] border-t-[#16302B] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#16302B] flex items-center justify-center">
              <span className="font-display text-sm font-bold text-[#C9A468]">H</span>
            </div>
          </div>
        </div>
        <p className="mt-4 font-body text-[#8A8377]">Verifying your reset link...</p>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FEF2F2]">
          <XCircleIcon className="h-8 w-8 text-[#EF4444]" />
        </div>
        <h3 className="mt-4 font-display text-lg font-medium text-[#2A2622]">Invalid Reset Link</h3>
        <p className="mt-2 font-body text-sm text-[#8A8377]">{error}</p>
        <div className="mt-6">
          <Link
            href="/forgot-password"
            className="font-body text-sm font-medium text-[#16302B] hover:text-[#1D3B34] underline decoration-[#C9A468] underline-offset-4"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#D1FAE5]">
          <CheckCircleIcon className="h-8 w-8 text-[#10B981]" />
        </div>
        <h3 className="mt-4 font-display text-lg font-medium text-[#2A2622]">Password Reset Successfully</h3>
        <p className="mt-2 font-body text-sm text-[#8A8377]">
          Your password has been reset. Redirecting you to the login page...
        </p>
        <div className="mt-4">
          <div className="w-full bg-[#F7F1E4] rounded-full h-1.5">
            <div className="bg-[#16302B] h-1.5 rounded-full animate-[progress_3s_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="font-body block text-sm font-medium text-[#5B564B]">
          New Password
        </label>
        <div className="mt-1.5 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pr-10 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-0 flex items-center text-[#8A8377] hover:text-[#2A2622] transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-1 font-body text-xs text-[#8A8377]">Must be at least 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="font-body block text-sm font-medium text-[#5B564B]">
          Confirm New Password
        </label>
        <div className="mt-1.5 relative">
          <input
            id="confirm-password"
            name="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pr-10 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-0 flex items-center text-[#8A8377] hover:text-[#2A2622] transition-colors"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {password && confirmPassword && password !== confirmPassword && (
          <p className="mt-1 font-body text-xs text-[#EF4444]">Passwords do not match</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-4">
          <div className="flex items-start gap-3">
            <XCircleIcon className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-[#991B1B]">{error}</p>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="font-body w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#F7F1E4] bg-[#16302B] hover:bg-[#1D3B34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A468] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-[#F7F1E4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting password...
            </span>
          ) : (
            'Reset password'
          )}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="font-body text-sm text-[#8A8377] hover:text-[#16302B] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16302B]">
              <span className="font-display text-xl font-bold text-[#C9A468]">H</span>
            </div>
            <h1 className="font-display text-3xl font-medium text-[#2A2622]">
              Hotel <span className="text-[#C9A468]">Manager</span>
            </h1>
          </div>
          <h2 className="mt-6 font-display text-2xl font-medium text-[#2A2622]">Create new password</h2>
          <p className="mt-2 font-body text-sm text-[#8A8377]">
            Enter your new password below
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#DDD5C4] rounded-lg sm:px-10">
          <Suspense fallback={
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-[#DDD5C4] border-t-[#16302B] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-[#16302B] flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-[#C9A468]">H</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 font-body text-[#8A8377]">Loading...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}