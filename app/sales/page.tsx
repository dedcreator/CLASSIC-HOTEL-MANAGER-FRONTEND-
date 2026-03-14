// frontend/app/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useProducts';
import { useCreateSale } from '@/lib/api/hooks/useSales';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';
import Cart from './components/Cart';
import ProductGrid from './components/ProductGrid';
import PaymentModal from './components/PaymentModal';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export default function POSPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products
  const { data: products, isLoading } = useProducts({});
  const createSale = useCreateSale();

  // Get unique categories
  const categories = ['all', ...new Set(products?.map((p: any) => p.category) || [])];

  // Filter products
  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.is_active && p.total_stock > 0;
  }) || [];

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = cartSubtotal * 0.075;
  const cartTotal = cartSubtotal + cartTax;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const handleAddToCart = (product: any) => {
    if (product.total_stock <= 0) {
      toast.error('Out of stock!');
      return;
    }

    const existing = cart.find(item => item.product_id === product.id);
    
    if (existing) {
      if (existing.quantity >= product.total_stock) {
        toast.error(`Only ${product.total_stock} available`);
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              subtotal: Number(((item.quantity + 1) * item.price).toFixed(2))
            }
          : item
      ));
    } else {
      const price = Number(product.default_price) || 0;
      const subtotal = Number((price * 1).toFixed(2));
      
      setCart([...cart, {
        id: Math.random().toString(36).substr(2, 9),
        product_id: product.id,
        name: product.name,
        price: price,
        quantity: 1,
        subtotal: subtotal,
        stock: product.total_stock
      }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  // Update cart quantity (FIXED VERSION - KEEP THIS ONE)
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item && newQuantity > item.stock) {
        toast.error(`Only ${item.stock} available`);
        return;
      }
      setCart(cart.map(item => 
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: Number((newQuantity * item.price).toFixed(2))
            }
          : item
      ));
    }
  };

  // Remove from cart
  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length > 0 && confirm('Clear all items?')) {
      setCart([]);
      setGuestName('');
    }
  };

  // Handle payment complete
  const handlePaymentComplete = async (paymentData: any) => {
    setIsSubmitting(true);

    try {
      const saleData = {
        guest_name: guestName || paymentData.guestName || 'Walk-in Guest',
        payment_method: paymentData.paymentMethod,
        amount_paid: paymentData.amountPaid,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: 0
        }))
      };

      await createSale.mutateAsync(saleData);
      
      toast.success('Sale completed successfully!');
      setCart([]);
      setGuestName('');
      setShowPaymentModal(false);
      setShowCart(false);
      
    } catch (error: any) {
      console.error('Sale failed:', error);
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Category Filters */}
          <div className="mt-3 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <Cart
          cart={cart}
          guestName={guestName}
          onGuestNameChange={setGuestName}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={() => {
            if (cart.length === 0) {
              toast.error('Cart is empty');
              return;
            }
            setShowPaymentModal(true);
            setShowCart(false);
          }}
          onClose={() => setShowCart(false)}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={cartTotal}
          guestName={guestName}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          isSubmitting={isSubmitting}
        />
      )}

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Layout>
  );
}