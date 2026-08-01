// frontend/app/rooms/components/RoomFilters.tsx
'use client';

interface RoomFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  roomTypes?: string[];
}

export default function RoomFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  roomTypes = ['all', 'standard', 'deluxe', 'suite', 'executive'],
}: RoomFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  // Format type label for display
  const formatTypeLabel = (type: string) => {
    if (type === 'all') return 'All Types';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-3">
      {/* Status Filters */}
      <div>
        <p className="font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider mb-2">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(status.value)}
              className={`font-body px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                statusFilter === status.value
                  ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                  : 'bg-[#FAF6EF] text-[#5B564B] hover:bg-[#F7F1E4] hover:border-[#DDD5C4] border border-transparent'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#DDD5C4]" />

      {/* Type Filters */}
      <div>
        <p className="font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider mb-2">
          Room Type
        </p>
        <div className="flex flex-wrap gap-2">
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`font-body px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                typeFilter === type
                  ? 'bg-[#C9A468] text-[#F7F1E4] shadow-sm'
                  : 'bg-[#FAF6EF] text-[#5B564B] hover:bg-[#F7F1E4] hover:border-[#DDD5C4] border border-transparent'
              }`}
            >
              {formatTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(statusFilter !== 'all' || typeFilter !== 'all') && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#DDD5C4]">
          <span className="font-body text-xs text-[#8A8377]">Active filters:</span>
          {statusFilter !== 'all' && (
            <span className="font-body text-xs bg-[#16302B] text-[#F7F1E4] px-2 py-0.5 rounded-full">
              {statuses.find(s => s.value === statusFilter)?.label}
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="font-body text-xs bg-[#C9A468] text-[#F7F1E4] px-2 py-0.5 rounded-full">
              {formatTypeLabel(typeFilter)}
            </span>
          )}
          <button
            onClick={() => {
              onStatusChange('all');
              onTypeChange('all');
            }}
            className="font-body text-xs text-[#C9A468] hover:text-[#B8924F] ml-auto transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}