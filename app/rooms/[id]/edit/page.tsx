// frontend/app/rooms/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRoom, useUpdateRoom } from '@/lib/api/hooks/useRooms';
import Layout from '@/components/layout/Layout';

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const { data: room, isLoading } = useRoom(roomId);
  const updateRoom = useUpdateRoom();

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'standard',
    base_price: '',
    capacity: '2',
    barcode: '',
    description: '',
    status: 'available',
  });

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || '',
        room_type: room.room_type || 'standard',
        base_price: room.base_price?.toString() || '',
        capacity: room.capacity?.toString() || '2',
        barcode: room.barcode || '',
        description: room.description || '',
        status: room.status || 'available',
      });
    }
  }, [room]);

  const roomTypes = [
    { value: 'standard', label: 'Standard Room' },
    { value: 'duplex', label: 'Duplex Suite' },
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'cleaning', label: 'Cleaning' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        room_number: formData.room_number,
        room_type: formData.room_type as any,
        base_price: parseFloat(formData.base_price),
        capacity: parseInt(formData.capacity),
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
        status: formData.status as any,
      });
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-update capacity based on room type
    if (name === 'room_type') {
      setFormData(prev => ({
        ...prev,
        room_type: value,
        capacity: value === 'duplex' ? '4' : '2',
      }));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20">
        <div className="mb-6">
          <Link
            href={`/rooms/${roomId}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Room Details
          </Link>
          <h1 className="text-2xl font-bold text-dark-500">Edit Room {room?.room_number}</h1>
          <p className="text-sm text-gray-600">Update room information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Number */}
            <div>
              <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                id="room_number"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {/* Room Type */}
            <div>
              <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">
                Room Type *
              </label>
              <select
                id="room_type"
                name="room_type"
                value={formData.room_type}
                onChange={handleChange}
                required
                className="input-field"
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="input-field"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Price and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Night (₦) *
                </label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="input-field"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.room_type === 'duplex' 
                    ? 'Duplex suites accommodate up to 4 guests' 
                    : 'Standard rooms accommodate up to 2 guests'}
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href={`/rooms/${roomId}`}
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateRoom.isPending}
                className="btn-primary"
              >
                {updateRoom.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}