// frontend/app/inventory/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useAlerts } from '@/lib/api/hooks/useProducts';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { Product } from '@/lib/api/types';
import ProductCard from './components/ProductCard';
import LowStockAlert from './components/LowStockAlert';
import AddStockModal from './components/AddStockModel';
import BarcodeScanner from './components/BarcodeScanner';
import Layout from '@/components/layout/Layout';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  const { user } = useAuth();
  const { data: products, isLoading, error, refetch } = useProducts({
    search: searchTerm,
    category: category || undefined,
  });

  const { data: alerts } = useAlerts({ resolved: false });

  const canManage = user?.role === 'MANAGER' || user?.role === 'CEO';

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'spirit', label: 'Spirit' },
    { value: 'soft_drink', label: 'Soft Drink' },
    { value: 'juice', label: 'Juice' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' },
  ];

  const handleScan = (product: Product) => {
    setScannedProduct(product);
    setShowScanner(false);
    document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622]">Inventory</h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">
              Manage your stock, track low alerts, and scan barcodes
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
            >
              <QrCodeIcon className="h-5 w-5" />
              {showScanner ? 'Hide Scanner' : 'Scan Barcode'}
            </button>
      
            {canManage && (
              <Link
                href="/inventory/new"
                className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </Link>
            )}
          </div>
        </div>

        {/* Barcode Scanner */}
        {showScanner && (
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-[#2A2622]">Scan Barcode</h2>
              <button
                onClick={() => setShowScanner(false)}
                className="p-1 text-[#8A8377] hover:text-[#2A2622] rounded-lg hover:bg-[#F7F1E4] transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </div>
        )}

        {/* Scanned Product Highlight */}
        {scannedProduct && (
          <div className="bg-[#D1FAE5] border border-[#10B981] rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-body font-semibold text-[#065F46]">Product Found!</p>
                <p className="font-body text-sm text-[#065F46]">
                  {scannedProduct.name} — ₦{scannedProduct.default_price}
                </p>
              </div>
            </div>
            <button
              onClick={() => setScannedProduct(null)}
              className="p-1 text-[#065F46] hover:text-[#991B1B] rounded-lg hover:bg-[#A7F3D0] transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Low Stock Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-[#EF4444]" />
              <h2 className="font-display text-lg font-medium text-[#991B1B]">
                Low Stock Alerts ({alerts.length})
              </h2>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <LowStockAlert key={alert.id} alert={alert} />
              ))}
              {alerts.length > 3 && (
                <Link
                  href="/inventory/alerts"
                  className="font-body text-sm text-[#EF4444] hover:text-[#991B1B] font-medium inline-block mt-2"
                >
                  View all {alerts.length} alerts →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-10 py-2 text-[#2A2622] placeholder:text-[#8A8377] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="font-body sm:w-48 border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#DDD5C4] p-6 animate-pulse">
                <div className="h-4 bg-[#F7F1E4] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[#F7F1E4] rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-[#F7F1E4] rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6 text-center">
            <p className="font-body text-[#991B1B]">Error loading products: {error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="font-body mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isHighlighted={scannedProduct?.id === product.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg p-12 text-center">
            <p className="font-body text-[#8A8377] mb-4">No products found</p>
            {canManage ? (
              <Link 
                href="/inventory/new" 
                className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Your First Product
              </Link>
            ) : (
              <p className="font-body text-sm text-[#8A8377]">Contact a manager or CEO to add products</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}