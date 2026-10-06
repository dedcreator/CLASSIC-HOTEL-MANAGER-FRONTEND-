// frontend/app/rooms/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { useRoom, useUpdateRoomStatus } from '@/lib/api/hooks/useRooms';
import Layout from '@/components/layout/Layout';

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  cleaning: 'bg-blue-100 text-blue-800',
  reserved: 'bg-purple-100 text-purple-800',
};

const roomTypeLabels = {
  standard: 'Standard Room',
  duplex: 'Duplex Suite',
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const { data: room, isLoading } = useRoom(roomId);
  const updateStatus = useUpdateRoomStatus();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <p className="text-gray-600">Room not found</p>
          <Link href="/rooms" className="btn-primary mt-4">
            Back to Rooms
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/rooms"
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Rooms
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-dark-500">Room {room.room_number}</h1>
            <Link
              href={`/rooms/${room.id}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Room
            </Link>
          </div>
        </div>

        {/* Room Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Current Status</h2>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[room.status]}`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
                <select
                  value={room.status}
                  onChange={(e) => updateStatus.mutate({ id: room.id, status: e.target.value })}
                  className="input-field text-sm w-auto"
                  disabled={updateStatus.isPending}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Room Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Type</p>
                  <p className="font-medium capitalize">
                    {room.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price per Night</p>
                  <p className="font-bold text-red-600">₦{room.base_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capacity</p>
                  <p className="font-medium">{room.capacity} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Barcode</p>
                  <p className="font-mono text-sm">{room.barcode || 'N/A'}</p>
                </div>
              </div>
              {room.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800">{room.description}</p>
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Recent Bookings</h2>
              <p className="text-gray-500 text-center py-4">No bookings yet</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                    <Link
                      href={`/rooms/${room.id}/bookings`}
                      className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 text-center flex items-center justify-center gap-1 flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      View Bookings
                    </Link>
                <Link
                  href={`/rooms/${room.id}/edit`}
                  className="w-full btn-secondary text-center block"
                >
                  Edit Room Details
                </Link>
                <button
                  onClick={() => {/* Print barcode */}}
                  className="w-full btn-secondary text-center"
                >
                  Print Barcode
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Room Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Stays</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-medium text-red-600">₦0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="font-medium">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}