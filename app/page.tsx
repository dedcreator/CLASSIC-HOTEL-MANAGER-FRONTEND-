// frontend/pages/index.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  CurrencyDollarIcon,
  HomeIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useProducts, useAlerts } from '@/lib/api/hooks/useProducts';
import { useSales, useTodaySales, useRevenueReport } from '@/lib/api/hooks/useSales';
import { useBookings, useTodayBookings, useBookingStats } from '@/lib/api/hooks/useBookings';
import { useRooms } from '@/lib/api/hooks/useRooms';
import Link from 'next/link';

const COLORS = {
  primary: '#E53E3E',
  secondary: '#C53030',
  dark: '#1A1A1A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  
  // Fetch real data
  const { data: products } = useProducts({});
  const { data: alerts } = useAlerts({ resolved: false });
  const { data: sales } = useSales();
  const { data: todaySales } = useTodaySales();
  const { data: revenueReport } = useRevenueReport(dateRange === 'week' ? 'weekly' : 'monthly');
  const { data: bookings } = useBookings({});
  const { data: rooms } = useRooms({});
  const { data: todayBookings } = useTodayBookings();
  const { data: bookingStats } = useBookingStats();

  // Process revenue data for chart
  useEffect(() => {
    if (revenueReport && revenueReport.length > 0) {
      // Format revenue data for chart
      const formattedData = revenueReport.map((item: any) => ({
        name: item.name || item.month || item.week || item.date,
        revenue: Number(item.revenue) || 0,
        profit: Number(item.profit) || 0,
        expenses: Number(item.expenses) || 0,
        transactions: Number(item.transactions) || 0
      }));
      setRevenueData(formattedData);
    } else {
      setRevenueData([]);
    }
  }, [revenueReport]);

  // Calculate real stats
  const totalProducts = products?.length || 0;
  const lowStockCount = alerts?.length || 0;
  
  // Today's revenue
  const todayRevenue = todaySales?.summary?.total_sales || 0;
  const todayTransactions = todaySales?.summary?.count || 0;
  
  // Calculate room stats
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter((r: any) => r.status === 'available').length || 0;
  const occupiedRooms = rooms?.filter((r: any) => r.status === 'occupied').length || 0;
  const maintenanceRooms = rooms?.filter((r: any) => r.status === 'maintenance').length || 0;
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Calculate booking stats
  const totalBookings = bookings?.length || 0;
  const activeGuests = bookings?.filter((b: any) => b.status === 'checked_in').length || 0;
  const todayArrivals = todayBookings?.arrivals?.length || 0;
  const todayDepartures = todayBookings?.departures?.length || 0;

  // Calculate bar sales (actual from sales data)
  const barSales = sales?.filter((s: any) => s.payment_method === 'cash' || s.payment_method === 'card')
    .reduce((sum: number, s: any) => sum + s.total_amount, 0) || 0;

  // Calculate total revenue (all time)
  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + s.total_amount, 0) || 0;

  // Stats cards with real data
  const stats = [
    {
      name: "Today's Revenue",
      value: `₦${Number(todayRevenue).toLocaleString()}`,
      change: todayTransactions > 0 ? `${todayTransactions} transactions` : 'No sales yet',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      link: '/sales',
    },
    {
      name: 'Active Guests',
      value: activeGuests.toString(),
      change: `${todayArrivals} arrivals, ${todayDepartures} departures`,
      icon: UserGroupIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/bookings',
    },
    {
      name: 'Room Occupancy',
      value: `${occupiedRooms}/${totalRooms}`,
      change: `${occupancyRate}% occupied`,
      icon: HomeIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      link: '/rooms',
    },
    {
      name: 'Low Stock Items',
      value: lowStockCount.toString(),
      change: lowStockCount > 0 ? 'Needs attention' : 'All good',
      icon: ExclamationTriangleIcon,
      iconBg: lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100',
      iconColor: lowStockCount > 0 ? 'text-red-600' : 'text-green-600',
      link: '/inventory?filter=low-stock',
    },
  ];

  // Recent activity combining sales and bookings
  const recentActivity = [
    ...(sales?.slice(0, 3).map((sale: any) => ({
      id: `sale-${sale.id}`,
      time: new Date(sale.created_at).toLocaleTimeString(),
      action: 'Sale',
      type: 'sale',
      guest: sale.guest_name || 'Bar Customer',
      amount: `₦${Number(sale.total_amount).toLocaleString()}`,
      link: `/sales/${sale.id}`,
    })) || []),
    ...(bookings?.slice(0, 3).map((booking: any) => ({
      id: `booking-${booking.id}`,
      time: new Date(booking.created_at).toLocaleTimeString(),
      action: booking.status === 'checked_in' ? 'Check-in' : 'Booking',
      type: 'booking',
      guest: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim() || 'Guest',
      amount: `Room ${booking.room?.room_number || 'N/A'}`,
      link: `/bookings/${booking.id}`,
    })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Room type distribution for pie chart
  const roomTypeData = rooms?.reduce((acc: any[], room: any) => {
    const existing = acc.find(item => item.name === room.room_type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: room.room_type === 'standard' ? 'Standard' : 'Duplex',
        value: 1,
        color: room.room_type === 'standard' ? COLORS.primary : COLORS.purple,
      });
    }
    return acc;
  }, []) || [];

  // Revenue by payment method
  const paymentMethodData = sales?.reduce((acc: any[], sale: any) => {
    const existing = acc.find(item => item.name === sale.payment_method);
    if (existing) {
      existing.value += sale.total_amount;
    } else {
      acc.push({
        name: sale.payment_method || 'cash',
        value: sale.total_amount,
        color: sale.payment_method === 'cash' ? COLORS.primary : 
               sale.payment_method === 'card' ? COLORS.purple : COLORS.success
      });
    }
    return acc;
  }, []) || [];

  return (
    <ProtectedRoute>
      <Layout>
        {/* Header with Welcome Message */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-dark-500">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === 'week'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === 'month'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockCount > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                <span className="font-semibold">{lowStockCount} product{lowStockCount > 1 ? 's' : ''}</span> {lowStockCount > 1 ? 'are' : 'is'} running low on stock.
                <Link href="/inventory?filter=low-stock" className="ml-2 text-red-600 font-semibold hover:underline">
                  View now →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-red-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`${stat.iconBg} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.name === 'Low Stock Items' && lowStockCount > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{stat.name}</p>
              <p className="text-xl font-bold text-dark-500">{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-500">Revenue Overview</h2>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-gray-600">Profit</span>
                </div>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length > 0 ? revenueData : [{ name: 'No Data', revenue: 0, profit: 0 }]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E53E3E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: ValueType) => {
                      const numValue = typeof value === 'number' ? value : 0;
                      return [`₦${numValue.toLocaleString()}`, ''];
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E53E3E" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {revenueData.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-2">No revenue data available</p>
            )}
          </div>

          {/* Room Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Room Distribution</h2>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData.length > 0 ? roomTypeData : [{ name: 'No Rooms', value: 1, color: '#E2E8F0' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <span className="text-gray-600">Available</span>
                </div>
                <span className="font-medium">{availableRooms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-600"></span>
                  <span className="text-gray-600">Occupied</span>
                </div>
                <span className="font-medium">{occupiedRooms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                  <span className="text-gray-600">Maintenance</span>
                </div>
                <span className="font-medium">{maintenanceRooms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Today's Schedule and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-1">
            <TodaySchedule />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCartIcon className="h-6 w-6 text-red-100" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Today</span>
              </div>
              <p className="text-2xl font-bold mb-1">₦{Number(todayRevenue).toLocaleString()}</p>
              <p className="text-xs text-red-100">Total Sales</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">{todayTransactions} transactions</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="h-6 w-6 text-blue-100" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-2xl font-bold mb-1">{activeGuests}</p>
              <p className="text-xs text-blue-100">Checked-in Guests</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">{todayArrivals} arrivals</span>
                <span className="bg-white/20 px-2 py-1 rounded">{todayDepartures} departures</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <HomeIcon className="h-6 w-6 text-purple-100" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rooms</span>
              </div>
              <p className="text-2xl font-bold mb-1">{occupiedRooms}/{totalRooms}</p>
              <p className="text-xs text-purple-100">Occupied</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">{occupancyRate}% occupancy</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <SparklesIcon className="h-6 w-6 text-amber-100" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Inventory</span>
              </div>
              <p className="text-2xl font-bold mb-1">{totalProducts}</p>
              <p className="text-xs text-amber-100">Total Products</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">{lowStockCount} low stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-500">Recent Activity</h2>
            <Link href="/activity" className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All
            </Link>
          </div>
          
          {/* Activity Timeline */}
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.link}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'sale' ? '💰' : '📅'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-500">{activity.guest}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            activity.action === 'Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {activity.action}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{activity.amount}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
          <div className="grid grid-cols-4 gap-2">
            <Link
              href="/sales"
              className="flex flex-col items-center p-2 text-red-600"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="text-xs mt-1">POS</span>
            </Link>
            <Link
              href="/inventory"
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <CurrencyDollarIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Inventory</span>
            </Link>
            <Link
              href="/rooms"
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Rooms</span>
            </Link>
            <Link
              href="/bookings"
              className="flex flex-col items-center p-2 text-gray-600"
            >
              <UserGroupIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Bookings</span>
            </Link>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}