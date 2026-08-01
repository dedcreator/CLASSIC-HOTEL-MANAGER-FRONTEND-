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

  const canCreate = user?.role === 'CEO' || user?.role === 'MANAGER';

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

  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-8 text-center">
          <h2 className="font-display text-lg font-medium text-[#991B1B] mb-2">Access Denied</h2>
          <p className="font-body text-sm text-[#991B1B]">
            You don't have permission to create new products. Only CEOs and Managers can add products.
          </p>
          <Link
            href="/inventory"
            className="font-body inline-block mt-4 text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
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
      
      await createProduct.mutateAsync(productData);
      router.push('/inventory');
    } catch (error: any) {
      console.error('Failed to create product:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        
        if (typeof backendErrors === 'object') {
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 border-b border-[#DDD5C4] pb-6">
        <Link
          href="/inventory"
          className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="font-display text-2xl font-medium text-[#2A2622]">Add New Product</h1>
        <p className="font-body text-sm text-[#8A8377] mt-1">Create a new product in your inventory</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-[#DDD5C4] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`font-body w-full border-0 border-b ${errors.name ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
              placeholder="e.g., Guinness, Jameson, Coca-Cola"
            />
            {errors.name && (
              <p className="font-body mt-1 text-sm text-[#EF4444]">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Location *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          {/* Premium Toggle */}
          {formData.location === 'lounge' && (
            <div className="flex items-start gap-3 p-4 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4]">
              <StarIcon className="h-5 w-5 text-[#C9A468] mt-0.5" />
              <div className="flex-1">
                <label className="font-body text-sm font-medium text-[#2A2622] flex items-center gap-3">
                  Premium Item
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleChange}
                    className="h-4 w-4 rounded-sm border-[#DDD5C4] text-[#C9A468] focus:ring-[#C9A468]"
                  />
                </label>
                <p className="font-body text-xs text-[#8A8377] mt-1">
                  Premium items get a special badge and appear in premium collections
                </p>
              </div>
            </div>
          )}

          {/* Category and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
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
              <label htmlFor="default_price" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
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
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="min_stock_level" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
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
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                placeholder="10"
              />
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label htmlFor="barcode" className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Barcode (optional)
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
              placeholder="Scan or type barcode"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD5C4]">
            <Link
              href="/inventory"
              className="font-body inline-flex items-center px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="font-body inline-flex items-center px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}