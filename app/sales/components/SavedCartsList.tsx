// frontend/app/sales/components/SavedCartsList.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useSavedCarts } from '@/lib/api/hooks/useSales';

interface SavedCartsListProps {
  customerId?: string;
  onLoadCart: (cartData: any[]) => void;
  onClose: () => void;
}

export default function SavedCartsList({ customerId, onLoadCart, onClose }: SavedCartsListProps) {
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const { data: savedCarts, isLoading } = useSavedCarts(customerId);

  const handleLoadCart = (cart: any) => {
    // Transform saved cart data back to cart items format
    const cartItems = cart.cart_data.map((item: any) => ({
      product: {
        id: item.product_id,
        name: item.product_name || 'Product',
        default_price: item.unit_price,
        total_stock: 999, // You might want to fetch current stock
        unit: 'unit',
      },
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0,
      subtotal: item.quantity * item.unit_price - (item.discount || 0)
    }));
    
    onLoadCart(cartItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Saved Carts
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading saved carts...</p>
            </div>
          ) : savedCarts && savedCarts.length > 0 ? (
            <div className="space-y-3">
              {savedCarts.map((cart) => (
                <div
                  key={cart.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCart === cart.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCart(cart.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Cart from {new Date(cart.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cart.cart_data?.length || 0} items • ₦{cart.total.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(cart.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {cart.notes && (
                    <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                      {cart.notes}
                    </p>
                  )}

                  {selectedCart === cart.id && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <h4 className="text-sm font-medium mb-2">Items:</h4>
                      <div className="space-y-1">
                        {cart.cart_data?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.product_name || 'Product'} x{item.quantity}</span>
                            <span>₦{item.quantity * item.unit_price}</span>
                          </div>
                        ))}
                        {(cart.cart_data?.length || 0) > 3 && (
                          <p className="text-xs text-gray-500">
                            +{(cart.cart_data?.length || 0) - 3} more items
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleLoadCart(cart)}
                        className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        Load Cart
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No saved carts found</p>
              <p className="text-sm text-gray-500 mt-1">
                {customerId ? 'This customer has no saved carts' : 'Select a customer to view their saved carts'}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}