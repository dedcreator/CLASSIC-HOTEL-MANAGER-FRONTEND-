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
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Room } from '@/lib/api/types';
import { useDeleteRoom } from '@/lib/api/hooks/useRooms';
import { useBookings } from '@/lib/api/hooks/useBookings';
import toast from 'react-hot-toast';
import CheckInModal from './CheckInModal';

interface RoomCardProps {
  room: Room;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
  onShortRestClick?: (room: Room) => void;
}

const statusColors = {
  available: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
  occupied: 'bg-[#FCE4EC] text-[#C62828] border-[#EF9A9A]',
  maintenance: 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]',
  cleaning: 'bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]',
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
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
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

  const handleCheckInComplete = () => {
    // Refresh room status or update UI
    setShowCheckInModal(false);
    toast.success(`Guest checked in to Room ${room.room_number}`);
    // Optionally trigger a refetch of rooms
  };

  return (
    <>
      <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Room Header with Status */}
        <div className="p-4 border-b border-[#F7F1E4]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{roomIcons[room.room_type as keyof typeof roomIcons] || '🏨'}</span>
              <h3 className="font-display text-lg font-medium text-[#2A2622]">Room {room.room_number}</h3>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/rooms/${room.id}/edit`}
                className="p-1 text-[#8A8377] hover:text-[#16302B] transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDeleteClick}
                className="p-1 text-[#8A8377] hover:text-[#C62828] transition-colors"
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
            className={`font-body w-full text-sm rounded-lg px-3 py-2 border font-medium outline-none transition-colors ${
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
            <span className="font-body text-sm text-[#5B564B] capitalize">
              {room.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'}
            </span>
            <span className="font-display text-lg font-medium text-[#16302B]">₦{room.base_price}</span>
          </div>

          <div className="flex items-center gap-4 font-body text-sm text-[#5B564B]">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4 text-[#8A8377]" />
              <span>{room.capacity} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#DDD5C4]">•</span>
              <span>Barcode: {room.barcode || 'N/A'}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex gap-3 text-[#8A8377]">
            <WifiIcon className="h-4 w-4" title="WiFi" />
            <TvIcon className="h-4 w-4" title="TV" />
            <ScaleIcon className="h-4 w-4" title="AC" />
            <ShieldCheckIcon className="h-4 w-4" title="Safe" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {/* Check-in Button - Only show for available rooms */}
            {room.status === 'available' && (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-[#C9A468] text-[#F7F1E4] text-sm py-2 rounded-lg hover:bg-[#B8924F] transition-colors flex items-center justify-center gap-1.5 font-body font-medium"
                title="Check-in guest"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Check In</span>
                <span className="sm:hidden">Check In</span>
              </button>
            )}
            
            {/* Bookings Button */}
            <Link
              href={`/rooms/${room.id}/bookings`}
              className="bg-[#16302B] text-[#F7F1E4] text-sm py-2 rounded-lg hover:bg-[#1D3B34] transition-colors flex items-center justify-center gap-1.5 font-body font-medium"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
              <span className="sm:hidden">Book</span>
            </Link>
            
            {/* Details Button */}
            <Link
              href={`/rooms/${room.id}`}
              className="bg-[#F7F1E4] text-[#5B564B] text-sm py-2 rounded-lg hover:bg-[#DDD5C4] transition-colors flex items-center justify-center font-body font-medium"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <CheckInModal
          room={room}
          onClose={() => setShowCheckInModal(false)}
          onComplete={handleCheckInComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-[#DDD5C4]">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Room</h3>
            <p className="font-body text-[#5B564B] mb-4">
              Are you sure you want to delete Room {room.room_number}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="font-body px-4 py-2 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRoom.isPending}
                className="font-body px-4 py-2 bg-[#C62828] text-[#F7F1E4] rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-[#DDD5C4]">
            <div className="flex items-center gap-3 text-[#E65100] mb-4">
              <ExclamationTriangleIcon className="h-8 w-8" />
              <h3 className="font-display text-lg font-medium text-[#2A2622]">Cannot Delete Room</h3>
            </div>
            
            <p className="font-body text-[#5B564B] mb-4">
              Room {room.room_number} has <span className="font-semibold">{bookingsCount}</span> existing booking{bookingsCount > 1 ? 's' : ''}. 
              You must delete or reassign all bookings before deleting this room.
            </p>

            <div className="bg-[#FFF3E0] border border-[#FFCC80] rounded-lg p-3 mb-4">
              <p className="font-body text-sm text-[#E65100]">
                <strong>Why?</strong> Deleting this room would break the booking history. 
                You can either:
              </p>
              <ul className="font-body text-sm text-[#E65100] mt-2 list-disc pl-5">
                <li>Delete all bookings for this room first</li>
                <li>Or mark the room as inactive instead of deleting</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingsWarning(false)}
                className="flex-1 font-body px-4 py-2 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleViewBookings}
                className="flex-1 font-body px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
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