// frontend/app/staff/components/StaffFilters.tsx
'use client';

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface StaffFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function StaffFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: StaffFiltersProps) {
  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'bar_staff', label: 'Bar Staff' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'ceo', label: 'CEO' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
        <input
          type="text"
          placeholder="Search by name, email, or username..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#F7F1E4]">
        <div className="flex-1">
          <label className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377] mb-1">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="font-body block text-xs font-medium uppercase tracking-wide text-[#8A8377] mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters indicator */}
      {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F7F1E4]">
          <span className="font-body text-xs text-[#8A8377]">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
              Search: {searchTerm}
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-[#EF4444] transition-colors"
              >
                ×
              </button>
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
              Role: {roles.find(r => r.value === roleFilter)?.label}
              <button
                onClick={() => onRoleChange('all')}
                className="hover:text-[#EF4444] transition-colors"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
              Status: {statuses.find(s => s.value === statusFilter)?.label}
              <button
                onClick={() => onStatusChange('all')}
                className="hover:text-[#EF4444] transition-colors"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange('');
              onRoleChange('all');
              onStatusChange('all');
            }}
            className="font-body text-xs text-[#8A8377] hover:text-[#16302B] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}