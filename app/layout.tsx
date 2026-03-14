// frontend/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { AuthProvider } from '@/lib/api/hooks/useAuth'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Management System',
  description: 'Complete hotel management with bar inventory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('✅ RootLayout rendering'); 
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}