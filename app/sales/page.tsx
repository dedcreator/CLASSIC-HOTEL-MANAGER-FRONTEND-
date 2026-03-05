// frontend/app/sales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  BookmarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useProducts';
import { useCreateSale } from '@/lib/api/hooks/useSales';
import { useCustomers, useCreateCustomer, useSearchCustomers, useSavedCarts, useCreateSavedCart } from '@/lib/api/hooks/useSales';
import Layout from '@/components/layout/Layout';
import CartSidebar from './components/CartSidebar';
import CustomerSearch from './components/CustomerSearch';
import SavedCartsList from './components/SavedCartsList';
import PaymentModal from './components/PaymentModal';

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showSavedCarts, setShowSavedCarts] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const { data: products } = useProducts({});
  const createSale = useCreateSale();
  const createCustomer = useCreateCustomer();
  const createSavedCart = useCreateSavedCart();

  const categories = ['all', ...new Set(products?.map((p: any) => p.category) || [])];

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.is_active;
  }) || [];

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = cartSubtotal * 0.075;
  const cartTotal = cartSubtotal + cartTax;

  const handleAddToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.unit_price
            }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        unit_price: product.default_price,
        discount: 0,
        subtotal: product.default_price
      }]);
    }
    setSearchTerm('');
  };

  const handleSaveCart = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!selectedCustomer) {
      setShowCustomerSearch(true);
      return;
    }

    await createSavedCart.mutateAsync({
      customer_id: selectedCustomer.id,
      cart_items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount
      }))
    });

    setCart([]);
    setSelectedCustomer(null);
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Point of Sale</h1>
            <div className="flex items-center gap-2">
              {/* Customer Info */}
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <UserIcon className="h-5 w-5" />
                {selectedCustomer ? (
                  <span>{selectedCustomer.first_name}</span>
                ) : (
                  <span>Select Customer</span>
                )}
              </button>

              {/* Saved Carts */}
              <button
                onClick={() => setShowSavedCarts(true)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Saved Carts"
              >
                <BookmarkIcon className="h-5 w-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 bg-red-600 text-white rounded-lg"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          {/* Categories */}
          <div className="mt-3 overflow-x-auto whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product: any) => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                disabled={product.total_stock <= 0}
                className={`bg-white rounded-lg p-4 border-2 text-left ${
                  product.total_stock <= 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-red-300'
                }`}
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                <p className="text-lg font-bold text-red-600 mt-2">₦{product.default_price}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Stock: {product.total_stock} {product.unit}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <CustomerSearch
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerSearch(false);
          }}
          onClose={() => setShowCustomerSearch(false)}
        />
      )}

      {/* Saved Carts Modal */}
      {showSavedCarts && (
        <SavedCartsList
          customerId={selectedCustomer?.id}
          onLoadCart={(cartData) => {
            setCart(cartData);
            setShowSavedCarts(false);
          }}
          onClose={() => setShowSavedCarts(false)}
        />
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          customer={selectedCustomer}
          onUpdateCart={setCart}
          onCheckout={() => {
            setShowPayment(true);
            setShowCart(false);
          }}
          onSaveCart={handleSaveCart}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          customer={selectedCustomer}
          total={cartTotal}
          onClose={() => setShowPayment(false)}
          onComplete={async (paymentData) => {
            await createSale.mutateAsync({
              customer_id: selectedCustomer?.id,
              guest_name: selectedCustomer ? 
                `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : 
                paymentData.guestName,
              payment_method: paymentData.method,
              amount_paid: paymentData.amountPaid,
              items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount
              }))
            });
            setCart([]);
            setSelectedCustomer(null);
            setShowPayment(false);
          }}
        />
      )}
    </Layout>
  );
}