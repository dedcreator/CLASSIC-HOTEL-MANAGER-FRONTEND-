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

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A5]', border: 'border-[#D8B4FE]' },
  MANAGER: { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', border: 'border-[#93C5FD]' },
  RECEPTIONIST: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', border: 'border-[#6EE7B7]' },
  BAR_STAFF: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' },
  HOUSEKEEPING: { bg: 'bg-[#FCE4EC]', text: 'text-[#831843]', border: 'border-[#F9A8D4]' },
  CEO: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' },
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  BAR_STAFF: 'Bar Staff',
  HOUSEKEEPING: 'Housekeeping',
  CEO: 'CEO',
};

const roleGradients: Record<string, string> = {
  ADMIN: 'from-[#8B5CF6] to-[#6D28D9]',
  MANAGER: 'from-[#3B82F6] to-[#1D4ED8]',
  RECEPTIONIST: 'from-[#10B981] to-[#047857]',
  BAR_STAFF: 'from-[#F59E0B] to-[#B45309]',
  HOUSEKEEPING: 'from-[#EC4899] to-[#BE185D]',
  CEO: 'from-[#16302B] to-[#1D3B34]',
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
            <div className="h-8 bg-[#F7F1E4] rounded w-1/4"></div>
            <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#F7F1E4] rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-[#F7F1E4] rounded w-48"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-32"></div>
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
          <div className="bg-[#FEF2F2] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-10 w-10 text-[#EF4444]" />
          </div>
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-2">Staff Not Found</h2>
          <p className="font-body text-[#8A8377] mb-6">The staff member you're looking for doesn't exist.</p>
          <Link href="/staff" className="font-body inline-flex items-center gap-2 px-6 py-3 text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Staff
          </Link>
        </div>
      </Layout>
    );
  }

  const roleStyle = roleColors[staff.role] || roleColors.RECEPTIONIST;
  const roleGradient = roleGradients[staff.role] || roleGradients.RECEPTIONIST;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Link
          href="/staff"
          className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Staff
        </Link>

        {/* Main Profile Card */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden mb-6">
          <div className={`h-24 bg-gradient-to-r ${roleGradient}`}></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                  <span className="font-display text-3xl font-medium text-[#16302B]">
                    {staff.first_name?.[0]}{staff.last_name?.[0]}
                  </span>
                </div>
                <div className="mb-1">
                  <h1 className="font-display text-2xl font-medium text-[#2A2622]">{staff.full_name}</h1>
                  <p className="font-body text-[#8A8377]">@{staff.username}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <Link
                  href={`/staff/${staffId}/edit`}
                  className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EF4444] bg-white border border-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className={`px-4 py-2 rounded-lg border ${roleStyle.border} ${roleStyle.bg}`}>
                <span className="font-body text-sm font-medium flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  {roleLabels[staff.role] || staff.role}
                </span>
              </div>
              
              {staff.is_active ? (
                <div className="px-4 py-2 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg">
                  <span className="font-body text-sm font-medium text-[#065F46] flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Active
                  </span>
                </div>
              ) : (
                <div className="px-4 py-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                  <span className="font-body text-sm font-medium text-[#991B1B] flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4" />
                    Inactive
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F7F1E4] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <EnvelopeIcon className="h-5 w-5 text-[#8A8377]" />
                  <span className="font-body text-sm font-medium text-[#5B564B]">Email</span>
                </div>
                <p className="font-body text-[#2A2622] font-medium">{staff.email}</p>
              </div>

              <div className="bg-[#F7F1E4] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <PhoneIcon className="h-5 w-5 text-[#8A8377]" />
                  <span className="font-body text-sm font-medium text-[#5B564B]">Phone</span>
                </div>
                <p className="font-body text-[#2A2622] font-medium">{staff.phone || 'Not provided'}</p>
              </div>

              <div className="bg-[#F7F1E4] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="h-5 w-5 text-[#8A8377]" />
                  <span className="font-body text-sm font-medium text-[#5B564B]">Joined</span>
                </div>
                <p className="font-body text-[#2A2622] font-medium">
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

        {/* Revenue Summary */}
        <div className="bg-[#16302B] rounded-lg border border-[#1D3B34] mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-[#F7F1E4] flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-[#C9A468]" />
                Revenue Summary
              </h2>
              <button
                onClick={handleExport}
                className="font-body px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#F7F1E4] rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export Logs
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-body text-white/60 text-sm mb-1">Total Revenue</p>
                <p className="font-display text-2xl font-medium text-[#F7F1E4]">₦{totals.totalRevenue.toLocaleString()}</p>
                <p className="font-body text-white/40 text-xs mt-1">All transactions</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-body text-white/60 text-sm mb-1">Bar Sales</p>
                <p className="font-display text-2xl font-medium text-[#C9A468]">₦{totals.totalSales.toLocaleString()}</p>
                <p className="font-body text-white/40 text-xs mt-1">{sales?.length || 0} transactions</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-body text-white/60 text-sm mb-1">Room Bookings</p>
                <p className="font-display text-2xl font-medium text-[#10B981]">₦{totals.totalBookings.toLocaleString()}</p>
                <p className="font-body text-white/40 text-xs mt-1">{bookings?.length || 0} bookings</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-body text-white/60 text-sm mb-1">Payment Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-body text-white/60">Cash</span>
                    <span className="font-body text-white font-medium">₦{totals.cashPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-white/60">Card</span>
                    <span className="font-body text-white font-medium">₦{totals.cardPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-white/60">Transfer</span>
                    <span className="font-body text-white font-medium">₦{totals.transferPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-white/60">Room Charge</span>
                    <span className="font-body text-white font-medium">₦{totals.roomCharges.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden mb-6">
          <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-[#2A2622] flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-[#C9A468]" />
                Performance Overview
              </h2>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="font-body px-3 py-1.5 bg-white text-[#2A2622] border border-[#DDD5C4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A468]"
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
                <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#93C5FD]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm font-medium text-[#1E40AF]">Sales</span>
                    <ShoppingCartIcon className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <p className="font-display text-2xl font-medium text-[#1E40AF]">{performance.sales.count}</p>
                  <p className="font-body text-xs text-[#1E40AF] mt-1">transactions</p>
                </div>

                <div className="bg-[#D1FAE5] rounded-lg p-4 border border-[#6EE7B7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm font-medium text-[#065F46]">Revenue</span>
                    <CurrencyDollarIcon className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <p className="font-display text-2xl font-medium text-[#065F46]">₦{performance.sales.total.toLocaleString()}</p>
                  <p className="font-body text-xs text-[#065F46] mt-1">total</p>
                </div>

                <div className="bg-[#F3E8FF] rounded-lg p-4 border border-[#D8B4FE]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm font-medium text-[#6B21A5]">Bookings</span>
                    <CalendarIcon className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <p className="font-display text-2xl font-medium text-[#6B21A5]">{performance.bookings.count}</p>
                  <p className="font-body text-xs text-[#6B21A5] mt-1">reservations</p>
                </div>

                <div className="bg-[#FEF3C7] rounded-lg p-4 border border-[#FCD34D]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm font-medium text-[#92400E]">Check-ins</span>
                    <ClockIcon className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <p className="font-display text-2xl font-medium text-[#92400E]">{performance.check_ins}</p>
                  <p className="font-body text-xs text-[#92400E] mt-1">guests</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-3" />
                <p className="font-body text-[#8A8377]">No performance data available</p>
                <p className="font-body text-sm text-[#8A8377] mt-1">Staff hasn't made any sales or bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-[#2A2622] flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-[#C9A468]" />
                Activity Logs & Transactions
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogType('all')}
                  className={`font-body px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'all' 
                      ? 'bg-[#16302B] text-[#F7F1E4]' 
                      : 'bg-white text-[#5B564B] border border-[#DDD5C4] hover:bg-[#F7F1E4]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLogType('sales')}
                  className={`font-body px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'sales' 
                      ? 'bg-[#16302B] text-[#F7F1E4]' 
                      : 'bg-white text-[#5B564B] border border-[#DDD5C4] hover:bg-[#F7F1E4]'
                  }`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setLogType('bookings')}
                  className={`font-body px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    logType === 'bookings' 
                      ? 'bg-[#16302B] text-[#F7F1E4]' 
                      : 'bg-white text-[#5B564B] border border-[#DDD5C4] hover:bg-[#F7F1E4]'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`font-body px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    showFilters 
                      ? 'bg-[#16302B] text-[#F7F1E4]' 
                      : 'bg-white text-[#5B564B] border border-[#DDD5C4] hover:bg-[#F7F1E4]'
                  }`}
                >
                  Filters
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {showFilters && (
              <div className="mb-6 p-4 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4]">
                <h3 className="font-body text-sm font-medium text-[#2A2622] mb-3">Date Range</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setDateRange('today')}
                    className={`font-body px-4 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === 'today' 
                        ? 'bg-[#16302B] text-[#F7F1E4]' 
                        : 'bg-white border border-[#DDD5C4] text-[#5B564B] hover:bg-[#F7F1E4]'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`font-body px-4 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === 'week' 
                        ? 'bg-[#16302B] text-[#F7F1E4]' 
                        : 'bg-white border border-[#DDD5C4] text-[#5B564B] hover:bg-[#F7F1E4]'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`font-body px-4 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === 'month' 
                        ? 'bg-[#16302B] text-[#F7F1E4]' 
                        : 'bg-white border border-[#DDD5C4] text-[#5B564B] hover:bg-[#F7F1E4]'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRange('custom')}
                    className={`font-body px-4 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === 'custom' 
                        ? 'bg-[#16302B] text-[#F7F1E4]' 
                        : 'bg-white border border-[#DDD5C4] text-[#5B564B] hover:bg-[#F7F1E4]'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>

                {dateRange === 'custom' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-body block text-xs text-[#8A8377] mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg text-sm text-[#2A2622] focus:border-[#C9A468] focus:outline-none focus:ring-1 focus:ring-[#C9A468]"
                      />
                    </div>
                    <div>
                      <label className="font-body block text-xs text-[#8A8377] mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg text-sm text-[#2A2622] focus:border-[#C9A468] focus:outline-none focus:ring-1 focus:ring-[#C9A468]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sales Logs */}
            {(logType === 'all' || logType === 'sales') && sales && sales.length > 0 && (
              <div className="mb-8">
                <h3 className="font-body font-semibold text-[#2A2622] mb-4 flex items-center gap-2">
                  <ShoppingCartIcon className="h-5 w-5 text-[#C9A468]" />
                  Bar/Restaurant Sales
                </h3>
                <div className="space-y-3">
                  {sales.map((sale: any) => (
                    <div key={sale.id} className="bg-[#F7F1E4] rounded-lg p-4 border border-[#DDD5C4] hover:border-[#C9A468] transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-body text-xs font-medium px-2 py-1 bg-[#DDD5C4] text-[#5B564B] rounded-full">
                              {sale.payment_method}
                            </span>
                            <span className="font-body text-xs text-[#8A8377]">{sale.transaction_number}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-body text-[#8A8377]">Guest</p>
                              <p className="font-body font-medium text-[#2A2622]">{sale.guest_name || 'Walk-in'}</p>
                            </div>
                            <div>
                              <p className="font-body text-[#8A8377]">Items</p>
                              <p className="font-body font-medium text-[#2A2622]">{sale.items?.length || 0} items</p>
                            </div>
                          </div>
                          {sale.items && sale.items.length > 0 && (
                            <div className="mt-2 font-body text-xs text-[#8A8377]">
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
                          <p className="font-display text-xl font-medium text-[#16302B]">₦{sale.total_amount.toLocaleString()}</p>
                          <p className="font-body text-xs text-[#8A8377]">
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
                <h3 className="font-body font-semibold text-[#2A2622] mb-4 flex items-center gap-2">
                  <HomeModernIcon className="h-5 w-5 text-[#10B981]" />
                  Room Bookings
                </h3>
                <div className="space-y-3">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="bg-[#D1FAE5] rounded-lg p-4 border border-[#6EE7B7] hover:border-[#10B981] transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-body text-xs font-medium px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-[#D1FAE5] text-[#065F46]' :
                              booking.status === 'checked_in' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                              booking.status === 'checked_out' ? 'bg-[#F7F1E4] text-[#8A8377]' :
                              'bg-[#FEF2F2] text-[#991B1B]'
                            }`}>
                              {booking.status}
                            </span>
                            <span className="font-body text-xs text-[#8A8377]">{booking.booking_reference}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-body text-[#8A8377]">Guest</p>
                              <p className="font-body font-medium text-[#2A2622]">{booking.guest?.first_name} {booking.guest?.last_name}</p>
                            </div>
                            <div>
                              <p className="font-body text-[#8A8377]">Room</p>
                              <p className="font-body font-medium text-[#2A2622]">{booking.room?.room_number}</p>
                            </div>
                          </div>
                          <div className="mt-2 font-body text-xs text-[#8A8377]">
                            Check-in: {format(new Date(booking.check_in), 'MMM dd')} - 
                            Check-out: {format(new Date(booking.check_out), 'MMM dd')}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-medium text-[#065F46]">₦{booking.total_amount.toLocaleString()}</p>
                          <p className="font-body text-xs text-[#8A8377]">
                            {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data */}
            {(!sales?.length && !bookings?.length && !activities?.length) && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-3" />
                <p className="font-body text-[#8A8377]">No logs found for the selected period</p>
                <p className="font-body text-sm text-[#8A8377] mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="h-8 w-8 text-[#EF4444]" />
                </div>
                <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Staff Member</h3>
                <p className="font-body text-[#5B564B]">
                  Are you sure you want to delete <span className="font-semibold text-[#2A2622]">{staff.full_name}</span>?
                </p>
                <p className="font-body text-sm text-[#8A8377] mt-2">This action cannot be undone.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteStaff.isPending}
                  className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 disabled:opacity-50"
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