// frontend/app/rooms/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCreateRoom } from '@/lib/api/hooks/useRooms';

export default function NewRoomPage() {
  const router = useRouter();
  const createRoom = useCreateRoom();

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'standard',
    base_price: '',
    capacity: '2',
    barcode: '',
    description: '',
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard Room' },
    { value: 'deluxe', label: 'Deluxe Suite' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createRoom.mutateAsync({
        room_number: formData.room_number,
        room_type: formData.room_type as any,
        base_price: parseFloat(formData.base_price),
        capacity: parseInt(formData.capacity),
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
        status: 'available',
      });
      router.push('/rooms');
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Set default capacity based on room type
  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomType = e.target.value;
    setFormData(prev => ({
      ...prev,
      room_type: roomType,
      capacity: roomType === 'duplex' ? '4' : '2',
    }));
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <Link
          href="/rooms"
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Rooms
        </Link>
        <h1 className="text-2xl font-bold text-dark-500">Add New Room</h1>
        <p className="text-sm text-gray-600">Create a new room in your hotel</p>
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
              placeholder="e.g., 101, 202A"
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
              onChange={handleRoomTypeChange}
              required
              className="input-field"
            >
              {roomTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
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
                placeholder="25000"
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
                placeholder={formData.room_type === 'duplex' ? '4' : '2'}
                readOnly // Make it read-only since it's auto-set by room type
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
              Barcode (optional)
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="input-field"
              placeholder="Scan or enter barcode"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Room features, view, amenities..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/rooms"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createRoom.isPending}
              className="btn-primary"
            >
              {createRoom.isPending ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}