// frontend/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

console.log('✅ providers.tsx is loaded'); // Add this line

export default function Providers({ children }: { children: React.ReactNode }) {
  console.log('✅ Providers rendering'); // Add this line
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #E53E3E',
          },
          success: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}