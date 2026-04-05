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

  // Check if user is manager or CEO
  const canManage = user?.role === 'manager' || user?.role === 'ceo';

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-500">Bar Inventory</h1>
            <p className="text-sm text-gray-600">Manage your stock, track low alerts, and scan barcodes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="btn-secondary flex items-center gap-2"
            >
              <QrCodeIcon className="h-5 w-5" />
              {showScanner ? 'Hide Scanner' : 'Scan Barcode'}
            </button>
      
            {/* Only show Add Product button for managers and CEOs */}
            {canManage && (
              <Link
                href="/inventory/new"
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </Link>
            )}
          </div>
        </div>
        {/* Barcode Scanner Modal */}
        {showScanner && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Scan Barcode</h2>
            <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </div>
        )}
        {/* Scanned Product Highlight */}
        {scannedProduct && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-green-800 font-semibold">✓ Product Found!</p>
              <p className="text-sm text-green-700">{scannedProduct.name} - ₦{scannedProduct.default_price}</p>
            </div>
            <button
              onClick={() => setScannedProduct(null)}
              className="text-green-800 hover:text-green-900"
            >
              Dismiss
            </button>
          </div>
        )}
        {/* Low Stock Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-red-800">Low Stock Alerts ({alerts.length})</h2>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <LowStockAlert key={alert.id} alert={alert} />
              ))}
              {alerts.length > 3 && (
                <Link
                  href="/inventory/alerts"
                  className="text-sm text-red-600 hover:text-red-700 font-medium block mt-2"
                >
                  View all {alerts.length} alerts →
                </Link>
              )}
            </div>
          </div>
        )}
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field sm:w-48"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              className="btn-secondary px-4 flex items-center gap-2"
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
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading products: {error.message}</p>
            <button onClick={() => refetch()} className="btn-primary mt-4">
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No products found</p>
            {canManage ? (
              <Link href="/inventory/new" className="btn-primary">
                Add Your First Product
              </Link>
            ) : (
              <p className="text-sm text-gray-500">Contact a manager or CEO to add products</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}