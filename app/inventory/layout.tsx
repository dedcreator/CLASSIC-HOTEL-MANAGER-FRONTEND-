// frontend/app/inventory/layout.tsx
import Layout from '@/components/layout/Layout';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}