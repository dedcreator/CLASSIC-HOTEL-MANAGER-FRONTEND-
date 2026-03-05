// frontend/app/inventory/components/BarcodeScanner.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useScanBarcode } from '@/lib/api/hooks/useProducts';
import { Product } from '@/lib/api/types';

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const scanMutation = useScanBarcode();

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setError('');
    try {
      const product = await scanMutation.mutateAsync(barcode);
      onScan(product);
      setBarcode('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Product not found');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle barcode scanner input (usually ends with Enter)
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <QrCodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan or type barcode..."
            className="input-field pl-10"
            disabled={scanMutation.isPending}
          />
        </div>
        <button
          type="submit"
          disabled={scanMutation.isPending || !barcode.trim()}
          className="btn-primary px-6"
        >
          {scanMutation.isPending ? 'Searching...' : 'Find'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary px-4"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>📱 Connect a barcode scanner or type manually</p>
        <p className="mt-1">Scanner will automatically submit when finished</p>
      </div>
    </div>
  );
}