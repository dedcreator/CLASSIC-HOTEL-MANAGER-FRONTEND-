// frontend/app/inventory/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { useProduct, useUpdateProduct } from '@/lib/api/hooks/useProducts';
import Layout from '@/components/layout/Layout';

// Define types to match your Product interface
type ProductCategory = 'beer' | 'wine' | 'spirit' | 'soft_drink' | 'juice' | 'cocktail' | 'food' | 'other';
type ProductUnit = 'bottle' | 'pint' | 'glass' | 'can' | 'shot' | 'plate' | 'unit';
type ProductLocation = 'bar' | 'lounge' | 'both';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as ProductCategory,
    default_price: '',
    unit: 'unit' as ProductUnit,
    barcode: '',
    min_stock_level: '10',
    location: 'bar' as ProductLocation,
    is_premium: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: (product.category as ProductCategory) || 'other',
        default_price: product.default_price?.toString() || '',
        unit: (product.unit as ProductUnit) || 'unit',
        barcode: product.barcode || '',
        min_stock_level: product.min_stock_level?.toString() || '10',
        location: (product.location as ProductLocation) || 'bar',
        is_premium: product.is_premium || false,
      });
    }
  }, [product]);

  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'spirit', label: 'Spirit' },
    { value: 'soft_drink', label: 'Soft Drink' },
    { value: 'juice', label: 'Juice' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' },
  ];

  const units: { value: ProductUnit; label: string }[] = [
    { value: 'bottle', label: 'Bottle' },
    { value: 'pint', label: 'Pint' },
    { value: 'glass', label: 'Glass' },
    { value: 'can', label: 'Can' },
    { value: 'shot', label: 'Shot' },
    { value: 'plate', label: 'Plate' },
    { value: 'unit', label: 'Unit' },
  ];

  const locations: { value: ProductLocation; label: string }[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'both', label: 'Both' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare the data to send - only include fields that have changed
      const updateData = {
        id: productId,
        name: formData.name,
        category: formData.category,
        default_price: parseFloat(formData.default_price),
        unit: formData.unit,
        barcode: formData.barcode || null,
        min_stock_level: parseInt(formData.min_stock_level),
        location: formData.location,
        is_premium: formData.is_premium,
      };

      console.log('Sending update data:', updateData);
      
      await updateProduct.mutateAsync(updateData);
      router.push(`/inventory/${productId}`);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center px-4">
          <h2 className="text-2xl font-bold text-dark-500 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're trying to edit doesn't exist.</p>
          <Link href="/inventory" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Inventory
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Link
          href={`/inventory/${productId}`}
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Product
        </Link>

        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-red-100 mt-1">{product.name}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
            </div>

            {/* Premium Toggle (for lounge items) */}
            {formData.location === 'lounge' && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <StarIcon className="h-5 w-5 text-amber-600" />
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
                </div>
              </div>
            )}

            {/* Category and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Min Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="default_price"
                  value={formData.default_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Scan or type barcode"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link
                href={`/inventory/${productId}`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateProduct.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}