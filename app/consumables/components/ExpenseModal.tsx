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
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#16302B] text-[#F7F1E4] p-5 flex justify-between items-center rounded-t-lg border-b border-[#DDD5C4]">
          <div>
            <h2 className="font-display text-xl font-medium">
              {expense ? 'Edit Expense' : 'Record New Expense'}
            </h2>
            <p className="font-body text-sm text-[#B9C4B9] mt-0.5">
              {expense ? 'Update expense details' : 'Track a new business expense'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#1D3B34] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Category <span className="text-[#EF4444]">*</span>
            </label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="font-body flex-1 border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
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
                  className="font-body inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors whitespace-nowrap"
                >
                  <PlusIcon className="h-4 w-4" />
                  New
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Description <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Office supplies, Electricity bill, etc."
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
              required
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Amount (₦) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                required
              />
            </div>
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Expense Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
                required
              />
            </div>
          </div>

          {/* Payment Method and Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="pos">POS</option>
              </select>
            </div>
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="Optional"
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional details..."
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377] resize-none"
            />
          </div>

          {/* Recurring Expense */}
          <div className="border-t border-[#DDD5C4] pt-4">
            <label className="font-body flex items-center gap-2 text-sm font-medium text-[#5B564B]">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="h-4 w-4 rounded-sm border-[#DDD5C4] text-[#C9A468] focus:ring-[#C9A468]"
              />
              This is a recurring expense
            </label>

            {formData.is_recurring && (
              <div className="mt-3">
                <select
                  value={formData.recurring_frequency}
                  onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
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
          <div className="flex gap-3 pt-4 border-t border-[#DDD5C4]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending || updateExpense.isPending}
              className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createExpense.isPending || updateExpense.isPending ? 'Saving...' : (expense ? 'Update Expense' : 'Save Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}