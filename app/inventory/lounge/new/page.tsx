// frontend/app/inventory/lounge/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  SparklesIcon,
  StarIcon,
  BeakerIcon,
  GiftIcon,
  CakeIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { useCreateProduct } from '@/lib/api/hooks/useProducts';
import Layout from '@/components/layout/Layout';

const loungeCategories = [
  { value: 'cocktail', label: 'Cocktail', icon: BeakerIcon, color: 'bg-purple-100 text-purple-800' },
  { value: 'wine', label: 'Wine', icon: GiftIcon, color: 'bg-red-100 text-red-800' },
  { value: 'champagne', label: 'Champagne', icon: SparklesIcon, color: 'bg-amber-100 text-amber-800' },
  { value: 'coffee', label: 'Coffee', icon: BeakerIcon, color: 'bg-brown-100 text-brown-800' },
  { value: 'tea', label: 'Tea', icon: BeakerIcon, color: 'bg-green-100 text-green-800' },
  { value: 'snack', label: 'Snack', icon: CubeIcon, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'dessert', label: 'Dessert', icon: CakeIcon, color: 'bg-pink-100 text-pink-800' },
  { value: 'premium_spirit', label: 'Premium Spirit', icon: StarIcon, color: 'bg-indigo-100 text-indigo-800' },
];

const units = [
  { value: 'bottle', label: 'Bottle' },
  { value: 'glass', label: 'Glass' },
  { value: 'shot', label: 'Shot' },
  { value: 'cup', label: 'Cup' },
  { value: 'plate', label: 'Plate' },
  { value: 'piece', label: 'Piece' },
];

export default function NewLoungeItemPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    name: '',
    category: 'cocktail',
    default_price: '',
    unit: 'bottle',
    barcode: '',
    min_stock_level: '5',
    location: 'lounge',
    is_premium: false,
  });

  const [selectedCategory, setSelectedCategory] = useState(loungeCategories[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        category: formData.category,
        default_price: parseFloat(formData.default_price),
        unit: formData.unit,
        barcode: formData.barcode || undefined,
        min_stock_level: parseInt(formData.min_stock_level),
        location: 'lounge',
        is_premium: formData.is_premium,
      });
      router.push('/inventory/lounge');
    } catch (error) {
      console.error('Failed to create lounge item:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategorySelect = (category: typeof loungeCategories[0]) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category: category.value }));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-20">
        {/* Header with Lounge styling */}
        <div className="mb-6">
          <Link
            href="/inventory/lounge"
            className="inline-flex items-center text-gray-600 hover:text-amber-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Lounge Inventory
          </Link>
          
          <div className="bg-gradient-to-r from-amber-900 to-red-800 text-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <SparklesIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Add Lounge Item</h1>
            </div>
            <p className="text-amber-100">Add a new premium item to your lounge inventory</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Premium Toggle */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <StarIcon className="h-6 w-6 text-amber-600" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Premium Item
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Premium items get a special badge and appear in premium collections
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {loungeCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory.value === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`
                        p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                        ${isSelected 
                          ? 'border-amber-700 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-full ${category.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? 'text-amber-700' : 'text-gray-600'}`}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Aged Single Malt, Premium Champagne, Artisan Coffee"
              />
            </div>

            {/* Price and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="default_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  id="default_price"
                  name="default_price"
                  value={formData.default_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="input-field"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                id="min_stock_level"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll be alerted when stock falls below this number
              </p>
            </div>

            {/* Barcode */}
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode (optional)
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="input-field"
                placeholder="Scan or enter barcode"
              />
            </div>

            {/* Preview Card */}
            {formData.name && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="bg-white rounded-lg p-4 border-2 border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCategory.color}`}>
                      {selectedCategory.icon && <selectedCategory.icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-500">{formData.name}</p>
                      <p className="text-sm text-gray-600">{selectedCategory.label}</p>
                    </div>
                    {formData.is_premium && (
                      <div className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <StarIcon className="h-3 w-3" />
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-lg font-bold text-amber-700">₦{parseFloat(formData.default_price || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/inventory/lounge"
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createProduct.isPending}
                className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50 transition-colors"
              >
                {createProduct.isPending ? 'Creating...' : 'Add Lounge Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}