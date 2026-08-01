// frontend/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Component to handle global refetch on window focus
function WindowFocusHandler() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleFocus = () => {
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
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,
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
            background: '#FFFFFF',
            color: '#2A2622',
            border: '1px solid #DDD5C4',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: "'Work Sans', sans-serif",
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#FFFFFF',
              border: '1px solid #10B981',
              color: '#065F46',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#FFFFFF',
              border: '1px solid #EF4444',
              color: '#991B1B',
            },
          },
          loading: {
            style: {
              background: '#FFFFFF',
              border: '1px solid #C9A468',
              color: '#2A2622',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}