// frontend/app/inventory/components/AddStockModal.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Product } from '@/lib/api/types';

interface AddStockModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (data: { quantity: number; cost_price?: number; selling_price?: number; notes?: string }) => void;
  isLoading: boolean;
}

export default function AddStockModal({ product, onClose, onAdd, isLoading }: AddStockModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const combinedNotes = [supplier, batchNumber, notes].filter(Boolean).join(' - ');
    
    onAdd({
      quantity,
      cost_price: costPrice ? parseFloat(costPrice) : undefined,
      selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined,
      notes: combinedNotes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#DDD5C4] px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-display text-lg font-medium text-[#2A2622]">Add Stock</h3>
            <p className="font-body text-sm text-[#8A8377] mt-0.5 line-clamp-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A8377] hover:text-[#2A2622] rounded-lg hover:bg-[#F7F1E4] transition-colors flex-shrink-0 ml-2"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4 space-y-5">
          {/* Current Stock Info */}
          <div className="bg-[#F7F1E4] rounded-lg p-4 border border-[#DDD5C4]">
            <div className="flex justify-between items-center text-sm">
              <span className="font-body text-[#5B564B]">Current Stock:</span>
              <span className="font-body font-semibold text-[#16302B]">
                {product.total_stock} {product.unit}
              </span>
            </div>
            {product.min_stock_level > 0 && (
              <div className="flex justify-between items-center text-xs text-[#8A8377] mt-1">
                <span>Minimum Level:</span>
                <span>{product.min_stock_level} {product.unit}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Quantity */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Quantity to Add <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-[#DDD5C4] hover:bg-[#F7F1E4] hover:border-[#C9A468] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <MinusIcon className="h-4 w-4 text-[#8A8377]" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="font-body w-20 text-center border-0 border-b-2 border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] text-lg font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-[#DDD5C4] hover:bg-[#F7F1E4] hover:border-[#C9A468] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <PlusIcon className="h-4 w-4 text-[#8A8377]" />
                </button>
              </div>
            </div>

            {/* Cost Price & Selling Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Cost Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 font-body text-[#8A8377]">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-6 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Selling Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 font-body text-[#8A8377]">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-6 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                    placeholder="Leave empty"
                  />
                </div>
                <p className="font-body text-xs text-[#8A8377] mt-1">
                  Default: ₦{product.default_price}
                </p>
              </div>
            </div>

            {/* Supplier & Batch Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  placeholder="e.g., Guinness Nigeria"
                />
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Batch Number (Optional)
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377] resize-none"
                placeholder="Any additional information..."
              />
            </div>

            {/* Preview */}
            {(supplier || batchNumber || notes) && (
              <div className="p-3 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4]">
                <p className="font-body text-xs text-[#5B564B]">
                  <span className="font-medium">Notes preview:</span>{' '}
                  {[supplier, batchNumber, notes].filter(Boolean).join(' - ')}
                </p>
              </div>
            )}

            {/* Quick add suggestions */}
            <div>
              <p className="font-body text-xs text-[#8A8377] mb-2">Quick add:</p>
              <div className="flex gap-2">
                {[6, 12, 24].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className="flex-1 py-1.5 font-body text-xs font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] hover:border-[#C9A468] transition-colors"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-4 pb-1 flex gap-3 border-t border-[#DDD5C4] mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}