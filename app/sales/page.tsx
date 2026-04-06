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
  const { data: products, isLoading, refetch } = useProducts({});
  const createSale = useCreateSale();

  // Get unique categories (handle case when products is undefined)
  const categories = products 
    ? ['all', ...new Set(products.map((p: any) => p.category))]
    : ['all'];

  // Filter products - only show active products with stock
  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.is_active !== false && (p.total_stock || 0) > 0;
  }) || [];

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = cartSubtotal * 0.075;
  const cartTotal = cartSubtotal + cartTax;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
const handleAddToCart = (product: any) => {
  const currentStock = product.total_stock || 0;
  
  if (currentStock <= 0) {
    toast.error(`${product.name} is out of stock!`);
    return;
  }

  const existingItem = cart.find(item => item.product_id === product.id);
  
  if (existingItem) {
    if (existingItem.quantity >= currentStock) {
      toast.error(`Only ${currentStock} ${product.unit}(s) available`);
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
    toast.success(`Added another ${product.name} to cart`);
  } else {
    const price = Number(product.default_price) || 0;
    
    setCart([...cart, {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      product_id: product.id,  // Make sure this is set correctly
      name: product.name,
      price: price,
      quantity: 1,
      subtotal: price,
      stock: currentStock
    }]);
    toast.success(`Added ${product.name} to cart`);
  }
};

  // Update cart quantity
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item && newQuantity > item.stock) {
        toast.error(`Only ${item.stock} ${item.name}(s) available`);
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
    toast.success('Item removed from cart');
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
      setGuestName('');
      toast.success('Cart cleared');
    }
  };

  // Handle payment complete

const handlePaymentComplete = async (paymentData: any) => {
  if (cart.length === 0) {
    toast.error('Cart is empty');
    return;
  }

  setIsSubmitting(true);

  try {
    // Format items with 2 decimal places
    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Number(item.price.toFixed(2)),
      discount: 0
    }));

    const amountPaid = paymentData.paymentMethod === 'cash' 
      ? Number(parseFloat(paymentData.amountPaid).toFixed(2))
      : Number(cartTotal.toFixed(2));

    const saleData = {
      guest_name: guestName?.trim() || 'Walk-in Guest',
      payment_method: paymentData.paymentMethod,
      amount_paid: amountPaid,
      items: items,
    };

    console.log('Sending sale data:', JSON.stringify(saleData, null, 2));
    
    const result = await createSale.mutateAsync(saleData);
  
    
    // Reset everything
    setCart([]);
    setGuestName('');
    setShowPaymentModal(false);
    setShowCart(false);
    setSearchTerm('');
    setSelectedCategory('all');
    
    refetch();
    
  } catch (error: any) {
    console.error('Sale failed:', error);
    
    let errorMessage = 'Failed to complete sale';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
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

          {/* Guest Name Input */}
          <div className="mt-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Guest name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
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
          <div className="mt-3 overflow-x-auto whitespace-nowrap pb-2">
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
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
    </Layout>
  );
}