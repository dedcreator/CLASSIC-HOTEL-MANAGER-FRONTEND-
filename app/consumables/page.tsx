// frontend/app/consumables/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useExpenses, useExpenseSummary, useDeleteExpense } from '@/lib/api/hooks/useExpenses';
import { useAuth } from '@/lib/api/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import ExpenseModal from './components/ExpenseModal';
import ExpenseFilters from './components/ExpenseFilters';
import toast from 'react-hot-toast';

export default function ConsumablesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user } = useAuth();
  // Use uppercase to match backend
  const isCEO = user?.role === 'CEO';
  const isManager = user?.role === 'MANAGER' || isCEO;

  const { data: expenses, isLoading, error, refetch } = useExpenses({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    start_date: dateFilter || undefined,
  });

  const { data: summary } = useExpenseSummary();
  const deleteExpense = useDeleteExpense();

  // Handle error
  if (error) {
    console.error('Expenses fetch error:', error);
  }

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Safe summary values
  const totalExpenses = summary?.total_expenses || 0;
  const expenseCount = summary?.expense_count || 0;
  const categoriesCount = summary?.by_category?.length || 0;
  const thisMonthTotal = summary?.this_month_total || summary?.by_month?.slice(-1)[0]?.total || 0;
  const avgPerTransaction = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

  return (
    <Layout>
      <div className="space-y-6 pb-20 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CurrencyDollarIcon className="h-6 w-6" />
                Consumables & Expenses
              </h1>
              <p className="text-red-100 mt-1">Track and manage all business expenses</p>
            </div>
            {isManager && (
              <button
                onClick={() => {
                  setSelectedExpense(null);
                  setShowExpenseModal(true);
                }}
                className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 w-fit"
              >
                <PlusIcon className="h-5 w-5" />
                Record Expense
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">
              ₦{totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {expenseCount} transactions
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-gray-900">
              {categoriesCount}
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{thisMonthTotal.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Avg per Transaction</p>
            <p className="text-2xl font-bold text-blue-600">
              ₦{avgPerTransaction.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-red-50 border-red-300 text-red-600' : 'hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <ExpenseFilters
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              onClearFilters={() => {
                setCategoryFilter('all');
                setDateFilter('');
              }}
            />
          )}
        </div>

        {/* Expenses List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl border border-red-200 p-12 text-center">
            <p className="text-red-600">Failed to load expenses. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        ) : expenses?.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No expenses found</h3>
            <p className="text-gray-500 mb-4">Start recording your business expenses</p>
            {isManager && (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Record your first expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {expenses?.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TagIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {expense.expense_number}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {expense.category_name || 'Uncategorized'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1">
                        {expense.description}
                      </h3>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600">₦{expense.amount?.toLocaleString() || '0'}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(expense.expense_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span className="capitalize">{expense.payment_method || 'cash'}</span>
                  </div>
                  {expense.receipt_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>Receipt: {expense.receipt_number}</span>
                    </div>
                  )}
                </div>

                {/* Audit Trail */}
                <div className="border-t border-gray-100 pt-2 mt-2 text-xs text-gray-400 flex flex-wrap gap-3">
                  <span>Created: {formatDateTime(expense.created_at)} by {expense.created_by_name || 'Unknown'}</span>
                  {expense.updated_at !== expense.created_at && (
                    <span>• Updated: {formatDateTime(expense.updated_at)} by {expense.updated_by_name || 'Unknown'}</span>
                  )}
                </div>

                {/* Action Buttons */}
                {isManager && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    {isCEO && (
                      <button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowDeleteConfirm(true);
                        }}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
          }}
          onSuccess={() => {
            refetch();
            setShowExpenseModal(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedExpense.description}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedExpense.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}