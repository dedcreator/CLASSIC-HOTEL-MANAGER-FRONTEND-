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
  const [sellingPrice, setSellingPrice] = useState<string>(''); // Add this
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine notes fields
    const combinedNotes = [supplier, batchNumber, notes].filter(Boolean).join(' - ');
    
    onAdd({
      quantity,
      cost_price: costPrice ? parseFloat(costPrice) : undefined,
      selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined, // Add this
      notes: combinedNotes || undefined,
    });
  };

  const accentColor = 'red';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-dark-500">Add Stock</h3>
            <p className="text-sm text-gray-500 mt-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Current Stock Info */}
        <div className={`mb-4 p-3 bg-${accentColor}-50 rounded-lg border border-${accentColor}-200`}>
          <div className="flex justify-between items-center text-sm">
            <span className={`text-${accentColor}-700`}>Current Stock:</span>
            <span className={`font-semibold text-${accentColor}-700`}>
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
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold transition-colors"
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
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Cost Price */}
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
                className="input-field pl-8"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Selling Price - ADD THIS SECTION */}
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
                className="input-field pl-8"
                placeholder="Leave empty to use default price"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current price: ₦{product.default_price}
            </p>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier (Optional)
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="input-field"
              placeholder="e.g., Guinness Nigeria"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number (Optional)
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="input-field"
              placeholder="e.g., BATCH-2024-001"
            />
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
              className="input-field"
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 bg-${accentColor}-600 text-white py-2 px-4 rounded-lg hover:bg-${accentColor}-700 disabled:opacity-50 transition-colors font-medium`}
            >
              {isLoading ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>

        {/* Quick add suggestions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick add:</p>
          <div className="flex gap-2">
            {[6, 12, 24].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className="flex-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                +{qty}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}