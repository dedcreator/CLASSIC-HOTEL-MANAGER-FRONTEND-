// frontend/app/inventory/components/ProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { Product } from '@/lib/api/types';
import { useDeleteProduct, useAddStock } from '@/lib/api/hooks/useProducts';
import { useAuth } from '@/lib/api/hooks/useAuth';
import AddStockModal from './AddStockModel';

interface ProductCardProps {
  product: Product;
  isHighlighted?: boolean;
}

export default function ProductCard({ product, isHighlighted }: ProductCardProps) {
  const [showAddStock, setShowAddStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deleteProduct = useDeleteProduct();
  const addStock = useAddStock();
  const { user } = useAuth();

  // Check if user is manager or CEO
  const canManage = user?.role === 'manager' || user?.role === 'ceo';
  // Check if user is admin or CEO (for delete permission)
  const canDelete = user?.role === 'ceo'; // CEO only for delete

  const categoryColors: Record<string, string> = {
    beer: 'bg-yellow-100 text-yellow-800',
    wine: 'bg-purple-100 text-purple-800',
    spirit: 'bg-blue-100 text-blue-800',
    soft_drink: 'bg-green-100 text-green-800',
    juice: 'bg-orange-100 text-orange-800',
    cocktail: 'bg-pink-100 text-pink-800',
    food: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const unitLabels: Record<string, string> = {
    bottle: 'Bottles',
    pint: 'Pints',
    glass: 'Glasses',
    can: 'Cans',
    shot: 'Shots',
    plate: 'Plates',
    unit: 'Units',
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAddStock = async (data: { quantity: number; cost_price?: number; notes?: string }) => {
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
        id={`product-${product.id}`}
        className={`
          bg-white rounded-lg shadow-sm border-2 transition-all duration-300 p-6
          ${isHighlighted ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:shadow-md'}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-dark-500">{product.name}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${categoryColors[product.category] || 'bg-gray-100'}`}>
              {product.category}
            </span>
          </div>
          
          {/* Only show edit/delete buttons for managers and CEOs */}
          {canManage && (
            <div className="flex gap-1">
              <Link
                href={`/inventory/${product.id}/edit`}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </Link>
              {/* Only CEO can delete */}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Barcode */}
        {product.barcode && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <QrCodeIcon className="h-4 w-4" />
            <span className="font-mono">{product.barcode}</span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="text-lg font-bold text-red-600">₦{product.default_price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Unit:</span>
            <span className="text-sm font-medium">{unitLabels[product.unit] || product.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Stock:</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${product.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                {product.total_stock} {product.unit}
              </span>
              {product.is_low_stock && (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Low Stock" />
              )}
            </div>
          </div>
          {product.min_stock_level > 0 && (
            <div className="text-xs text-gray-500">
              Min stock: {product.min_stock_level} {product.unit}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Add Stock button only for managers and CEOs */}
          {canManage ? (
            <button
              onClick={() => setShowAddStock(true)}
              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              Add Stock
            </button>
          ) : (
            // For bar staff, show a disabled or hidden button, or just empty space
            <div className="flex-1"></div>
          )}
          <Link
            href={`/inventory/${product.id}`}
            className="flex-1 btn-primary text-sm py-2 text-center"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Add Stock Modal - Only shown for managers/CEOs */}
      {showAddStock && canManage && (
        <AddStockModal
          product={product}
          onClose={() => setShowAddStock(false)}
          onAdd={handleAddStock}
          isLoading={addStock.isPending}
        />
      )}

      {/* Delete Confirmation Modal - Only shown for CEO */}
      {showDeleteConfirm && canDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>? This action cannot be undone.
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
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
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