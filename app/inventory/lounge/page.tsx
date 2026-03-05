// frontend/app/inventory/lounge/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  WineIcon,
  CoffeeIcon,
  CakeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useProducts';
import Layout from '@/components/layout/Layout';
import LoungeProductCard from './components/LoungeProductCard';

const loungeCategories = [
  { id: 'all', name: 'All Items', icon: SparklesIcon },
  { id: 'cocktail', name: 'Cocktails', icon: WineIcon },
  { id: 'wine', name: 'Wine', icon: WineIcon },
  { id: 'champagne', name: 'Champagne', icon: StarIcon },
  { id: 'coffee', name: 'Coffee', icon: CoffeeIcon },
  { id: 'tea', name: 'Tea', icon: CoffeeIcon },
  { id: 'snack', name: 'Snacks', icon: CakeIcon },
  { id: 'dessert', name: 'Desserts', icon: CakeIcon },
  { id: 'premium_spirit', name: 'Premium Spirits', icon: StarIcon },
];

export default function LoungeInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [premiumOnly, setPremiumOnly] = useState(false);

  // Fetch products filtered for lounge
  const { data: productsData, isLoading } = useProducts({ 
    location: 'lounge' 
  });
  
  const products = Array.isArray(productsData) ? productsData : [];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    const matchesPremium = !premiumOnly || product.is_premium;
    
    return matchesSearch && matchesCategory && matchesPremium;
  });

  // Calculate stats
  const totalItems = products.length;
  const premiumItems = products.filter(p => p.is_premium).length;
  const lowStockItems = products.filter(p => p.is_low_stock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.total_stock * p.default_price), 0);

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header with Lounge styling */}
        <div className="bg-gradient-to-r from-amber-900 to-red-800 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SparklesIcon className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Lounge Inventory</h1>
              </div>
              <p className="text-amber-100">Premium beverages and lounge items</p>
            </div>
            <Link
              href="/inventory/lounge/new"
              className="bg-white text-amber-900 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Lounge Item
            </Link>
          </div>
        </div>

        {/* Stats Cards with Lounge theme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-amber-700">{totalItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Premium Items</p>
            <p className="text-2xl font-bold text-amber-700">{premiumItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-green-600">₦{totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lounge items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Premium toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="premium"
              checked={premiumOnly}
              onChange={(e) => setPremiumOnly(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
            />
            <label htmlFor="premium" className="text-sm text-gray-700 flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-amber-500" />
              Show premium items only
            </label>
          </div>

          {/* Category pills */}
          <div className="overflow-x-auto whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {loungeCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
                    ${selectedCategory === category.id
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <SparklesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No lounge items found</p>
            <Link href="/inventory/lounge/new" className="text-amber-700 hover:text-amber-800 font-medium">
              Add your first lounge item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <LoungeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}