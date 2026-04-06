// frontend/app/inventory/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  StarIcon,
  ClockIcon,
  QrCodeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useProduct, useProductHistory, useAddStock, useDeleteProduct } from '@/lib/api/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AddStockModal from '../components/AddStockModel';

const categoryColors: Record<string, string> = {
  beer: 'bg-yellow-100 text-yellow-800',
  wine: 'bg-red-100 text-red-800',
  spirit: 'bg-blue-100 text-blue-800',
  soft_drink: 'bg-green-100 text-green-800',
  juice: 'bg-orange-100 text-orange-800',
  cocktail: 'bg-purple-100 text-purple-800',
  champagne: 'bg-amber-100 text-amber-800',
  coffee: 'bg-brown-100 text-brown-800',
  tea: 'bg-green-100 text-green-800',
  snack: 'bg-yellow-100 text-yellow-800',
  dessert: 'bg-pink-100 text-pink-800',
  premium_spirit: 'bg-indigo-100 text-indigo-800',
  food: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};

const locationColors = {
  bar: 'bg-blue-100 text-blue-800',
  lounge: 'bg-amber-100 text-amber-800',
  both: 'bg-purple-100 text-purple-800',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const queryClient = useQueryClient();

  const [showAddStock, setShowAddStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const { data: product, isLoading, refetch: refetchProduct } = useProduct(productId);
  const { data: history, refetch: refetchHistory } = useProductHistory(productId);
  const addStock = useAddStock();
  const deleteProduct = useDeleteProduct();

  // Function to refresh all data after adding stock
  const refreshData = async () => {
    await Promise.all([
      refetchProduct(),
      refetchHistory(),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['product', productId] }),
      queryClient.invalidateQueries({ queryKey: ['product-history', productId] }),
    ]);
  };

  const handleAddStock = async (data: { quantity: number; cost_price?: number; selling_price?: number; notes?: string }) => {
    try {
      await addStock.mutateAsync({
        id: productId,
        ...data,
        selling_price: data.selling_price || product?.default_price,
      });
      
      // Refresh all data
      await refreshData();
      setShowAddStock(false);
      
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      router.push('/inventory');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <p className="text-gray-600">Product not found</p>
          <Link href="/inventory" className="text-red-600 hover:text-red-700 mt-4 inline-block">
            Back to Inventory
          </Link>
        </div>
      </Layout>
    );
  }

  const totalStockValue = (product.total_stock || 0) * (product.default_price || 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/inventory"
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Inventory
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-dark-500 break-words">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${categoryColors[product.category] || 'bg-gray-100'}`}>
                  {product.category}
                </span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${locationColors[(product as any).location] || 'bg-gray-100'}`}>
                  {(product as any).location || 'Bar'}
                </span>
                {(product as any).is_premium && (
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                    <StarIcon className="h-3 w-3" />
                    Premium
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowAddStock(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <PlusIcon className="h-4 w-4" />
                Add Stock
              </button>
              <Link
                href={`/inventory/${productId}/edit`}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-600 mb-1">Current Stock</p>
            <p className={`text-lg sm:text-2xl font-bold break-words ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
              {product.total_stock || 0} {product.unit}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-600 mb-1">Price per Unit</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 break-words">₦{product.default_price}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-600 mb-1">Min Stock</p>
            <p className="text-base sm:text-xl font-semibold text-gray-700 break-words">{product.min_stock_level} {product.unit}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-600 mb-1">Total Value</p>
            <p className="text-base sm:text-xl font-semibold text-green-600 break-words">₦{totalStockValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Barcode Section */}
        {product.barcode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <QrCodeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Barcode:</span>
              <span className="font-mono text-xs sm:text-sm break-all">{product.barcode}</span>
            </div>
          </div>
        )}

        {/* Stock Movement History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 sm:px-6 py-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-base sm:text-lg font-semibold text-dark-500 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Stock Movement History
            </h2>
            {showHistory ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showHistory && (
            <div className="p-4 sm:p-6">
              {history?.movements && history.movements.length > 0 ? (
                <div className="space-y-3">
                  {history.movements.map((movement: any) => (
                    <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          movement.movement_type === 'restock' ? 'bg-green-100' :
                          movement.movement_type === 'sale' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-lg">
                            {movement.movement_type === 'restock' ? '📦' :
                             movement.movement_type === 'sale' ? '💰' : '⚙️'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-500 capitalize">{movement.movement_type}</p>
                          <p className="text-xs text-gray-500 truncate">{movement.notes || 'No notes'}</p>
                          {movement.created_by_name && (
                            <p className="text-xs text-gray-400 mt-1">By: {movement.created_by_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-12 sm:pl-0">
                        <p className={`font-semibold ${
                          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No stock movements recorded</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <AddStockModal
          product={product}
          onClose={() => setShowAddStock(false)}
          onAdd={handleAddStock}
          isLoading={addStock.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold break-words">{product.name}</span>?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 w-full sm:w-auto"
              >
                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}