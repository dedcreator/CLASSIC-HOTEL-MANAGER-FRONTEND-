// frontend/app/inventory/components/BarcodeScanner.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCodeIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <QrCodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan or type barcode..."
            className={`font-body w-full border-0 border-b ${error ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-10 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
            disabled={scanMutation.isPending}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={scanMutation.isPending || !barcode.trim()}
            className="font-body inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanMutation.isPending ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Find'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-body inline-flex items-center justify-center p-2 text-[#8A8377] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] hover:text-[#16302B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 flex items-start gap-2">
          <span className="text-[#EF4444] text-sm mt-0.5">⚠️</span>
          <div>
            <p className="font-body text-sm text-[#991B1B]">{error}</p>
            <p className="font-body text-xs text-[#991B1B] mt-0.5">
              Try scanning again or enter the barcode manually
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#F7F1E4] rounded-lg p-3 border border-[#DDD5C4]">
        <div className="flex items-start gap-2">
          <span className="text-[#C9A468] text-sm mt-0.5">📱</span>
          <div>
            <p className="font-body text-sm text-[#5B564B]">
              Connect a barcode scanner or type manually
            </p>
            <p className="font-body text-xs text-[#8A8377] mt-0.5">
              Scanner will automatically submit when finished
            </p>
          </div>
        </div>
      </div>

      {/* Scanner status indicator */}
      {scanMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-[#8A8377]">
          <div className="h-2 w-2 rounded-full bg-[#C9A468] animate-pulse" />
          <span className="font-body">Scanning...</span>
        </div>
      )}
    </div>
  );
}