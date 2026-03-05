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
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { useProduct, useProductHistory, useAddStock, useDeleteProduct } from '@/lib/api/hooks/useProducts';
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

  const [showAddStock, setShowAddStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: product, isLoading } = useProduct(productId);
  const { data: history } = useProductHistory(productId);
  const addStock = useAddStock();
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>

    );
  }

  if (!product) {
    return (
        <div className="max-w-4xl mx-auto py-8 text-center">
          <p className="text-gray-600">Product not found</p>
          <Link href="/inventory" className="text-red-600 hover:text-red-700 mt-4 inline-block">
            Back to Inventory
          </Link>
        </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      router.push('/inventory');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const totalStockValue = product.total_stock * product.default_price;

  return (
      <div>
          <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/inventory"
                className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Inventory
              </Link>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-dark-500">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[product.category] || 'bg-gray-100'}`}>
                      {product.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${locationColors[(product as any).location] || 'bg-gray-100'}`}>
                      {(product as any).location || 'Bar'}
                    </span>
                    {(product as any).is_premium && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                        <StarIcon className="h-3 w-3" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddStock(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Stock
                  </button>
                  <Link
                    href={`/inventory/${productId}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                <p className={`text-2xl font-bold ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.total_stock} {product.unit}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Price per Unit</p>
                <p className="text-2xl font-bold text-green-600">₦{product.default_price}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Min Stock Level</p>
                <p className="text-xl font-semibold text-gray-700">{product.min_stock_level} {product.unit}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-xl font-semibold text-green-600">₦{totalStockValue.toLocaleString()}</p>
              </div>
            </div>
            {/* Barcode Section */}
            {product.barcode && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Barcode:</span>
                  <span className="font-mono text-sm">{product.barcode}</span>
                </div>
              </div>
            )}
            {/* Stock Movement History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Stock Movement History</h2>
              {history?.movements && history.movements.length > 0 ? (
                <div className="space-y-3">
                  {history.movements.map((movement: any) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          movement.movement_type === 'restock' ? 'bg-green-100' :
                          movement.movement_type === 'sale' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {movement.movement_type === 'restock' ? '📦' :
                           movement.movement_type === 'sale' ? '💰' : '⚙️'}
                        </div>
                        <div>
                          <p className="font-medium text-dark-500 capitalize">{movement.movement_type}</p>
                          <p className="text-xs text-gray-500">{movement.notes || 'No notes'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No stock movements recorded</p>
              )}
            </div>
          </div>
          {/* Add Stock Modal */}
          {showAddStock && (
            <AddStockModal
              product={product}
              onClose={() => setShowAddStock(false)}
              onAdd={async (data) => {
                await addStock.mutateAsync({
                  id: product.id,
                  ...data,
                  selling_price: product.default_price,
                });
                setShowAddStock(false);
              }}
              isLoading={addStock.isPending}
            />
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Product</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-semibold">{product.name}</span>?
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
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
  );
}