// frontend/app/rooms/components/RoomCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  UserIcon,
  WifiIcon,
  TvIcon,
  ScaleIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Room } from '@/lib/api/types';
import { useDeleteRoom } from '@/lib/api/hooks/useRooms';
import { useBookings } from '@/lib/api/hooks/useBookings';
import toast from 'react-hot-toast';

interface RoomCardProps {
  room: Room;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
  onShortRestClick?: (room: Room) => void;
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cleaning: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
};

const roomIcons = {
  standard: '🛏️',
  deluxe: '🏠',
};

export default function RoomCard({ room, onStatusChange, isUpdating, onShortRestClick }: RoomCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBookingsWarning, setShowBookingsWarning] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  
  const deleteRoom = useDeleteRoom();
  
  // Fetch bookings for this room to check if it has any
  const { data: roomBookings } = useBookings({ room: room.id });

  const handleDeleteClick = () => {
    // Check if room has any bookings
    if (roomBookings && roomBookings.length > 0) {
      setBookingsCount(roomBookings.length);
      setShowBookingsWarning(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoom.mutateAsync(room.id);
      setShowDeleteConfirm(false);
      toast.success(`Room ${room.room_number} deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      
      // Check if error is due to existing bookings
      if (error.response?.data?.includes('referenced through protected foreign keys')) {
        toast.error(
          'Cannot delete room with existing bookings. ' +
          'Please delete or reassign all bookings first.'
        );
      } else {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleViewBookings = () => {
    window.location.href = `/rooms/${room.id}/bookings`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Room Header with Status */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{roomIcons[room.room_type as keyof typeof roomIcons] || '🏨'}</span>
              <h3 className="text-lg font-semibold text-dark-500">Room {room.room_number}</h3>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/rooms/${room.id}/edit`}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDeleteClick}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete room"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Status Dropdown */}
          <select
            value={room.status}
            onChange={(e) => onStatusChange(room.id, e.target.value)}
            disabled={isUpdating}
            className={`w-full text-sm rounded-lg px-3 py-2 border font-medium ${
              statusColors[room.status as keyof typeof statusColors]
            }`}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>

        {/* Room Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">
              {room.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'}
            </span>
            <span className="text-lg font-bold text-red-600">₦{room.base_price}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span>{room.capacity} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">•</span>
              <span>Barcode: {room.barcode || 'N/A'}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex gap-3 text-gray-500">
            <WifiIcon className="h-4 w-4" title="WiFi" />
            <TvIcon className="h-4 w-4" title="TV" />
            <ScaleIcon className="h-4 w-4" title="AC" />
            <ShieldCheckIcon className="h-4 w-4" title="Safe" />
          </div>

          {/* Action Buttons */}
          <div className={`grid ${room.status === 'available' && onShortRestClick ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-2`}>
            {/* Short Rest Button - Only show for available rooms */}
            {room.status === 'available' && onShortRestClick && (
              <button
                onClick={() => onShortRestClick(room)}
                className="bg-purple-600 text-white text-sm py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                title="Short rest (hourly booking)"
              >
                <ClockIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Short Rest</span>
                <span className="sm:hidden">Rest</span>
              </button>
            )}
            
            {/* Bookings Button */}
            <Link
              href={`/rooms/${room.id}/bookings`}
              className="bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
              <span className="sm:hidden">Book</span>
            </Link>
            
            {/* Details Button */}
            <Link
              href={`/rooms/${room.id}`}
              className="bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-2">Delete Room</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete Room {room.room_number}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRoom.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteRoom.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Warning Modal */}
      {showBookingsWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <ExclamationTriangleIcon className="h-8 w-8" />
              <h3 className="text-lg font-semibold text-dark-500">Cannot Delete Room</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Room {room.room_number} has <span className="font-semibold">{bookingsCount}</span> existing booking{bookingsCount > 1 ? 's' : ''}. 
              You must delete or reassign all bookings before deleting this room.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Why?</strong> Deleting this room would break the booking history. 
                You can either:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc pl-5">
                <li>Delete all bookings for this room first</li>
                <li>Or mark the room as inactive instead of deleting</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingsWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleViewBookings}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}