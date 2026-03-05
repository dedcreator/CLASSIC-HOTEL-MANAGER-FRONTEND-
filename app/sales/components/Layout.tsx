// frontend/app/sales/layout.tsx
import Layout from '@/components/layout/Layout';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}