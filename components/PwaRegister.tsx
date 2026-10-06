// frontend/components/PwaRegister.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pushNotifications';

export default function PwaRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
