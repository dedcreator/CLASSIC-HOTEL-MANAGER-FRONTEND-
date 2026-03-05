// frontend/app/staff/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useStaffMember, useDeleteStaff, useUpdateStaff, useStaffPerformance } from '@/lib/api/hooks/useStaff';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  manager: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  receptionist: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  bar_staff: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  housekeeping: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  ceo: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  receptionist: 'Receptionist',
  bar_staff: 'Bar Staff',
  housekeeping: 'Housekeeping',
  ceo: 'CEO',
};

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [period, setPeriod] = useState(30);

  const { data: staff, isLoading } = useStaffMember(staffId);
  const { data: performance } = useStaffPerformance(staffId, period);
  const deleteStaff = useDeleteStaff();
  const updateStaff = useUpdateStaff();

  const handleToggleStatus = async () => {
    if (!staff) return;

    try {
      if (staff.is_active) {
        await updateStaff.mutateAsync({ id: staffId, is_active: false });
        toast.success('Staff deactivated');
      } else {
        await updateStaff.mutateAsync({ id: staffId, is_active: true });
        toast.success('Staff activated');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff.mutateAsync(staffId);
      toast.success('Staff member removed');
      router.push('/staff');
    } catch (error) {
      toast.error('Failed to delete staff');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center px-4">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Not Found</h2>
          <p className="text-gray-600 mb-6">The staff member you're looking for doesn't exist.</p>
          <Link href="/staff" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Staff
          </Link>
        </div>
      </Layout>
    );
  }

  const roleStyle = roleColors[staff.role] || roleColors.receptionist;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with back button */}
        <Link
          href="/staff"
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Staff
        </Link>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-red-600 to-red-500"></div>
          
          {/* Profile Content */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-4xl font-bold text-red-600">
                    {staff.first_name?.[0]}{staff.last_name?.[0]}
                  </span>
                </div>
                <div className="mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{staff.full_name}</h1>
                  <p className="text-gray-500">@{staff.username}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <Link
                  href={`/staff/${staffId}/edit`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className={`px-4 py-2 rounded-lg border ${roleStyle.border} ${roleStyle.bg}`}>
                <span className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  {roleLabels[staff.role]}
                </span>
              </div>
              
              {staff.is_active ? (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Active
                  </span>
                </div>
              ) : (
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4" />
                    Inactive
                  </span>
                </div>
              )}
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-gray-900 font-medium">{staff.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Phone</span>
                </div>
                <p className="text-gray-900 font-medium">{staff.phone || 'Not provided'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Joined</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(staff.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Performance Overview
              </h2>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm border-0 focus:ring-2 focus:ring-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {performance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Sales</span>
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{performance.sales.count}</p>
                  <p className="text-xs text-blue-600 mt-1">transactions</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Revenue</span>
                    <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">₦{performance.sales.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">total</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">Bookings</span>
                    <CalendarIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{performance.bookings.count}</p>
                  <p className="text-xs text-purple-600 mt-1">reservations</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">Check-ins</span>
                    <ClockIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{performance.check_ins}</p>
                  <p className="text-xs text-amber-600 mt-1">guests</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No performance data available</p>
                <p className="text-sm text-gray-400 mt-1">Staff hasn't made any sales or bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Staff Member</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{staff.full_name}</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteStaff.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 disabled:opacity-50 transition-colors font-medium"
                >
                  {deleteStaff.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}