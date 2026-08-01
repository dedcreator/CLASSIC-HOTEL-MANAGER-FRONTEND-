// frontend/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/api/hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF]">
        {/* Hotel brand loading animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-[#DDD5C4] border-t-[#16302B] animate-spin"></div>
          {/* Inner logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#16302B] flex items-center justify-center">
              <span className="font-display text-sm font-bold text-[#C9A468]">H</span>
            </div>
          </div>
        </div>
        <p className="mt-4 font-body text-sm text-[#8A8377] animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}