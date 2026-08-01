// frontend/app/sales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
  ClockIcon,
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

export default function SalesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleId, setSaleId] = useState<string | null>(null);

  const { data: products, isLoading, refetch } = useProducts({});
  const createSale = useCreateSale();

  const categories = products 
    ? ['all', ...new Set(products.map((p: any) => p.category))]
    : ['all'];

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.is_active !== false && (p.total_stock || 0) > 0;
  }) || [];

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = cartSubtotal * 0.075;
  const cartTotal = cartSubtotal + cartTax;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        product_id: product.id,
        name: product.name,
        price: price,
        quantity: 1,
        subtotal: price,
        stock: currentStock
      }]);
      toast.success(`Added ${product.name} to cart`);
    }
  };

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

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      toast.success('Cart cleared');
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.price.toFixed(2)),
        discount: 0
      }));

      const saleData = {
        guest_name: guestName?.trim() || 'Walk-in Guest',
        payment_method: paymentData.channel === 'bank_transfer' ? 'bank_transfer' : 'korapay',
        amount_paid: cartTotal,
        items: items,
        customer_email: guestEmail || '',
        customer_phone: guestPhone || '',
        payment_reference: paymentData.transactionReference,
        payment_channel: paymentData.channel,
      };

      const result = await createSale.mutateAsync(saleData);
      
      setCart([]);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setShowPaymentModal(false);
      setShowCart(false);
      setSearchTerm('');
      setSelectedCategory('all');
      setSaleId(null);
      
      refetch();
      toast.success(`Sale completed successfully via ${paymentData.channel === 'bank_transfer' ? 'Bank Transfer' : 'Card'}`);
      router.push('/sales/history');
      
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
      <div className="h-screen flex flex-col bg-[#FAF6EF]">
        {/* Header */}
        <div className="bg-white border-b border-[#DDD5C4] px-4 py-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-xl font-medium text-[#2A2622]">Point of Sale</h1>
              <button
                onClick={() => router.push('/sales/history')}
                className="font-body inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
              >
                <ClockIcon className="h-4 w-4" />
                History
              </button>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A468] text-[#F7F1E4] text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-medium">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Guest Information - Required for cashless */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <UserIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Guest name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                required
              />
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email * (for receipt)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                required
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone number *"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                required
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
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
                  className={`font-body px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#16302B] text-[#F7F1E4]'
                      : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
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
            if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
              toast.error('Please fill in all guest information');
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
          guestEmail={guestEmail}
          guestPhone={guestPhone}
          paymentType="sale"
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          isSubmitting={isSubmitting}
        />
      )}
    </Layout>
  );
}