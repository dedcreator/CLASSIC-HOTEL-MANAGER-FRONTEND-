// frontend/app/inventory/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { useCreateProduct } from '@/lib/api/hooks/useProducts';
import { useAuth } from '@/lib/api/hooks/useAuth';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { user } = useAuth();

  // Check if user has permission to create products
  const canCreate = user?.role === 'ceo' || user?.role === 'manager';

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

  const categories = [
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'spirit', label: 'Spirit' },
    { value: 'soft_drink', label: 'Soft Drink' },
    { value: 'juice', label: 'Juice' },
    { value: 'cocktail', label: 'Cocktail' },
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

  // If user doesn't have permission, show access denied
  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-sm text-red-600">
            You don't have permission to create new products. Only CEOs and Managers can add products.
          </p>
          <Link
            href="/inventory"
            className="inline-block mt-4 text-red-600 hover:text-red-700 font-medium"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate required fields
    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.default_price || parseFloat(formData.default_price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        default_price: parseFloat(formData.default_price),
        unit: formData.unit,
        barcode: formData.barcode || null,
        min_stock_level: parseInt(formData.min_stock_level),
        location: formData.location,
        is_premium: formData.is_premium,
      };
      
      console.log('Sending product data:', productData);
      
      await createProduct.mutateAsync(productData);
      toast.success('Product created successfully!');
      router.push('/inventory');
    } catch (error: any) {
      console.error('Failed to create product:', error);
      
      // Handle validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        
        if (typeof backendErrors === 'object') {
          // Format validation errors
          const errorMessages: string[] = [];
          Object.keys(backendErrors).forEach(key => {
            const messages = backendErrors[key];
            if (Array.isArray(messages)) {
              errorMessages.push(`${key}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${messages}`);
            }
          });
          toast.error(errorMessages.join('\n') || 'Failed to create product');
          setErrors(backendErrors);
        } else {
          toast.error(backendErrors.message || 'Failed to create product');
        }
      } else {
        toast.error('Failed to create product. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <Link
          href="/inventory"
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-dark-500">Add New Product</h1>
        <p className="text-sm text-gray-600">Create a new product in your inventory</p>
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
              placeholder="e.g., Guinness, Jameson, Coca-Cola"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
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
                <p className="text-xs text-gray-500 mt-1">
                  Premium items get a special badge and appear in premium collections
                </p>
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
                className="input-field"
                placeholder="0.00"
              />
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
                className="input-field"
                placeholder="10"
              />
            </div>
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
              placeholder="Scan or type barcode"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/inventory"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="btn-primary"
            >
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}