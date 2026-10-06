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
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useProduct, useProductHistory, useAddStock, useDeleteProduct } from '@/lib/api/hooks/useProducts';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AddStockModal from '../components/AddStockModel';

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

const locationColors: Record<string, string> = {
  bar: 'bg-[#DBEAFE] text-[#1E40AF]',
  lounge: 'bg-[#FEF3C7] text-[#92400E]',
  both: 'bg-[#F3E8FF] text-[#6B21A5]',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showAddStock, setShowAddStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const { data: product, isLoading, refetch: refetchProduct } = useProduct(productId);
  const { data: history, refetch: refetchHistory } = useProductHistory(productId);
  const addStock = useAddStock();
  const deleteProduct = useDeleteProduct();

  const canDelete = user?.role === 'CEO';
  const canManage = user?.role === 'MANAGER' || user?.role === 'CEO';

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
            <div className="h-8 bg-[#F7F1E4] rounded w-1/2 sm:w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6 space-y-4">
              <div className="h-4 bg-[#F7F1E4] rounded w-3/4"></div>
              <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              <div className="h-4 bg-[#F7F1E4] rounded w-2/3"></div>
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
          <p className="font-body text-[#8A8377]">Product not found</p>
          <Link href="/inventory" className="font-body text-[#16302B] hover:text-[#1D3B34] underline decoration-[#C9A468] underline-offset-4 mt-4 inline-block">
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
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <Link
            href="/inventory"
            className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 text-sm transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <h1 className="font-display text-2xl font-medium text-[#2A2622] break-words">{product.name}</h1>
                {product.is_premium && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F1E4] border border-[#C9A468] rounded-full text-xs font-medium text-[#16302B] whitespace-nowrap">
                    <StarIcon className="h-3.5 w-3.5 text-[#C9A468]" />
                    Premium
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category] || 'bg-[#F5F5F5] text-[#616161]'}`}>
                  {product.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${locationColors[(product as any).location] || 'bg-[#F5F5F5] text-[#616161]'}`}>
                  {(product as any).location || 'Bar'}
                </span>
                {product.is_low_stock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#EF4444]">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    Low Stock
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddStock(true)}
                className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#10B981] border border-transparent rounded-lg hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Stock
              </button>
              <Link
                href={`/inventory/${productId}/edit`}
                className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Link>
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-xs text-[#8A8377] mb-1">Current Stock</p>
            <p className={`font-display text-2xl font-medium ${product.is_low_stock ? 'text-[#EF4444]' : 'text-[#2A2622]'}`}>
              {product.total_stock || 0} <span className="text-sm font-body font-normal text-[#8A8377]">{product.unit}</span>
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-xs text-[#8A8377] mb-1">Price per Unit</p>
            <p className="font-display text-2xl font-medium text-[#16302B]">₦{product.default_price}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-xs text-[#8A8377] mb-1">Min Stock</p>
            <p className="font-display text-2xl font-medium text-[#2A2622]">
              {product.min_stock_level} <span className="text-sm font-body font-normal text-[#8A8377]">{product.unit}</span>
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-xs text-[#8A8377] mb-1">Total Value</p>
            <p className="font-display text-2xl font-medium text-[#C9A468]">₦{totalStockValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Barcode Section */}
        {product.barcode && (
          <div className="bg-[#F7F1E4] rounded-lg border border-[#DDD5C4] p-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <QrCodeIcon className="h-5 w-5 text-[#8A8377] flex-shrink-0" />
              <span className="font-body text-sm text-[#5B564B]">Barcode:</span>
              <span className="font-mono text-sm text-[#2A2622] break-all">{product.barcode}</span>
            </div>
          </div>
        )}

        {/* Stock Movement History */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-6 py-4 bg-[#F7F1E4] flex items-center justify-between hover:bg-[#E8DDCC] transition-colors"
          >
            <h2 className="font-display text-lg font-medium text-[#2A2622] flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-[#C9A468]" />
              Stock Movement History
            </h2>
            {showHistory ? (
              <ChevronUpIcon className="h-5 w-5 text-[#8A8377]" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-[#8A8377]" />
            )}
          </button>
          
          {showHistory && (
            <div className="p-6">
              {history?.movements && history.movements.length > 0 ? (
                <div className="space-y-3">
                  {history.movements.map((movement: any) => (
                    <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F7F1E4] rounded-lg gap-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          movement.movement_type === 'restock' ? 'bg-[#D1FAE5]' :
                          movement.movement_type === 'sale' ? 'bg-[#FEF2F2]' : 'bg-[#F7F1E4]'
                        }`}>
                          <span className="text-lg">
                            {movement.movement_type === 'restock' ? '📦' :
                             movement.movement_type === 'sale' ? '💰' : '⚙️'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-medium text-[#2A2622] capitalize">{movement.movement_type}</p>
                          {movement.notes && (
                            <p className="font-body text-xs text-[#8A8377] truncate">{movement.notes}</p>
                          )}
                          {movement.created_by_name && (
                            <p className="font-body text-xs text-[#8A8377] mt-0.5">By: {movement.created_by_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-12 sm:pl-0">
                        <p className={`font-body font-semibold ${
                          movement.quantity > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {product.unit}
                        </p>
                        <p className="font-body text-xs text-[#8A8377]">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-body text-[#8A8377]">No stock movements recorded</p>
                  <p className="font-body text-sm text-[#8A8377] mt-1">Add stock to start tracking history</p>
                </div>
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
      {showDeleteConfirm && canDelete && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Product</h3>
            <p className="font-body text-[#5B564B] mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#2A2622] break-words">{product.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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