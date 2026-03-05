// frontend/app/inventory/lounge/components/LoungeProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  BeakerIcon,      // For cocktails
  GiftIcon,        // For wine
  FireIcon,        // For premium
  CakeIcon,        // For desserts
  CubeIcon,        // For snacks
  HeartIcon,
} from '@heroicons/react/24/outline';
import { Product } from '@/lib/api/types';
import { useDeleteProduct, useAddStock } from '@/lib/api/hooks/useProducts';

interface LoungeProductCardProps {
  product: Product;
}

const categoryIcons: Record<string, any> = {
  cocktail: BeakerIcon,
  wine: GiftIcon,
  champagne: SparklesIcon,
  coffee: FireIcon,
  tea: FireIcon,
  snack: CubeIcon,
  dessert: CakeIcon,
  premium_spirit: StarIcon,
};

const categoryColors: Record<string, string> = {
  cocktail: 'bg-purple-100 text-purple-800 border-purple-200',
  wine: 'bg-red-100 text-red-800 border-red-200',
  champagne: 'bg-amber-100 text-amber-800 border-amber-200',
  coffee: 'bg-brown-100 text-brown-800 border-brown-200',
  tea: 'bg-green-100 text-green-800 border-green-200',
  snack: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dessert: 'bg-pink-100 text-pink-800 border-pink-200',
  premium_spirit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const categoryLabels: Record<string, string> = {
  cocktail: 'Cocktail',
  wine: 'Wine',
  champagne: 'Champagne',
  coffee: 'Coffee',
  tea: 'Tea',
  snack: 'Snack',
  dessert: 'Dessert',
  premium_spirit: 'Premium Spirit',
};

export default function LoungeProductCard({ product }: LoungeProductCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  
  const deleteProduct = useDeleteProduct();
  const addStock = useAddStock();

  const Icon = categoryIcons[product.category] || SparklesIcon;
  const categoryColor = categoryColors[product.category] || 'bg-gray-100 text-gray-800';
  const categoryLabel = categoryLabels[product.category] || product.category;

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAddStock = async (data: { quantity: number; notes?: string }) => {
    await addStock.mutateAsync({
      id: product.id,
      ...data,
      selling_price: product.default_price,
    });
    setShowAddStock(false);
  };

  return (
    <>
      <div 
        className={`
          bg-white rounded-lg shadow-sm border-2 transition-all duration-300 overflow-hidden
          ${product.is_premium 
            ? 'border-amber-300 hover:shadow-amber-200' 
            : 'border-gray-200 hover:shadow-md'
          }
          ${product.is_low_stock ? 'border-l-4 border-l-red-500' : ''}
        `}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Premium Badge for Lounge Items */}
        {product.is_premium && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs py-1 px-3 flex items-center justify-center gap-1">
            <StarIcon className="h-3 w-3" />
            <span>PREMIUM LOUNGE ITEM</span>
            <StarIcon className="h-3 w-3" />
          </div>
        )}

        {/* Regular header for non-premium */}
        {!product.is_premium && (
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        )}
        
        <div className="p-5">
          {/* Header with Icon and Category */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${categoryColor.split(' ')[0]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-500 line-clamp-1">{product.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
                  {categoryLabel}
                </span>
              </div>
            </div>
            
            {/* Action buttons (appear on hover) */}
            <div className={`flex gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
              <Link
                href={`/inventory/lounge/${product.id}/edit`}
                className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              {product.can_delete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Barcode (if available) */}
          {product.barcode && (
            <div className="mb-3 text-xs text-gray-400 font-mono bg-gray-50 p-1.5 rounded">
              📦 {product.barcode}
            </div>
          )}

          {/* Price and Stock Info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-xl font-bold text-amber-700">₦{product.default_price}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock:</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.total_stock} {product.unit}
                </span>
                {product.is_low_stock && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="Low Stock" />
                )}
              </div>
            </div>

            {product.min_stock_level > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                Min stock: {product.min_stock_level} {product.unit}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowAddStock(true)}
              className="flex items-center justify-center gap-1 bg-amber-100 text-amber-700 py-2 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
            >
              <PlusIcon className="h-4 w-4" />
              Restock
            </button>
            <Link
              href={`/inventory/lounge/${product.id}`}
              className="flex items-center justify-center bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>

          {/* Quick Actions (appear on hover) */}
          {showActions && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <button className="text-gray-500 hover:text-amber-700 transition-colors">
                View History
              </button>
              <button className="text-gray-500 hover:text-amber-700 transition-colors">
                Transfer to Bar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Restock {product.name}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddStock({
                quantity: parseInt(formData.get('quantity') as string),
                notes: formData.get('notes') as string,
              });
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to add
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  className="input-field"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  className="input-field"
                  placeholder="Supplier, batch number, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStock(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStock.isPending}
                  className="btn-primary"
                >
                  {addStock.isPending ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}