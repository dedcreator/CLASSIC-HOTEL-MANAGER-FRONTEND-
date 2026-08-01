// frontend/app/pos/components/Cart.tsx
'use client';

import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon, UserIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface CartProps {
  cart: any[];
  guestName: string;
  onGuestNameChange: (name: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export default function Cart({
  cart,
  guestName,
  onGuestNameChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onClose,
  subtotal,
  tax,
  total
}: CartProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#DDD5C4] bg-[#F7F1E4]">
          <div>
            <h2 className="font-display text-lg font-medium text-[#2A2622]">Current Order</h2>
            <p className="font-body text-sm text-[#8A8377]">{cart.length} items</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#8A8377] hover:text-[#2A2622] hover:bg-white/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Guest Name */}
        <div className="p-4 border-b border-[#DDD5C4] bg-[#FAF6EF]">
          <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
            <UserIcon className="h-4 w-4 inline mr-1.5 text-[#8A8377]" />
            Guest Name (optional)
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            placeholder="e.g., John Doe"
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6EF]">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-3" />
              <p className="font-body text-[#8A8377]">Cart is empty</p>
              <p className="font-body text-sm text-[#8A8377] mt-1">Add items from the product grid</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-body font-medium text-[#2A2622]">{item.name}</p>
                    <p className="font-body text-xs text-[#8A8377]">₦{formatPrice(item.price)} each</p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#8A8377] hover:text-[#EF4444] p-1 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-[#DDD5C4] hover:border-[#C9A468] hover:bg-[#F7F1E4] flex items-center justify-center transition-colors"
                    >
                      <MinusIcon className="h-4 w-4 text-[#8A8377]" />
                    </button>
                    <span className="font-body w-8 text-center font-medium text-[#2A2622]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-[#DDD5C4] hover:border-[#C9A468] hover:bg-[#F7F1E4] flex items-center justify-center transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 text-[#8A8377]" />
                    </button>
                  </div>
                  <p className="font-display font-medium text-[#16302B]">₦{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t border-[#DDD5C4] p-4 bg-white shadow-lg">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-body text-[#8A8377]">Subtotal:</span>
                <span className="font-body font-medium text-[#2A2622]">₦{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-body text-[#8A8377]">VAT (7.5%):</span>
                <span className="font-body font-medium text-[#2A2622]">₦{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-medium pt-2 border-t border-[#DDD5C4]">
                <span className="text-[#2A2622]">Total:</span>
                <span className="text-[#16302B]">₦{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClearCart}
                className="font-body px-4 py-2.5 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                Clear Cart
              </button>
              <button
                onClick={onCheckout}
                className="font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}