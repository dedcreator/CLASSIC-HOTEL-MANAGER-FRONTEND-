// frontend/app/inventory/components/AddStockModal.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-dark-500">Add Stock</h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="px-4 sm:px-6 py-4 space-y-4">
          {/* Current Stock Info */}
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-700">Current Stock:</span>
              <span className="font-semibold text-red-700">
                {product.total_stock} {product.unit}
              </span>
            </div>
            {product.min_stock_level > 0 && (
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Minimum Level:</span>
                <span>{product.min_stock_level} {product.unit}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Add <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold transition-colors flex-shrink-0"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold transition-colors flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cost Price & Selling Price - Two columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="input-field pl-8 w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="input-field pl-8 w-full"
                    placeholder="Leave empty"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Default: ₦{product.default_price}
                </p>
              </div>
            </div>

            {/* Supplier & Batch Number - Two columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., Guinness Nigeria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number (Optional)
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="input-field w-full"
                placeholder="Any additional information..."
              />
            </div>

            {/* Preview */}
            {(supplier || batchNumber || notes) && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <span className="font-medium text-gray-700">Notes preview:</span>{' '}
                {[supplier, batchNumber, notes].filter(Boolean).join(' - ')}
              </div>
            )}

            {/* Quick add suggestions */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex gap-2">
                {[6, 12, 24].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className="flex-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons - Sticky at bottom */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 flex gap-3 border-t border-gray-200 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary py-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
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