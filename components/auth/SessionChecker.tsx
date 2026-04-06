// frontend/components/auth/SessionChecker.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

export function SessionChecker() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Don't check on login, register, or forgot-password pages
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
    
    if (!loading && !user && !isPublicPath) {
      console.log('Session expired or user not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router, pathname]);
  
  // This component doesn't render anything
  return null;
}