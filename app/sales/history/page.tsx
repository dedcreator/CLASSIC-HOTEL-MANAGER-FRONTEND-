// frontend/app/sales/history/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useSales } from '@/lib/api/hooks/useSales';
import Layout from '@/components/layout/Layout';

export default function SalesHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: sales, isLoading } = useSales();

  // Filter sales
  const filteredSales = sales?.filter(sale => {
    if (dateFilter) {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      if (saleDate !== dateFilter) return false;
    }
    if (searchTerm) {
      return (
        sale.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.total_amount.toString().includes(searchTerm)
      );
    }
    return true;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  // Calculate statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
  
  // Get payment method icon
  const getPaymentIcon = (method: string) => {
    switch(method) {
      case 'cash':
        return <BanknotesIcon className="h-5 w-5 text-[#C9A468]" />;
      case 'card':
        return <CreditCardIcon className="h-5 w-5 text-[#16302B]" />;
      default:
        return <UserIcon className="h-5 w-5 text-[#8A8377]" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString(undefined, { minimumFractionPoints: 0, maximumFractionDigits: 0 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link 
              href="/sales" 
              className="p-2 bg-white border border-[#DDD5C4] rounded-lg hover:bg-[#F7F1E4] transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-[#2A2622]" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Sales History</h1>
              <p className="font-body text-sm text-[#8A8377]">View all transactions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Total Transactions</p>
              <p className="font-display text-2xl font-medium text-[#2A2622]">{filteredSales.length}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Total Revenue</p>
              <p className="font-display text-2xl font-medium text-[#16302B]">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Average Order</p>
              <p className="font-display text-2xl font-medium text-[#C9A468]">{formatCurrency(averageOrderValue)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#DDD5C4] rounded-xl p-4 space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Search by transaction number, guest name, or amount..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-[#8A8377]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="font-body flex-1 px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
              />
              {dateFilter && (
                <button
                  onClick={() => {
                    setDateFilter('');
                    setCurrentPage(1);
                  }}
                  className="font-body text-sm font-medium text-[#C9A468] hover:text-[#B8924F] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sales List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-white border border-[#DDD5C4] rounded-xl p-8 text-center">
                <p className="font-body text-[#8A8377]">Loading transactions...</p>
              </div>
            ) : currentSales.length === 0 ? (
              <div className="bg-white border border-[#DDD5C4] rounded-xl p-12 text-center">
                <p className="font-body text-[#8A8377]">No sales found</p>
                {searchTerm || dateFilter ? (
                  <p className="font-body text-sm text-[#8A8377] mt-1">Try adjusting your filters</p>
                ) : (
                  <Link 
                    href="/sales" 
                    className="font-body inline-block mt-3 px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
                  >
                    Make your first sale
                  </Link>
                )}
              </div>
            ) : (
              <>
                {currentSales.map((sale) => (
                  <Link
                    key={sale.id}
                    href={`/sales/${sale.id}`}
                    className="block bg-white border border-[#DDD5C4] rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-[#F7F1E4] rounded-lg">
                            {getPaymentIcon(sale.payment_method)}
                          </div>
                          <div>
                            <p className="font-body font-medium text-[#2A2622]">
                              {sale.transaction_number}
                            </p>
                            <p className="font-body text-sm text-[#8A8377]">
                              {sale.guest_name || 'Walk-in Guest'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-[#8A8377]">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {formatDate(sale.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {sale.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-display text-xl font-medium text-[#16302B]">
                          {formatCurrency(sale.total_amount)}
                        </p>
                        <p className="font-body text-xs text-[#8A8377] capitalize">
                          {sale.payment_method}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white border border-[#DDD5C4] rounded-xl px-4 py-3">
                    <p className="font-body text-sm text-[#8A8377]">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-[#F7F1E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5 text-[#2A2622]" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`font-body w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#16302B] text-[#F7F1E4]'
                              : 'text-[#2A2622] hover:bg-[#F7F1E4]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg hover:bg-[#F7F1E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRightIcon className="h-5 w-5 text-[#2A2622]" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}