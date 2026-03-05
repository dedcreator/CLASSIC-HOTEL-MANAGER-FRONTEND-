// frontend/app/inventory/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { useProduct, useUpdateProduct } from '@/lib/api/hooks/useProducts';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    default_price: '',
    unit: 'unit',
    barcode: '',
    min_stock_level: '10',
    location: 'bar',
    is_premium: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'other',
        default_price: product.default_price?.toString() || '',
        unit: product.unit || 'unit',
        barcode: product.barcode || '',
        min_stock_level: product.min_stock_level?.toString() || '10',
        location: (product as any).location || 'bar',
        is_premium: (product as any).is_premium || false,
      });
    }
  }, [product]);

  const categories = [
    { value: 'beer', label: 'Beer' },
    { value: 'spirit', label: 'Spirit' },
    { value: 'soft_drink', label: 'Soft Drink' },
    { value: 'juice', label: 'Juice' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'wine', label: 'Wine' },
    { value: 'champagne', label: 'Champagne' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'snack', label: 'Snack' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'premium_spirit', label: 'Premium Spirit' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' },
  ];

  const units = [
    { value: 'bottle', label: 'Bottle' },
    { value: 'pint', label: 'Pint' },
    { value: 'glass', label: 'Glass' },
    { value: 'can', label: 'Can' },
    { value: 'shot', label: 'Shot' },
    { value: 'cup', label: 'Cup' },
    { value: 'plate', label: 'Plate' },
    { value: 'piece', label: 'Piece' },
    { value: 'unit', label: 'Unit' },
  ];

  const locations = [
    { value: 'bar', label: 'Bar' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'both', label: 'Both' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.default_price || parseFloat(formData.default_price) <= 0) {
      newErrors.default_price = 'Valid price is required';
    }
    if (!formData.min_stock_level || parseInt(formData.min_stock_level) < 0) {
      newErrors.min_stock_level = 'Valid minimum stock level is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare the data to send
      const updateData = {
        id: productId,
        name: formData.name,
        category: formData.category,
        default_price: parseFloat(formData.default_price),
        unit: formData.unit,
        barcode: formData.barcode || null, // Send null instead of empty string
        min_stock_level: parseInt(formData.min_stock_level),
        location: formData.location,
        is_premium: formData.is_premium,
      };

      console.log('Sending update data:', updateData); // For debugging
      
      await updateProduct.mutateAsync(updateData);
      router.push(`/inventory/${productId}`);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      // Handle API validation errors
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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
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

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <Link
          href={`/inventory/${productId}`}
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Product
        </Link>
        <h1 className="text-2xl font-bold text-dark-500">Edit Product</h1>
        <p className="text-sm text-gray-600">Update product information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Location Selection */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="input-field"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          {/* Premium Toggle */}
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
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

          {/* Price and Min Stock */}
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
                step="0.01"
                className={`input-field ${errors.default_price ? 'border-red-500' : ''}`}
              />
              {errors.default_price && <p className="text-xs text-red-600 mt-1">{errors.default_price}</p>}
            </div>

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
                min="0"
                className={`input-field ${errors.min_stock_level ? 'border-red-500' : ''}`}
              />
              {errors.min_stock_level && <p className="text-xs text-red-600 mt-1">{errors.min_stock_level}</p>}
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="input-field"
              placeholder="Scan or type barcode"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href={`/inventory/${productId}`}
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateProduct.isPending}
              className="btn-primary"
            >
              {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}