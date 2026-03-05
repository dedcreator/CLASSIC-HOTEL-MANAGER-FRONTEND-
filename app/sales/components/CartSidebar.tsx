// frontend/app/sales/components/CartSidebar.tsx
'use client';

import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon, BookmarkIcon } from '@heroicons/react/24/outline';

interface CartSidebarProps {
  cart: any[];
  customer: any;
  onUpdateCart: (cart: any[]) => void;
  onCheckout: () => void;
  onSaveCart: () => void;
  onClose: () => void;
}

export default function CartSidebar({
  cart,
  customer,
  onUpdateCart,
  onCheckout,
  onSaveCart,
  onClose
}: CartSidebarProps) {
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = cartSubtotal * 0.075;
  const cartTotal = cartSubtotal + cartTax;

  const handleUpdateQuantity = (item: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      onUpdateCart(cart.filter(i => i.product.id !== item.product.id));
    } else if (newQuantity > item.product.total_stock) {
      alert(`Only ${item.product.total_stock} available`);
    } else {
      onUpdateCart(cart.map(i =>
        i.product.id === item.product.id
          ? {
              ...i,
              quantity: newQuantity,
              subtotal: newQuantity * i.unit_price - i.discount
            }
          : i
      ));
    }
  };

  const handleRemoveItem = (productId: string) => {
    onUpdateCart(cart.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && confirm('Clear cart?')) {
      onUpdateCart([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Current Order
              {customer && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {customer.first_name} {customer.last_name}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">{cart.length} items</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Cart is empty</p>
              <p className="text-sm mt-2">Add products to get started</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      ₦{item.unit_price} each • Stock: {item.product.total_stock}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold text-red-600">₦{item.subtotal.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₦{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (7.5%):</span>
                <span className="font-medium">₦{cartTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-dark-500">Total:</span>
                <span className="text-red-600">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClearCart}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={onSaveCart}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <BookmarkIcon className="h-4 w-4" />
                Save Cart
              </button>
            </div>

            <button
              onClick={onCheckout}
              className="w-full mt-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}