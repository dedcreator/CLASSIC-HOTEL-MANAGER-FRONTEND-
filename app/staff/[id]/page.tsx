// frontend/app/staff/[id]/page.tsx
'use client';

import { useState, useMemo } from 'react';
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
  DocumentTextIcon,
  ShoppingCartIcon,
  BeakerIcon,
  HomeModernIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useStaffMember, useDeleteStaff, useUpdateStaff, useStaffPerformance, useStaffSales, useStaffBookings, useStaffActivities } from '@/lib/api/hooks/useStaff';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Role colors with uppercase keys to match backend
const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  MANAGER: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  RECEPTIONIST: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  BAR_STAFF: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  HOUSEKEEPING: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  CEO: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  BAR_STAFF: 'Bar Staff',
  HOUSEKEEPING: 'Housekeeping',
  CEO: 'CEO',
};

type LogType = 'all' | 'sales' | 'bookings' | 'room_activities';
type DateRange = 'today' | 'week' | 'month' | 'custom';

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [period, setPeriod] = useState(30);
  const [logType, setLogType] = useState<LogType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: staff, isLoading } = useStaffMember(staffId);
  const { data: performance } = useStaffPerformance(staffId, period);
  const { data: sales } = useStaffSales(staffId, {
    days: period,
    startDate: dateRange === 'custom' ? customStartDate : undefined,
    endDate: dateRange === 'custom' ? customEndDate : undefined,
  });
  const { data: bookings } = useStaffBookings(staffId, {
    days: period,
    startDate: dateRange === 'custom' ? customStartDate : undefined,
    endDate: dateRange === 'custom' ? customEndDate : undefined,
  });
  const { data: activities } = useStaffActivities(staffId, {
    days: period,
    startDate: dateRange === 'custom' ? customStartDate : undefined,
    endDate: dateRange === 'custom' ? customEndDate : undefined,
  });

  const deleteStaff = useDeleteStaff();
  const updateStaff = useUpdateStaff();

  // Calculate totals
  const totals = useMemo(() => {
    let totalSales = 0;
    let totalBookings = 0;
    let cashPayments = 0;
    let cardPayments = 0;
    let transferPayments = 0;
    let roomCharges = 0;

    if (sales) {
      sales.forEach(sale => {
        totalSales += sale.total_amount;
        switch (sale.payment_method) {
          case 'cash':
            cashPayments += sale.total_amount;
            break;
          case 'card':
            cardPayments += sale.total_amount;
            break;
          case 'transfer':
            transferPayments += sale.total_amount;
            break;
          case 'room_charge':
            roomCharges += sale.total_amount;
            break;
        }
      });
    }

    if (bookings) {
      totalBookings = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
    }

    return {
      totalSales,
      totalBookings,
      cashPayments,
      cardPayments,
      transferPayments,
      roomCharges,
      totalRevenue: totalSales + totalBookings,
    };
  }, [sales, bookings]);

  // Handle delete staff member - toast is already shown in useDeleteStaff hook
  const handleDelete = async () => {
    if (!staff) return;
    
    try {
      await deleteStaff.mutateAsync(staffId);
      router.push('/staff');
    } catch (error: any) {
      console.error('Delete error:', error);
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete this staff member');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete staff member. Please try again.');
      }
    }
  };

  // Handle toggle active/inactive status
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

  // Handle export logs to CSV
  const handleExport = () => {
    let csvContent = "Date,Type,Reference,Amount,Payment Method,Details\n";
    
    if (sales && sales.length > 0) {
      sales.forEach(sale => {
        csvContent += `${format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm')},Sale,${sale.transaction_number},${sale.total_amount},${sale.payment_method},${sale.items?.length || 0} items\n`;
      });
    }
    
    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        csvContent += `${format(new Date(booking.created_at), 'yyyy-MM-dd HH:mm')},Booking,${booking.booking_reference},${booking.total_amount},${booking.payment_method || 'N/A'},Room ${booking.room?.room_number}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_${staff?.username}_logs.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8 px-4">
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

  const roleStyle = roleColors[staff.role] || roleColors.RECEPTIONIST;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
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
          {/* Cover Photo with Role-based Gradient */}
          <div className={`h-32 bg-gradient-to-r ${
            staff.role === 'BAR_STAFF' ? 'from-amber-600 to-amber-500' :
            staff.role === 'RECEPTIONIST' ? 'from-green-600 to-green-500' :
            staff.role === 'HOUSEKEEPING' ? 'from-pink-600 to-pink-500' :
            staff.role === 'MANAGER' ? 'from-blue-600 to-blue-500' :
            staff.role === 'CEO' ? 'from-red-600 to-red-500' :
            'from-purple-600 to-purple-500'
          }`}></div>
          
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
                  {roleLabels[staff.role] || staff.role}
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

        {/* Earnings Summary Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                Revenue Summary
              </h2>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export Logs
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/60 text-sm mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-white">₦{totals.totalRevenue.toLocaleString()}</p>
                <p className="text-white/40 text-xs mt-1">All transactions</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/60 text-sm mb-1">Bar Sales</p>
                <p className="text-2xl font-bold text-yellow-400">₦{totals.totalSales.toLocaleString()}</p>
                <p className="text-white/40 text-xs mt-1">{sales?.length || 0} transactions</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/60 text-sm mb-1">Room Bookings</p>
                <p className="text-2xl font-bold text-green-400">₦{totals.totalBookings.toLocaleString()}</p>
                <p className="text-white/40 text-xs mt-1">{bookings?.length || 0} bookings</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/60 text-sm mb-1">Payment Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Cash</span>
                    <span className="text-white font-medium">₦{totals.cashPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Card</span>
                    <span className="text-white font-medium">₦{totals.cardPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Transfer</span>
                    <span className="text-white font-medium">₦{totals.transferPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Room Charge</span>
                    <span className="text-white font-medium">₦{totals.roomCharges.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
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
                <option value={365}>Last 12 months</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {performance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Sales</span>
                    <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
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

        {/* Staff Logs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Activity Logs & Transactions
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogType('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'all' 
                      ? 'bg-white text-red-600' 
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLogType('sales')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'sales' 
                      ? 'bg-white text-red-600' 
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setLogType('bookings')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'bookings' 
                      ? 'bg-white text-red-600' 
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    showFilters 
                      ? 'bg-white text-red-600' 
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  Filters
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setDateRange('today')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      dateRange === 'today' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      dateRange === 'week' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      dateRange === 'month' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRange('custom')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      dateRange === 'custom' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>

                {dateRange === 'custom' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sales Logs */}
            {(logType === 'all' || logType === 'sales') && sales && sales.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCartIcon className="h-5 w-5 text-amber-500" />
                  Bar/Restaurant Sales
                </h3>
                <div className="space-y-3">
                  {sales.map((sale: any) => (
                    <div key={sale.id} className="bg-amber-50 rounded-xl p-4 border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-1 bg-amber-200 text-amber-800 rounded-full">
                              {sale.payment_method}
                            </span>
                            <span className="text-xs text-gray-500">{sale.transaction_number}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Guest</p>
                              <p className="font-medium">{sale.guest_name || 'Walk-in'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Items</p>
                              <p className="font-medium">{sale.items?.length || 0} items</p>
                            </div>
                          </div>
                          {sale.items && sale.items.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              {sale.items.map((item: any, idx: number) => (
                                <span key={item.id}>
                                  {item.product?.name} x{item.quantity}
                                  {idx < sale.items.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-700">₦{sale.total_amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Logs */}
            {(logType === 'all' || logType === 'bookings') && bookings && bookings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HomeModernIcon className="h-5 w-5 text-green-500" />
                  Room Bookings
                </h3>
                <div className="space-y-3">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="bg-green-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                              booking.status === 'checked_in' ? 'bg-blue-200 text-blue-800' :
                              booking.status === 'checked_out' ? 'bg-gray-200 text-gray-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                            <span className="text-xs text-gray-500">{booking.booking_reference}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Guest</p>
                              <p className="font-medium">{booking.guest?.first_name} {booking.guest?.last_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Room</p>
                              <p className="font-medium">{booking.room?.room_number}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            Check-in: {format(new Date(booking.check_in), 'MMM dd')} - 
                            Check-out: {format(new Date(booking.check_out), 'MMM dd')}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-700">₦{booking.total_amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Activities */}
            {(logType === 'all' || logType === 'room_activities') && activities && activities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BeakerIcon className="h-5 w-5 text-pink-500" />
                  Room Activities
                </h3>
                <div className="space-y-3">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Room {activity.room_number}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-200 text-green-800' :
                          activity.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {(!sales?.length && !bookings?.length && !activities?.length) && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No logs found for the selected period</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
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