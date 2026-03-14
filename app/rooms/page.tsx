// frontend/app/rooms/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  WifiIcon,
  TvIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useRooms, useUpdateRoomStatus } from '@/lib/api/hooks/useRooms';
import RoomCard from './components/RoomCard';
import RoomFilters from './components/RoomFilters';
import Layout from '@/components/layout/Layout';
import ShortRestModal from './components/ShortRestModal';

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cleaning: 'bg-blue-100 text-blue-800 border-blue-200',
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
    // Search filter
    const matchesSearch = !searchTerm || 
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Calculate stats
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter(r => r.status === 'available').length || 0;
  const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
  const maintenanceRooms = rooms?.filter(r => r.status === 'maintenance').length || 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleShortRestClick = (room: any) => {
    setSelectedRoomForShortRest(room);
    setShowShortRestModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-500">Rooms Management</h1>
            <p className="text-sm text-gray-600">Manage your hotel rooms and availability</p>
          </div>
          <Link
            href="/rooms/new"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Room
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
            <p className="text-2xl font-bold text-dark-500">{totalRooms}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Available</p>
            <p className="text-2xl font-bold text-green-600">{availableRooms}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Occupied</p>
            <p className="text-2xl font-bold text-red-600">{occupiedRooms}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{maintenanceRooms}</p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
      
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border ${
                  viewMode === 'grid'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border ${
                  viewMode === 'list'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Filter Chips */}
          <RoomFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
          />
        </div>
        
        {/* Rooms Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <HomeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No rooms found</p>
            <Link href="/rooms/new" className="btn-primary">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Night</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Rest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-dark-500">
                      Room {room.room_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{room.room_type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">₦{room.base_price}</td>
                    <td className="px-6 py-4">
                      {room.status === 'available' && (
                        <button
                          onClick={() => handleShortRestClick(room)}
                          className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          <ClockIcon className="h-3 w-3" />
                          Short Rest
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                        className={`text-xs rounded-full px-3 py-1 border font-medium ${
                          statusColors[room.status as keyof typeof statusColors]
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Cleaning</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{room.capacity} guests</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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