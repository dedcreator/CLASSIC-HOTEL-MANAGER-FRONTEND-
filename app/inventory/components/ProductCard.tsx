// frontend/app/inventory/components/ProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  QrCodeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Product } from '@/lib/api/types';
import { useDeleteProduct } from '@/lib/api/hooks/useProducts';
import { useAuth } from '@/lib/api/hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  isHighlighted?: boolean;
  onProductDeleted?: () => void;
}

export default function ProductCard({ product, isHighlighted, onProductDeleted }: ProductCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const deleteProduct = useDeleteProduct();
  const { user } = useAuth();

  // Check permissions - only CEO can delete
  const canDelete = user?.role === 'ceo';

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
    if (!product || !product.id) {
      toast.error('Invalid product data');
      return;
    }

    try {
      await deleteProduct.mutateAsync(product.id);
      setShowDeleteConfirm(false);
      
      // Call the callback to refresh the parent component
      if (onProductDeleted) {
        onProductDeleted();
      }
    } catch (error: any) {
      console.error('Failed to delete:', error);
      
      const errorMsg = error.message || error.response?.data?.error;
      
      if (errorMsg?.includes('stock movement history') || errorMsg?.includes('cannot be deleted')) {
        setDeleteError(
          'This product has stock movement history and cannot be deleted. ' +
          'You can deactivate it instead to hide it from the inventory.'
        );
      } else {
        setDeleteError(errorMsg || 'Failed to delete product. Please try again.');
      }
    }
  };

  const handleDeleteClick = () => {
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  // If product is invalid, show error
  if (!product || !product.id) {
    return (
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          <div>
            <p className="text-red-700 font-medium">Invalid Product Data</p>
            <p className="text-sm text-red-600">This product cannot be displayed correctly.</p>
          </div>
        </div>
      </div>
    );
  }

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
              {product.category || 'other'}
            </span>
          </div>
          
          {/* Only show delete button for CEO */}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete product"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
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
            <span className="text-lg font-bold text-red-600">₦{product.default_price || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Unit:</span>
            <span className="text-sm font-medium">{unitLabels[product.unit] || product.unit || 'unit'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Stock:</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${product.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                {product.total_stock || 0} {product.unit || 'units'}
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

        {/* Actions - Only View Details button */}
        <div className="flex gap-2">
          <Link
            href={`/inventory/${product.id}`}
            className="w-full btn-primary text-sm py-2 text-center"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && canDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Product</h3>
            
            {deleteError ? (
              <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium mb-2">Cannot Delete Product</p>
                      <p className="text-sm text-red-600">{deleteError}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Why is this happening?
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    This product has stock movement history (purchases, sales, restocks). 
                    Deleting it would break your financial records.
                  </p>
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Solution:</span> Instead of deleting, you can:
                  </p>
                  <ul className="text-sm text-yellow-700 list-disc pl-5 mt-2 space-y-1">
                    <li>Set stock to 0 and mark as inactive</li>
                    <li>Archive the product (recommended)</li>
                    <li>Contact support for force deletion (not recommended)</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Close
                  </button>
                  <Link
                    href={`/inventory/${product.id}/edit`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
                  >
                    Edit Product
                  </Link>
                </div>
              </div>
            ) : (
              <>
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
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}