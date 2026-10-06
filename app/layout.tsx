// frontend/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { AuthProvider } from '@/lib/api/hooks/useAuth';
import { SessionChecker } from '@/components/auth/SessionChecker';
import PwaRegister from '@/components/PwaRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Classic Hotel Management System',
  description: 'Complete hotel management for Classic HOTEL with bar inventory, POS, and real-time alerts.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Classic Hotel',
  },
};

export const viewport: Viewport = {
  themeColor: '#16302B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Classic Hotel" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <SessionChecker />
            <PwaRegister />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}