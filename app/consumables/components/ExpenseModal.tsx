// frontend/app/consumables/components/ExpenseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useExpenseCategories, useCreateExpenseCategory, useCreateExpense, useUpdateExpense } from '@/lib/api/hooks/useExpenses';
import toast from 'react-hot-toast';

interface ExpenseModalProps {
  expense?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    payment_method: 'cash',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    notes: '',
    is_recurring: false,
    recurring_frequency: '',
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const { data: categories } = useExpenseCategories();
  const createCategory = useCreateExpenseCategory();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        payment_method: expense.payment_method || 'cash',
        expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
        receipt_number: expense.receipt_number || '',
        notes: expense.notes || '',
        is_recurring: expense.is_recurring || false,
        recurring_frequency: expense.recurring_frequency || '',
      });
    }
  }, [expense]);

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error('Category name is required');
      return;
    }

    try {
      const category = await createCategory.mutateAsync(newCategory);
      setFormData({ ...formData, category: category.id });
      setShowNewCategory(false);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.description) {
      toast.error('Please enter a description');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (expense) {
        await updateExpense.mutateAsync({
          id: expense.id,
          ...formData,
          amount: parseFloat(formData.amount),
        });
        toast.success('Expense updated successfully');
      } else {
        await createExpense.mutateAsync({
          ...formData,
          amount: parseFloat(formData.amount),
        });
        toast.success('Expense recorded successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-500 text-white p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-semibold">
            {expense ? 'Edit Expense' : 'Record New Expense'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                >
                  <PlusIcon className="h-5 w-5" />
                  New
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Office supplies, Electricity bill, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Payment Method and Receipt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="pos">POS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Recurring Expense */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">This is a recurring expense</span>
            </label>

            {formData.is_recurring && (
              <div className="mt-3">
                <select
                  value={formData.recurring_frequency}
                  onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending || updateExpense.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {createExpense.isPending || updateExpense.isPending ? 'Saving...' : (expense ? 'Update Expense' : 'Save Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}