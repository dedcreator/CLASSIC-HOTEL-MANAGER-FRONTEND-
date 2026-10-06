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
  ExclamationTriangleIcon, 
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  Legend,
} from 'recharts';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useProducts, useAlerts } from '@/lib/api/hooks/useProducts';
import { useSales, useTodaySales, useRevenueReport } from '@/lib/api/hooks/useSales';
import { useBookings, useTodayBookings, useBookingStats } from '@/lib/api/hooks/useBookings';
import { useRooms } from '@/lib/api/hooks/useRooms';
import Link from 'next/link';

// Hotel-branded color palette
const HOTEL_COLORS = {
  primary: '#16302B',    // Deep forest green
  primaryLight: '#1D3B34',
  gold: '#C9A468',
  goldHover: '#B8905B',
  cream: '#FAF6EF',
  creamLight: '#F7F1E4',
  textDark: '#2A2622',
  textMuted: '#8A8377',
  border: '#DDD5C4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

// Chart colors with hotel theme
const CHART_COLORS = {
  revenue: '#16302B',
  profit: '#C9A468',
  available: '#10B981',
  occupied: '#16302B',
  maintenance: '#F59E0B',
  standard: '#C9A468',
  duplex: '#16302B',
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  
  // Fetch real data
  const { data: products } = useProducts({});
  const { data: alerts } = useAlerts({ resolved: false });
  const { data: sales } = useSales();
  const { data: todaySales, refetch: refetchTodaySales } = useTodaySales();
  const { data: revenueReport } = useRevenueReport(dateRange === 'week' ? 'weekly' : 'monthly');
  const { data: bookings } = useBookings({});
  const { data: rooms } = useRooms({});
  const { data: todayBookings, refetch: refetchTodayBookings } = useTodayBookings();
  const { data: bookingStats } = useBookingStats();

  // Refetch data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTodaySales();
      refetchTodayBookings();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchTodaySales, refetchTodayBookings]);

  // Process revenue data
  useEffect(() => {
    if (revenueReport && revenueReport.length > 0) {
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

  // Calculate stats
  const totalProducts = products?.length || 0;
  const lowStockCount = alerts?.length || 0;
  const todayRevenue = todaySales?.summary?.total_sales || 0;
  const todayTransactions = todaySales?.summary?.count || 0;
  
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter((r: any) => r.status === 'available').length || 0;
  const occupiedRooms = rooms?.filter((r: any) => r.status === 'occupied').length || 0;
  const maintenanceRooms = rooms?.filter((r: any) => r.status === 'maintenance').length || 0;
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const activeGuests = bookings?.filter((b: any) => b.status === 'checked_in').length || 0;
  const todayArrivals = todayBookings?.arrivals?.length || 0;
  const todayDepartures = todayBookings?.departures?.length || 0;
  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + s.total_amount, 0) || 0;

  // Stats cards with hotel styling
  const stats = [
    {
      name: "Today's Revenue",
      value: `₦${Number(todayRevenue).toLocaleString()}`,
      change: todayTransactions > 0 ? `${todayTransactions} transactions` : 'No sales yet',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-[#F7F1E4]',
      iconColor: 'text-[#16302B]',
      link: '/sales',
      trend: todayRevenue > 0 ? 'up' : 'neutral',
    },
    {
      name: 'Active Guests',
      value: activeGuests.toString(),
      change: `${todayArrivals} arrivals, ${todayDepartures} departures`,
      icon: UserGroupIcon,
      iconBg: 'bg-[#F7F1E4]',
      iconColor: 'text-[#16302B]',
      link: '/bookings',
      trend: 'neutral',
    },
    {
      name: 'Room Occupancy',
      value: `${occupiedRooms}/${totalRooms}`,
      change: `${occupancyRate}% occupied`,
      icon: HomeIcon,
      iconBg: 'bg-[#F7F1E4]',
      iconColor: 'text-[#16302B]',
      link: '/rooms',
      trend: occupancyRate > 70 ? 'up' : occupancyRate > 30 ? 'neutral' : 'down',
    },
    {
      name: 'Low Stock Items',
      value: lowStockCount.toString(),
      change: lowStockCount > 0 ? 'Needs attention' : 'All good',
      icon: ExclamationTriangleIcon,
      iconBg: lowStockCount > 0 ? 'bg-[#FEF2F2]' : 'bg-[#F7F1E4]',
      iconColor: lowStockCount > 0 ? 'text-[#EF4444]' : 'text-[#16302B]',
      link: '/inventory?filter=low-stock',
      trend: lowStockCount > 0 ? 'down' : 'up',
    },
  ];

  // Room distribution for pie chart
  const roomTypeData = rooms?.reduce((acc: any[], room: any) => {
    const existing = acc.find(item => item.name === room.room_type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: room.room_type === 'standard' ? 'Standard' : 'Duplex',
        value: 1,
        color: room.room_type === 'standard' ? CHART_COLORS.standard : CHART_COLORS.duplex,
      });
    }
    return acc;
  }, []) || [];

  // Room status data
  const roomStatusData = [
    { name: 'Available', value: availableRooms, color: CHART_COLORS.available },
    { name: 'Occupied', value: occupiedRooms, color: CHART_COLORS.occupied },
    { name: 'Maintenance', value: maintenanceRooms, color: CHART_COLORS.maintenance },
  ].filter(item => item.value > 0);

  return (
    <ProtectedRoute>
      <Layout>
        {/* Elegant Header */}
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
              </h1>
              <p className="font-body text-sm text-[#8A8377] mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Date Range Selector - Hotel Style */}
            <div className="flex bg-[#F7F1E4] rounded-lg border border-[#DDD5C4] p-1">
              <button
                onClick={() => setDateRange('week')}
                className={`font-body px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  dateRange === 'week'
                    ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                    : 'text-[#8A8377] hover:bg-white/50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`font-body px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  dateRange === 'month'
                    ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                    : 'text-[#8A8377] hover:bg-white/50'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Alert - Hotel Style */}
        {lowStockCount > 0 && (
          <div className="mb-6 bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-[#EF4444]" />
              <p className="font-body text-sm text-[#991B1B]">
                <span className="font-semibold">{lowStockCount} product{lowStockCount > 1 ? 's' : ''}</span> 
                {' '}{lowStockCount > 1 ? 'are' : 'is'} running low on stock.
              </p>
            </div>
            <Link 
              href="/inventory?filter=low-stock" 
              className="font-body text-sm font-medium text-[#16302B] hover:text-[#1D3B34] underline decoration-[#C9A468] underline-offset-4 transition-colors"
            >
              View now →
            </Link>
          </div>
        )}

        {/* Stats Grid - Hotel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.link}
              className="group bg-white rounded-lg border border-[#DDD5C4] p-5 hover:border-[#C9A468] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`${stat.iconBg} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className={`font-body text-xs px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-[#D1FAE5] text-[#065F46]' :
                  stat.trend === 'down' ? 'bg-[#FEF2F2] text-[#991B1B]' :
                  'bg-[#F7F1E4] text-[#8A8377]'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="font-body text-xs text-[#8A8377] mt-3">{stat.name}</p>
              <p className="font-display text-2xl font-medium text-[#2A2622] mt-1">{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - Hotel Style */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#DDD5C4] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-[#2A2622]">Revenue Overview</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16302B]"></span>
                  <span className="font-body text-[#8A8377]">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C9A468]"></span>
                  <span className="font-body text-[#8A8377]">Profit</span>
                </div>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length > 0 ? revenueData : [{ name: 'No Data', revenue: 0, profit: 0 }]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16302B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#16302B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A468" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C9A468" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F7F1E4" />
                  <XAxis dataKey="name" stroke="#8A8377" />
                  <YAxis stroke="#8A8377" />
                  <Tooltip 
                    formatter={(value: any) => {
                      const numValue = typeof value === 'number' ? value : 0;
                      return [`₦${numValue.toLocaleString()}`, ''];
                    }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDD5C4',
                      borderRadius: '6px',
                      fontFamily: "'Work Sans', sans-serif",
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#16302B" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#C9A468" 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {revenueData.length === 0 && (
              <p className="font-body text-center text-[#8A8377] text-sm mt-2">No revenue data available</p>
            )}
          </div>

          {/* Room Distribution - Hotel Style */}
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-5">
            <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4">Room Distribution</h2>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData.length > 0 ? roomTypeData : [{ name: 'No Rooms', value: 1, color: '#DDD5C4' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#DDD5C4'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDD5C4',
                      borderRadius: '6px',
                      fontFamily: "'Work Sans', sans-serif",
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value) => (
                      <span className="font-body text-sm text-[#5B564B]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row - Today's Schedule and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-1">
            <TodaySchedule />
          </div>

          {/* Quick Stats - Hotel Gradient Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-[#16302B] to-[#1D3B34] rounded-lg p-5 text-[#F7F1E4]">
              <div className="flex items-center justify-between mb-3">
                <ShoppingCartIcon className="h-6 w-6 text-[#C9A468]" />
                <span className="font-body text-xs bg-[#C9A468]/20 text-[#C9A468] px-2.5 py-1 rounded-full">
                  Today
                </span>
              </div>
              <p className="font-display text-2xl font-medium mb-1">₦{Number(todayRevenue).toLocaleString()}</p>
              <p className="font-body text-sm text-[#B9C4B9]">Total Sales</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-body text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  {todayTransactions} transactions
                </span>
              </div>
            </div>

            {/* Guests Card */}
            <div className="bg-gradient-to-br from-[#C9A468] to-[#B8905B] rounded-lg p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <UserGroupIcon className="h-6 w-6 text-[#F7F1E4]" />
                <span className="font-body text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="font-display text-2xl font-medium mb-1">{activeGuests}</p>
              <p className="font-body text-sm text-[#F7F1E4]/80">Checked-in Guests</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-body text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  {todayArrivals} arrivals
                </span>
                <span className="font-body text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  {todayDepartures} departures
                </span>
              </div>
            </div>

            {/* Rooms Card */}
            <div className="bg-gradient-to-br from-[#2A2622] to-[#3D3630] rounded-lg p-5 text-[#F7F1E4]">
              <div className="flex items-center justify-between mb-3">
                <HomeIcon className="h-6 w-6 text-[#C9A468]" />
                <span className="font-body text-xs bg-[#C9A468]/20 text-[#C9A468] px-2.5 py-1 rounded-full">
                  Rooms
                </span>
              </div>
              <p className="font-display text-2xl font-medium mb-1">{occupiedRooms}/{totalRooms}</p>
              <p className="font-body text-sm text-[#B9C4B9]">Occupied</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-body text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  {occupancyRate}% occupancy
                </span>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="bg-gradient-to-br from-[#F7F1E4] to-[#E8DDCC] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <SparklesIcon className="h-6 w-6 text-[#16302B]" />
                <span className="font-body text-xs bg-[#16302B]/10 text-[#16302B] px-2.5 py-1 rounded-full">
                  Inventory
                </span>
              </div>
              <p className="font-display text-2xl font-medium text-[#2A2622] mb-1">{totalProducts}</p>
              <p className="font-body text-sm text-[#8A8377]">Total Products</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`font-body text-xs px-2.5 py-1 rounded-full ${
                  lowStockCount > 0 
                    ? 'bg-[#EF4444]/10 text-[#EF4444]' 
                    : 'bg-[#10B981]/10 text-[#065F46]'
                }`}>
                  {lowStockCount > 0 ? `${lowStockCount} low stock` : 'All stocked'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}