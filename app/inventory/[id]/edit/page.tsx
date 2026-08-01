// frontend/app/inventory/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { useProduct, useUpdateProduct } from '@/lib/api/hooks/useProducts';
import Layout from '@/components/layout/Layout';

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
            <div className="h-8 bg-[#F7F1E4] rounded w-1/4"></div>
            <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 space-y-4">
              <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              <div className="h-4 bg-[#F7F1E4] rounded w-1/3"></div>
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
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-2">Product Not Found</h2>
          <p className="font-body text-[#8A8377] mb-6">The product you're trying to edit doesn't exist.</p>
          <Link href="/inventory" className="font-body inline-flex items-center gap-2 px-6 py-3 text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2">
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
        {/* Header */}
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <Link
            href={`/inventory/${productId}`}
            className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Product
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16302B]">
              <span className="font-display text-lg font-semibold text-[#C9A468]">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Edit Product</h1>
              <p className="font-body text-sm text-[#8A8377]">{product.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Product Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`font-body w-full border-0 border-b ${errors.name ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
              />
              {errors.name && (
                <p className="font-body mt-1 text-sm text-[#EF4444]">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Location <span className="text-[#EF4444]">*</span>
              </label>
              <select
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
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Category <span className="text-[#EF4444]">*</span>
                </label>
                <select
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
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Unit <span className="text-[#EF4444]">*</span>
                </label>
                <select
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
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Price (₦) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  name="default_price"
                  value={formData.default_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`font-body w-full border-0 border-b ${errors.default_price ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                  placeholder="0.00"
                />
                {errors.default_price && (
                  <p className="font-body mt-1 text-sm text-[#EF4444]">{errors.default_price}</p>
                )}
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Minimum Stock Level <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  required
                  min="0"
                  className={`font-body w-full border-0 border-b ${errors.min_stock_level ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                  placeholder="10"
                />
                {errors.min_stock_level && (
                  <p className="font-body mt-1 text-sm text-[#EF4444]">{errors.min_stock_level}</p>
                )}
              </div>
            </div>

            {/* Barcode */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className={`font-body w-full border-0 border-b ${errors.barcode ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                placeholder="Scan or type barcode"
              />
              {errors.barcode && (
                <p className="font-body mt-1 text-sm text-[#EF4444]">{errors.barcode}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD5C4]">
              <Link
                href={`/inventory/${productId}`}
                className="font-body px-6 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateProduct.isPending}
                className="font-body px-6 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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