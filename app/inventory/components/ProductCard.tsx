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
  StarIcon,
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

  const canDelete = user?.role === 'CEO';

  const categoryColors: Record<string, string> = {
    beer: 'bg-[#FEF3C7] text-[#92400E]',
    wine: 'bg-[#F3E8FF] text-[#6B21A5]',
    spirit: 'bg-[#DBEAFE] text-[#1E40AF]',
    soft_drink: 'bg-[#D1FAE5] text-[#065F46]',
    juice: 'bg-[#FFEDD5] text-[#9A3412]',
    cocktail: 'bg-[#FCE4EC] text-[#831843]',
    champagne: 'bg-[#FEF9C3] text-[#854D0E]',
    coffee: 'bg-[#EDE9D5] text-[#451A03]',
    tea: 'bg-[#E8F5E9] text-[#1B3A1B]',
    snack: 'bg-[#FFF3E0] text-[#BF360C]',
    dessert: 'bg-[#FCE4EC] text-[#880E4F]',
    premium_spirit: 'bg-[#E8EAF6] text-[#1A237E]',
    food: 'bg-[#FBE9E7] text-[#BF360C]',
    other: 'bg-[#F5F5F5] text-[#616161]',
  };

  const unitLabels: Record<string, string> = {
    bottle: 'Bottles',
    pint: 'Pints',
    glass: 'Glasses',
    can: 'Cans',
    shot: 'Shots',
    cup: 'Cups',
    plate: 'Plates',
    piece: 'Pieces',
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

  if (!product || !product.id) {
    return (
      <div className="bg-[#FEF2F2] rounded-lg border border-[#FECACA] p-6">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-[#EF4444]" />
          <div>
            <p className="font-body font-medium text-[#991B1B]">Invalid Product Data</p>
            <p className="font-body text-sm text-[#991B1B]">This product cannot be displayed correctly.</p>
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
          bg-white rounded-lg border-2 transition-all duration-300 p-5
          ${isHighlighted 
            ? 'border-[#C9A468] ring-2 ring-[#C9A468]/20 shadow-md' 
            : 'border-[#DDD5C4] hover:border-[#C9A468] hover:shadow-md'
          }
        `}
      >
        {/* Premium Badge */}
        {product.is_premium && (
          <div className="flex items-center gap-1.5 mb-3 bg-[#F7F1E4] border border-[#C9A468] rounded-full px-3 py-0.5 text-xs font-medium text-[#16302B] w-fit">
            <StarIcon className="h-3.5 w-3.5 text-[#C9A468]" />
            Premium
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-display text-lg font-medium text-[#2A2622]">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${categoryColors[product.category] || 'bg-[#F5F5F5] text-[#616161]'}`}>
                {product.category || 'other'}
              </span>
              {product.is_low_stock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF2F2] text-[#EF4444]">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  Low Stock
                </span>
              )}
            </div>
          </div>
          
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-[#8A8377] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
              title="Delete product"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Barcode */}
        {product.barcode && (
          <div className="flex items-center gap-1.5 text-xs text-[#8A8377] mb-3 bg-[#F7F1E4] rounded-lg px-3 py-1.5 w-fit">
            <QrCodeIcon className="h-4 w-4" />
            <span className="font-mono">{product.barcode}</span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="space-y-2.5 mb-4">
          <div className="flex justify-between items-center border-b border-[#F7F1E4] pb-2">
            <span className="font-body text-sm text-[#8A8377]">Price</span>
            <span className="font-body text-xl font-semibold text-[#16302B]">₦{product.default_price || 0}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#F7F1E4] pb-2">
            <span className="font-body text-sm text-[#8A8377]">Unit</span>
            <span className="font-body text-sm font-medium text-[#2A2622]">{unitLabels[product.unit] || product.unit || 'unit'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-[#8A8377]">Stock</span>
            <div className="flex items-center gap-2">
              <span className={`font-body font-semibold ${product.is_low_stock ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                {product.total_stock || 0} {product.unit || 'units'}
              </span>
            </div>
          </div>
          {product.min_stock_level > 0 && (
            <div className="text-xs text-[#8A8377]">
              Min stock: {product.min_stock_level} {product.unit}
            </div>
          )}
        </div>

        {/* Actions */}
        <Link
          href={`/inventory/${product.id}`}
          className="font-body block w-full text-center px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
        >
          View Details
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && canDelete && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Product</h3>
            
            {deleteError ? (
              <div>
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-body font-medium text-[#991B1B] mb-2">Cannot Delete Product</p>
                      <p className="font-body text-sm text-[#991B1B]">{deleteError}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4 mb-4">
                  <h4 className="font-body text-sm font-medium text-[#92400E] mb-2 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Why is this happening?
                  </h4>
                  <p className="font-body text-sm text-[#92400E] mb-2">
                    This product has stock movement history (purchases, sales, restocks). 
                    Deleting it would break your financial records.
                  </p>
                  <p className="font-body text-sm text-[#92400E]">
                    <span className="font-medium">Solution:</span> Instead of deleting, you can:
                  </p>
                  <ul className="font-body text-sm text-[#92400E] list-disc pl-5 mt-2 space-y-1">
                    <li>Set stock to 0 and mark as inactive</li>
                    <li>Archive the product (recommended)</li>
                    <li>Contact support for force deletion (not recommended)</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href={`/inventory/${product.id}/edit`}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors text-center"
                  >
                    Edit Product
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="font-body text-[#5B564B] mb-6">
                  Are you sure you want to delete <span className="font-semibold text-[#2A2622]">{product.name}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteProduct.isPending}
                    className="font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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