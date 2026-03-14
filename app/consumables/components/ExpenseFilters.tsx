// frontend/app/consumables/components/ExpenseFilters.tsx
'use client';

import { useExpenseCategories } from '@/lib/api/hooks/useExpenses';

interface ExpenseFiltersProps {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ExpenseFilters({
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  onClearFilters,
}: ExpenseFiltersProps) {
  const { data: categories } = useExpenseCategories();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}