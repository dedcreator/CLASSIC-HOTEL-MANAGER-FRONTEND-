// frontend/app/rooms/components/RoomCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserIcon,
  WifiIcon,
  TvIcon,
  ScaleIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  ShieldExclamationIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Room } from '@/lib/api/types';
import {
  useDeleteRoom,
  useRequestCleaningKey,
  useApproveCleaningKey,
  useRejectCleaningKey,
  useActivateCleanedRoom,
} from '@/lib/api/hooks/useRooms';
import { useBookings } from '@/lib/api/hooks/useBookings';
import { useAuth } from '@/lib/api/hooks/useAuth';
import toast from 'react-hot-toast';
import CheckInModal from './CheckInModal';
import EmergencyKeyModal from './EmergencyKeyModal';
import AuditTrailModal from './AuditTrailModal';

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
  reserved: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#CE93D8]',
};

const roomIcons = {
  standard: '🛏️',
  deluxe: '🏠',
  suite: '🏰',
  executive: '⭐',
  presidential: '👑',
};

export default function RoomCard({ room, onStatusChange, isUpdating }: RoomCardProps) {
  const { user } = useAuth();
  const isManagerOrCeo = user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBookingsWarning, setShowBookingsWarning] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const deleteRoom = useDeleteRoom();
  const requestCleaningKey = useRequestCleaningKey();
  const approveCleaningKey = useApproveCleaningKey();
  const rejectCleaningKey = useRejectCleaningKey();
  const activateCleanedRoom = useActivateCleanedRoom();

  const { data: roomBookings } = useBookings({ room: room.id });

  const activeCode = room.active_access_code;
  const pendingCleaning = room.pending_cleaning_request;

  const handleDeleteClick = () => {
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
      if (error.response?.data?.includes('referenced through protected foreign keys')) {
        toast.error('Cannot delete room with existing bookings.');
      } else {
        toast.error('Failed to delete room');
      }
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCodeCopied(true);
    toast.success('Code copied');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
        {/* Room Header with Status */}
        <div className="p-4 border-b border-[#F7F1E4]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{roomIcons[room.room_type as keyof typeof roomIcons] || '🏨'}</span>
              <div>
                <h3 className="font-display text-lg font-medium text-[#2A2622]">Room {room.room_number}</h3>
                <span className="font-body text-xs text-[#8A8377] capitalize">
                  {room.room_type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowAuditModal(true)}
                className="p-1.5 text-[#8A8377] hover:text-[#16302B] hover:bg-[#F7F1E4] rounded-md transition-colors"
                title="Security & Access Audit Trail"
              >
                <ShieldCheckIcon className="h-4 w-4" />
              </button>
              <Link
                href={`/rooms/${room.id}/edit`}
                className="p-1.5 text-[#8A8377] hover:text-[#16302B] hover:bg-[#F7F1E4] rounded-md transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-1.5 text-[#8A8377] hover:text-[#C62828] hover:bg-[#FEE2E2] rounded-md transition-colors"
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
            className={`font-body w-full text-sm rounded-lg px-3 py-1.5 border font-medium outline-none transition-colors ${
              statusColors[room.status as keyof typeof statusColors] || statusColors.available
            }`}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        {/* Room Details & Access Key Section */}
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-medium text-[#16302B]">₦{room.base_price?.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-[#5B564B]">
              <UserIcon className="h-3.5 w-3.5 text-[#8A8377]" />
              <span>{room.capacity} guests</span>
            </div>
          </div>

          {/* Active Key Display */}
          {activeCode ? (
            <div className="bg-[#FAF6EF] border border-[#DDD5C4] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-[#C9A468]" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#16302B]">{activeCode.code}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[#16302B]/10 text-[#16302B] uppercase">
                      {activeCode.code_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8A8377]">
                    Exp: {new Date(activeCode.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyCode(activeCode.code)}
                className="p-1 text-[#8A8377] hover:text-[#16302B] rounded transition-colors"
                title="Copy code"
              >
                {codeCopied ? (
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#2E7D32]" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#8A8377] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              No active access code
            </div>
          )}

          {/* Cleaning Workflow Banner if in Cleaning */}
          {room.status === 'cleaning' && (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#1E40AF] font-medium">
                <span className="flex items-center gap-1">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Housekeeping
                </span>
                {pendingCleaning && (
                  <span className="text-[10px] bg-[#DBEAFE] text-[#1E40AF] px-1.5 py-0.5 rounded font-semibold">
                    Approval Required
                  </span>
                )}
              </div>

              {/* Pending Manager Approval */}
              {pendingCleaning ? (
                isManagerOrCeo ? (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={approveCleaningKey.isPending}
                      onClick={() => approveCleaningKey.mutate(pendingCleaning.id)}
                      className="flex-1 py-1 px-2 bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckIcon className="h-3 w-3" />
                      Approve Key
                    </button>
                    <button
                      type="button"
                      disabled={rejectCleaningKey.isPending}
                      onClick={() => rejectCleaningKey.mutate(pendingCleaning.id)}
                      className="py-1 px-2 border border-[#FCA5A5] hover:bg-[#FEE2E2] text-[#991B1B] text-xs rounded transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#1D4ED8]">
                    Key request submitted. Waiting for manager approval.
                  </p>
                )
              ) : activeCode && activeCode.code_type === 'cleaning' ? (
                /* Cleaning Key is approved & active -> Activate Room */
                <button
                  type="button"
                  disabled={activateCleanedRoom.isPending}
                  onClick={() => activateCleanedRoom.mutate(activeCode.id)}
                  className="w-full py-1.5 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Cleaning Complete → Activate Room
                </button>
              ) : (
                /* No cleaning key yet -> Housekeeper requests one */
                <button
                  type="button"
                  disabled={requestCleaningKey.isPending}
                  onClick={() => requestCleaningKey.mutate({ room_id: room.id })}
                  className="w-full py-1.5 bg-white border border-[#93C5FD] hover:bg-[#DBEAFE] text-[#1E40AF] text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                >
                  <KeyIcon className="h-3.5 w-3.5" />
                  Request Cleaning Key
                </button>
              )}
            </div>
          )}

          {/* Amenities icons */}
          <div className="flex gap-2.5 text-[#8A8377] pt-1">
            <WifiIcon className="h-3.5 w-3.5" title="WiFi" />
            <TvIcon className="h-3.5 w-3.5" title="TV" />
            <ScaleIcon className="h-3.5 w-3.5" title="AC" />
            <ShieldCheckIcon className="h-3.5 w-3.5" title="Safe" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Check-in Button */}
            {room.status === 'available' ? (
              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                className="bg-[#C9A468] hover:bg-[#B8924F] text-[#F7F1E4] text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium shadow-sm"
              >
                <ArrowRightOnRectangleIcon className="h-3.5 w-3.5" />
                Check In
              </button>
            ) : (
              <Link
                href={`/rooms/${room.id}/bookings`}
                className="bg-[#16302B] hover:bg-[#1D3B34] text-[#F7F1E4] text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                Bookings
              </Link>
            )}

            {/* Emergency Key for Manager/CEO or Details */}
            {isManagerOrCeo ? (
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#B91C1C] text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
                title="Issue 1-Hour Emergency Key"
              >
                <ShieldExclamationIcon className="h-3.5 w-3.5" />
                Emergency Key
              </button>
            ) : (
              <Link
                href={`/rooms/${room.id}`}
                className="bg-[#F7F1E4] hover:bg-[#DDD5C4] text-[#5B564B] text-xs py-2 rounded-lg transition-colors flex items-center justify-center font-medium text-center"
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <CheckInModal
          room={room}
          onClose={() => setShowCheckInModal(false)}
          onComplete={() => setShowCheckInModal(false)}
        />
      )}

      {/* Emergency Key Modal */}
      {showEmergencyModal && (
        <EmergencyKeyModal
          room={room}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <AuditTrailModal
          room={room}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-[#DDD5C4]">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Room</h3>
            <p className="font-body text-sm text-[#5B564B] mb-4">
              Are you sure you want to delete Room {room.room_number}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#DDD5C4] rounded-lg text-sm text-[#5B564B] hover:bg-[#F7F1E4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-[#C62828] text-white rounded-lg text-sm hover:bg-[#B71C1C]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Bookings Warning */}
      {showBookingsWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-[#DDD5C4]">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Cannot Delete Room</h3>
            <p className="font-body text-sm text-[#5B564B] mb-4">
              Room {room.room_number} has {bookingsCount} associated booking(s). Reassign or cancel bookings first.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowBookingsWarning(false)}
                className="px-4 py-2 bg-[#16302B] text-white rounded-lg text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}