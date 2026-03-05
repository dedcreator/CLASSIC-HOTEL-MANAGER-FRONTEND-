// frontend/app/rooms/components/RoomFilters.tsx
'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';

interface RoomFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
}

export default function RoomFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}: RoomFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'available', label: 'Available', color: 'green' },
    { value: 'occupied', label: 'Occupied', color: 'red' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'cleaning', label: 'Cleaning', color: 'blue' },
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <FunnelIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>
      
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
              ${statusFilter === status.value
                ? status.value === 'all'
                  ? 'bg-gray-600 text-white border-gray-600'
                  : `bg-${status.color}-600 text-white border-${status.color}-600`
                : status.value === 'all'
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  : `bg-${status.color}-100 text-${status.color}-800 border-${status.color}-200 hover:bg-${status.color}-200`
              }
            `}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2 mt-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
              ${typeFilter === type.value
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}