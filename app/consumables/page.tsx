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
  XMarkIcon,
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
  const isCEO = user?.role === 'CEO';
  const isManager = user?.role === 'MANAGER' || isCEO;

  const { data: expenses, isLoading, error, refetch } = useExpenses({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    start_date: dateFilter || undefined,
  });

  const { data: summary } = useExpenseSummary();
  const deleteExpense = useDeleteExpense();

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

  const totalExpenses = summary?.total_expenses || 0;
  const expenseCount = summary?.expense_count || 0;
  const categoriesCount = summary?.by_category?.length || 0;
  const thisMonthTotal = summary?.this_month_total || summary?.by_month?.slice(-1)[0]?.total || 0;
  const avgPerTransaction = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

  return (
    <Layout>
      <div className="space-y-6 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDD5C4] pb-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622] flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-[#C9A468]" />
              Consumables & Expenses
            </h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Track and manage all business expenses</p>
          </div>
          {isManager && (
            <button
              onClick={() => {
                setSelectedExpense(null);
                setShowExpenseModal(true);
              }}
              className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 w-fit"
            >
              <PlusIcon className="h-5 w-5" />
              Record Expense
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-sm text-[#8A8377]">Total Expenses</p>
            <p className="font-display text-2xl font-medium text-[#2A2622]">
              ₦{totalExpenses.toLocaleString()}
            </p>
            <p className="font-body text-xs text-[#8A8377] mt-1">
              {expenseCount} transactions
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-sm text-[#8A8377]">Categories</p>
            <p className="font-display text-2xl font-medium text-[#2A2622]">
              {categoriesCount}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-sm text-[#8A8377]">This Month</p>
            <p className="font-display text-2xl font-medium text-[#C9A468]">
              ₦{thisMonthTotal.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
            <p className="font-body text-sm text-[#8A8377]">Avg per Transaction</p>
            <p className="font-display text-2xl font-medium text-[#16302B]">
              ₦{avgPerTransaction.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-10 py-2 text-[#2A2622] placeholder:text-[#8A8377] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-[#F7F1E4] border-[#C9A468] text-[#16302B]' : 'border-[#DDD5C4] text-[#8A8377] hover:bg-[#F7F1E4]'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 border border-[#DDD5C4] rounded-lg text-[#8A8377] hover:bg-[#F7F1E4] transition-colors"
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
              <div key={i} className="bg-white rounded-lg border border-[#DDD5C4] p-4 animate-pulse">
                <div className="h-4 bg-[#F7F1E4] rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#FEF2F2] rounded-lg border border-[#FECACA] p-12 text-center">
            <p className="font-body text-[#991B1B]">Failed to load expenses. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="font-body mt-4 text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
            >
              Retry
            </button>
          </div>
        ) : expenses?.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-12 text-center">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-4" />
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-1">No expenses found</h3>
            <p className="font-body text-[#8A8377] mb-4">Start recording your business expenses</p>
            {isManager && (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="font-body inline-flex items-center gap-2 text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
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
                className="bg-white rounded-lg border border-[#DDD5C4] p-5 hover:border-[#C9A468] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#F7F1E4] rounded-full flex items-center justify-center flex-shrink-0">
                      <TagIcon className="h-5 w-5 text-[#16302B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-[#F7F1E4] px-2.5 py-1 rounded text-[#8A8377]">
                          {expense.expense_number}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#DBEAFE] text-[#1E40AF]">
                          {expense.category_name || 'Uncategorized'}
                        </span>
                      </div>
                      <h3 className="font-body font-semibold text-[#2A2622] mt-1">
                        {expense.description}
                      </h3>
                    </div>
                  </div>
                  <p className="font-display text-2xl font-medium text-[#16302B]">₦{expense.amount?.toLocaleString() || '0'}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-body">{formatDate(expense.expense_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span className="font-body capitalize">{expense.payment_method || 'cash'}</span>
                  </div>
                  {expense.receipt_number && (
                    <div className="flex items-center gap-2 text-[#8A8377]">
                      <span className="font-body">Receipt: {expense.receipt_number}</span>
                    </div>
                  )}
                </div>

                {/* Audit Trail */}
                <div className="border-t border-[#F7F1E4] pt-2 mt-2 text-xs text-[#8A8377] flex flex-wrap gap-3">
                  <span className="font-body">Created: {formatDateTime(expense.created_at)} by {expense.created_by_name || 'Unknown'}</span>
                  {expense.updated_at !== expense.created_at && (
                    <span className="font-body">• Updated: {formatDateTime(expense.updated_at)} by {expense.updated_by_name || 'Unknown'}</span>
                  )}
                </div>

                {/* Action Buttons */}
                {isManager && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#F7F1E4]">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="font-body px-3 py-1.5 bg-[#F7F1E4] text-[#16302B] rounded-lg hover:bg-[#DDD5C4] transition-colors text-sm flex items-center gap-1"
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
                        className="font-body px-3 py-1.5 bg-[#FEF2F2] text-[#EF4444] rounded-lg hover:bg-[#FECACA] transition-colors text-sm flex items-center gap-1"
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
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Expense</h3>
            <p className="font-body text-[#5B564B] mb-6">
              Are you sure you want to delete "{selectedExpense.description}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedExpense.id)}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2"
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