// frontend/app/sales/history/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useSales } from '@/lib/api/hooks/useSales';
import Layout from '@/components/layout/Layout';

export default function SalesHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { data: sales, isLoading } = useSales();

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

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/sales" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Sales History</h1>
            <p className="text-sm text-gray-600">View all transactions</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-red-600">₦{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-sm text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center py-8">Loading...</p>
          ) : filteredSales.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No sales found</p>
          ) : (
            filteredSales.map((sale) => (
              <Link
                key={sale.id}
                href={`/sales/${sale.id}`}
                className="block bg-white rounded-lg border p-4 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleString()}
                    </p>
                    <p className="font-medium mt-1">{sale.transaction_number}</p>
                  </div>
                  <span className="text-2xl">
                    {sale.payment_method === 'cash' ? '💵' : 
                     sale.payment_method === 'card' ? '💳' : '🏨'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {sale.guest_name || 'Walk-in'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.items?.length || 0} items
                    </p>
                  </div>
                  <p className="text-lg font-bold text-red-600">₦{sale.total_amount}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}