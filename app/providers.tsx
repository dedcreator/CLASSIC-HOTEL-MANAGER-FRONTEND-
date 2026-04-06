// frontend/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Component to handle global refetch on window focus
function WindowFocusHandler() {
  const queryClient = useQueryClient(); // Use useQueryClient instead of QueryClientProvider.useContext()
  
  useEffect(() => {
    const handleFocus = () => {
      // Refetch all active queries when window regains focus
      queryClient.refetchQueries();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);
  
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute - data considered fresh for 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
            retry: 1,
            refetchOnWindowFocus: true, // Refetch when window regains focus
            refetchOnReconnect: true, // Refetch when reconnecting to internet
            refetchOnMount: true, // Refetch when component mounts
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WindowFocusHandler />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #E53E3E',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#1A1A1A',
              border: '1px solid #10B981',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#1A1A1A',
              border: '1px solid #E53E3E',
            },
          },
          loading: {
            style: {
              background: '#1A1A1A',
              border: '1px solid #F59E0B',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}