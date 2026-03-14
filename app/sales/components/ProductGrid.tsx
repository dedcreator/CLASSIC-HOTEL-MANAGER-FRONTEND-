// frontend/app/pos/components/ProductGrid.tsx
'use client';

interface ProductGridProps {
  products: any[];
  isLoading: boolean;
  onAddToCart: (product: any) => void;
}

export default function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddToCart(product)}
          className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-red-300 hover:shadow-md transition-all text-left"
        >
          <p className="font-semibold text-gray-900 line-clamp-2">{product.name}</p>
          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
          <p className="text-lg font-bold text-red-600 mt-2">₦{product.default_price}</p>
          <p className="text-xs text-gray-500 mt-1">
            Stock: {product.total_stock} {product.unit}
          </p>
        </button>
      ))}
    </div>
  );
}