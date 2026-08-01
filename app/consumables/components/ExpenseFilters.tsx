// frontend/app/consumables/components/ExpenseFilters.tsx
'use client';

import { useExpenseCategories } from '@/lib/api/hooks/useExpenses';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

  const hasActiveFilters = categoryFilter !== 'all' || dateFilter !== '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377] mb-1.5">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
          >
            <option value="all">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377] mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end justify-end">
          <button
            onClick={onClearFilters}
            className={`font-body inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              hasActiveFilters 
                ? 'text-[#16302B] hover:text-[#1D3B34]' 
                : 'text-[#8A8377] cursor-not-allowed opacity-50'
            }`}
            disabled={!hasActiveFilters}
          >
            <XMarkIcon className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F7F1E4]">
          <span className="font-body text-xs text-[#8A8377]">Active filters:</span>
          {categoryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
              Category: {categories?.find(c => c.id === categoryFilter)?.name || categoryFilter}
              <button
                onClick={() => onCategoryChange('all')}
                className="hover:text-[#EF4444] transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {dateFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
              Date: {new Date(dateFilter).toLocaleDateString()}
              <button
                onClick={() => onDateChange('')}
                className="hover:text-[#EF4444] transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}