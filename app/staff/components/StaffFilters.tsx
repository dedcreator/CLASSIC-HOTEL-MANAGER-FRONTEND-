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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or username..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="input-field"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input-field"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}