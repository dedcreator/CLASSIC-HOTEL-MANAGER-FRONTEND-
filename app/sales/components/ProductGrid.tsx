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
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-[#DDD5C4] p-4 animate-pulse">
            <div className="h-4 bg-[#F7F1E4] rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[#F7F1E4] rounded w-1/2 mb-3"></div>
            <div className="h-5 bg-[#F7F1E4] rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-[#F7F1E4] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔍</div>
        <p className="font-body text-[#8A8377]">No products found</p>
        <p className="font-body text-sm text-[#8A8377] mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onAddToCart(product)}
          className="group bg-white rounded-lg border-2 border-[#DDD5C4] p-4 hover:border-[#C9A468] hover:shadow-md transition-all cursor-pointer hover:bg-[#F7F1E4]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-[#2A2622] line-clamp-2 group-hover:text-[#16302B] transition-colors">
                {product.name}
              </p>
              <p className="font-body text-xs text-[#8A8377] mt-0.5 capitalize">{product.category}</p>
            </div>
            {product.is_premium && (
              <span className="flex-shrink-0 ml-1 text-[10px] font-medium text-[#C9A468] bg-[#F7F1E4] px-1.5 py-0.5 rounded border border-[#C9A468]">
                ★
              </span>
            )}
          </div>
          
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="font-display text-lg font-medium text-[#16302B]">
                ₦{product.default_price}
              </p>
              <p className={`font-body text-xs ${product.total_stock <= product.min_stock_level ? 'text-[#EF4444]' : 'text-[#8A8377]'}`}>
                Stock: {product.total_stock} {product.unit}
              </p>
            </div>
            <span className="font-body text-xs font-medium text-[#F7F1E4] bg-[#16302B] px-3 py-1 rounded-lg group-hover:bg-[#1D3B34] transition-colors opacity-0 group-hover:opacity-100">
              Add
            </span>
          </div>
          
          {/* Low stock indicator */}
          {product.total_stock <= product.min_stock_level && product.total_stock > 0 && (
            <div className="mt-1">
              <span className="font-body text-[10px] text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.5 rounded">
                Low stock
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}