// frontend/app/inventory/lounge/[id]/page.tsx
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
  CalendarIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  BeakerIcon,
  GiftIcon,
  CakeIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useProduct, useProductHistory, useAddStock } from '@/lib/api/hooks/useProducts';
import Layout from '@/components/layout/Layout';
import AddStockModal from '../../components/AddStockModel';

const categoryIcons: Record<string, any> = {
  cocktail: BeakerIcon,
  wine: GiftIcon,
  champagne: SparklesIcon,
  coffee: BeakerIcon,
  tea: BeakerIcon,
  snack: CubeIcon,
  dessert: CakeIcon,
  premium_spirit: StarIcon,
};

const categoryColors: Record<string, string> = {
  cocktail: 'bg-purple-100 text-purple-800',
  wine: 'bg-red-100 text-red-800',
  champagne: 'bg-amber-100 text-amber-800',
  coffee: 'bg-brown-100 text-brown-800',
  tea: 'bg-green-100 text-green-800',
  snack: 'bg-yellow-100 text-yellow-800',
  dessert: 'bg-pink-100 text-pink-800',
  premium_spirit: 'bg-indigo-100 text-indigo-800',
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

export default function LoungeItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [showAddStock, setShowAddStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  const { data: product, isLoading } = useProduct(itemId);
  const { data: history } = useProductHistory(itemId, timeRange === 'all' ? 365 : timeRange === 'month' ? 30 : 7);
  const addStock = useAddStock();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <p className="text-gray-600">Item not found</p>
          <Link href="/inventory/lounge" className="text-amber-700 hover:text-amber-800 mt-4 inline-block">
            Back to Lounge Inventory
          </Link>
        </div>
      </Layout>
    );
  }

  const Icon = categoryIcons[product.category] || SparklesIcon;
  const categoryColor = categoryColors[product.category] || 'bg-gray-100 text-gray-800';
  const categoryLabel = categoryLabels[product.category] || product.category;

  const totalStockValue = product.total_stock * product.default_price;
  const totalSales = history?.movements?.filter((m: any) => m.movement_type === 'sale').length || 0;
  const totalRevenue = history?.movements
    ?.filter((m: any) => m.movement_type === 'sale')
    .reduce((sum: number, m: any) => sum + (m.quantity * m.price_at_movement), 0) || 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header with navigation */}
        <div className="mb-6">
          <Link
            href="/inventory/lounge"
            className="inline-flex items-center text-gray-600 hover:text-amber-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Lounge Inventory
          </Link>
        </div>

        {/* Premium Banner for Lounge Items */}
        {product.is_premium && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StarIcon className="h-6 w-6" />
              <div>
                <h2 className="font-semibold">Premium Lounge Item</h2>
                <p className="text-sm text-amber-100">This item is part of our premium collection</p>
              </div>
            </div>
            <span className="bg-white text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
              Premium
            </span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className={`h-2 ${product.is_premium ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-amber-700'}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${categoryColor}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-dark-500">{product.name}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
                          {categoryLabel}
                        </span>
                        {product.barcode && (
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            📦 {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/inventory/lounge/${itemId}/edit`}
                      className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                    <p className={`text-xl font-bold ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.total_stock} {product.unit}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Price per Unit</p>
                    <p className="text-xl font-bold text-amber-700">₦{product.default_price}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Min Stock Level</p>
                    <p className="text-lg font-semibold text-gray-700">{product.min_stock_level} {product.unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="text-lg font-semibold text-green-600">₦{totalStockValue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddStock(true)}
                    className="flex-1 bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Restock Item
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Print Label
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Movement History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-dark-500">Stock Movement History</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeRange === 'week' ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeRange === 'month' ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeRange('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeRange === 'all' ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

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
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No stock movements recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Performance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-dark-500">{totalSales} transactions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Turnover</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {history?.movements ? Math.round(totalSales / (history.movements.length || 1) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Active Batches */}
            {history?.active_batches && history.active_batches.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-dark-500 mb-4">Active Batches</h2>
                <div className="space-y-3">
                  {history.active_batches.map((batch: any) => (
                    <div key={batch.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-dark-500">Batch #{batch.batch_number || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{batch.supplier || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-semibold">{batch.quantity} {product.unit}</span>
                      </div>
                      {batch.cost_price && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Cost:</span>
                          <span className="text-sm">₦{batch.cost_price}</span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Received: {new Date(batch.date_received).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reorder Alert */}
            {product.is_low_stock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ClockIcon className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Current stock ({product.total_stock} {product.unit}) is below minimum level ({product.min_stock_level} {product.unit}).
                </p>
                <button
                  onClick={() => setShowAddStock(true)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Restock Now
                </button>
              </div>
            )}
          </div>
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
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Lounge Item</h3>
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
                onClick={async () => {
                  // Delete logic here
                  setShowDeleteConfirm(false);
                  router.push('/inventory/lounge');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}