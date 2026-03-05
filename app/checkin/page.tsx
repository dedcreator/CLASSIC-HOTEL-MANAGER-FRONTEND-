// frontend/app/checkin/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual check-in component with SSR disabled
const CheckinClient = dynamic(
  () => import('./CheckinClient'),
  { ssr: false }
);

export default function CheckinPage() {
  return <CheckinClient />;
}