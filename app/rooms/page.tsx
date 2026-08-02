// frontend/app/rooms/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  Bars3Icon,
  BuildingOffice2Icon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useRooms, useUpdateRoomStatus } from '@/lib/api/hooks/useRooms';
import RoomCard from './components/RoomCard';
import RoomFilters from './components/RoomFilters';
import Layout from '@/components/layout/Layout';
import ShortRestModal from './components/CheckInModal';

const statusConfig = {
  available: {
    label: 'Available',
    bg: 'bg-[#E8F5E9]',
    text: 'text-[#2E7D32]',
    border: 'border-[#A5D6A7]',
    icon: CheckCircleIcon,
  },
  occupied: {
    label: 'Occupied',
    bg: 'bg-[#FCE4EC]',
    text: 'text-[#C62828]',
    border: 'border-[#EF9A9A]',
    icon: XCircleIcon,
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-[#FFF3E0]',
    text: 'text-[#E65100]',
    border: 'border-[#FFCC80]',
    icon: WrenchScrewdriverIcon,
  },
  cleaning: {
    label: 'Cleaning',
    bg: 'bg-[#E3F2FD]',
    text: 'text-[#0D47A1]',
    border: 'border-[#90CAF9]',
    icon: SparklesIcon,
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-[#F3E5F5]',
    text: 'text-[#6A1B9A]',
    border: 'border-[#CE93D8]',
    icon: StarIcon,
  },
};

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRoomForShortRest, setSelectedRoomForShortRest] = useState<any>(null);
  const [showShortRestModal, setShowShortRestModal] = useState(false);
  
  const { data: rooms, isLoading } = useRooms({});
  const updateStatus = useUpdateRoomStatus();

  // Filter rooms
  const filteredRooms = rooms?.filter(room => {
    const matchesSearch = !searchTerm || 
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Calculate stats
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter(r => r.status === 'available').length || 0;
  const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
  const maintenanceRooms = rooms?.filter(r => r.status === 'maintenance').length || 0;
  const cleaningRooms = rooms?.filter(r => r.status === 'cleaning').length || 0;
  const reservedRooms = rooms?.filter(r => r.status === 'reserved').length || 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleShortRestClick = (room: any) => {
    setSelectedRoomForShortRest(room);
    setShowShortRestModal(true);
  };

  // Get unique room types
  const roomTypes = rooms ? ['all', ...new Set(rooms.map(r => r.room_type))] : ['all'];

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Rooms Management</h1>
              <p className="font-body text-sm text-[#8A8377]">Manage your hotel rooms and availability</p>
            </div>
            <Link
              href="/rooms/new"
              className="font-body inline-flex items-center gap-2 px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Room
            </Link>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Total Rooms</p>
              <p className="font-display text-2xl font-medium text-[#2A2622]">{totalRooms}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Available</p>
              <p className="font-display text-2xl font-medium text-[#2E7D32]">{availableRooms}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Occupied</p>
              <p className="font-display text-2xl font-medium text-[#C62828]">{occupiedRooms}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Cleaning</p>
              <p className="font-display text-2xl font-medium text-[#0D47A1]">{cleaningRooms}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Maintenance</p>
              <p className="font-display text-2xl font-medium text-[#E65100]">{maintenanceRooms}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377] mb-1">Reserved</p>
              <p className="font-display text-2xl font-medium text-[#6A1B9A]">{reservedRooms}</p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white border border-[#DDD5C4] rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="text"
                  placeholder="Search by room number, name, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
                />
              </div>
            
              {/* View Toggle */}
              <div className="flex gap-2 bg-[#F7F1E4] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#16302B] text-[#F7F1E4]'
                      : 'text-[#8A8377] hover:text-[#2A2622]'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#16302B] text-[#F7F1E4]'
                      : 'text-[#8A8377] hover:text-[#2A2622]'
                  }`}
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Filter Chips */}
            <RoomFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              roomTypes={roomTypes}
            />
          </div>
          
          {/* Rooms Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white border border-[#DDD5C4] rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-[#F7F1E4] rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-12 text-center">
              <HomeIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-4" />
              <p className="font-body text-[#8A8377] mb-4">No rooms found</p>
              <Link href="/rooms/new" className="font-body inline-block px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors">
                Add Your First Room
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onStatusChange={handleStatusChange}
                  isUpdating={updateStatus.isPending}
                  onShortRestClick={handleShortRestClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DDD5C4]">
                  <thead className="bg-[#F7F1E4]">
                    <tr>
                      <th className="px-6 py-3 text-left font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Price/Night</th>
                      <th className="px-6 py-3 text-left font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-right font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F7F1E4]">
                    {filteredRooms.map((room) => {
                      const status = statusConfig[room.status as keyof typeof statusConfig] || statusConfig.available;
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr key={room.id} className="hover:bg-[#FAF6EF] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <BuildingOffice2Icon className="h-4 w-4 text-[#C9A468]" />
                              <span className="font-body font-medium text-[#2A2622]">
                                {room.name || `Room ${room.room_number}`}
                              </span>
                              <span className="font-body text-xs text-[#8A8377]">
                                #{room.room_number}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-body text-sm text-[#5B564B] capitalize">
                            {room.room_type_display || room.room_type}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-body font-medium text-[#16302B]">
                              ₦{room.base_price?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={room.status}
                                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                                className={`font-body text-xs rounded-lg px-3 py-1.5 border font-medium ${status.bg} ${status.text} ${status.border} outline-none cursor-pointer`}
                              >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="reserved">Reserved</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-body text-sm text-[#5B564B] flex items-center gap-1">
                              <UsersIcon className="h-4 w-4 text-[#8A8377]" />
                              {room.capacity || 1} {room.capacity === 1 ? 'guest' : 'guests'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/rooms/${room.id}`}
                              className="font-body text-sm font-medium text-[#C9A468] hover:text-[#B8924F] transition-colors"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Short Rest Modal */}
      {showShortRestModal && selectedRoomForShortRest && (
        <ShortRestModal
          room={selectedRoomForShortRest}
          onClose={() => {
            setShowShortRestModal(false);
            setSelectedRoomForShortRest(null);
          }}
        />
      )}
    </Layout>
  );
}