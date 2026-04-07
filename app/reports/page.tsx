// frontend/app/reports/page.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/layout/Layout';
import { useSales } from '@/lib/api/hooks/useSales';
import { useBookings } from '@/lib/api/hooks/useBookings';
import { useExpenses, useExpenseSummary } from '@/lib/api/hooks/useExpenses';
import { useStaff } from '@/lib/api/hooks/useStaff';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const COLORS = {
  primary: '#E53E3E',
  secondary: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  dark: '#1A1A1A',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.info, COLORS.purple, COLORS.pink, COLORS.cyan];

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all';

interface DateRange {
  start: Date;
  end: Date;
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function ReportsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [excludeVAT, setExcludeVAT] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<'revenue' | 'profit' | 'expenses'>('revenue');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: sales } = useSales({});
  const { data: bookings } = useBookings({});
  const { data: expenses } = useExpenses({});
  const { data: expenseSummary } = useExpenseSummary();
  const { data: staff } = useStaff();

  const VAT_RATE = 0.075;

  const calculateAmount = (amount: any): number => {
    const safeAmount = safeNumber(amount);
    if (excludeVAT) {
      return safeAmount / (1 + VAT_RATE);
    }
    return safeAmount;
  };

  const getDateRange = (): DateRange => {
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday': {
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      }
      case 'last7':
        return { start: subDays(now, 7), end: now };
      case 'last30':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { start: lastMonth, end: new Date(now.getFullYear(), now.getMonth(), 0) };
      }
      case 'thisYear':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      case 'all':
        return { start: new Date(2020, 0, 1), end: now };
      default:
        return customDateRange;
    }
  };

  const dateRange = getDateRange();

  const filterByDateRange = (date: string) => {
    if (!date) return false;
    const itemDate = new Date(date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  };

  const filteredSales = sales?.filter((s) => s && filterByDateRange(s.created_at)) || [];
  const filteredBookings = bookings?.filter((b) => b && filterByDateRange(b.created_at)) || [];
  const filteredExpenses = expenses?.filter((e) => e && filterByDateRange(e.expense_date)) || [];

  // Combine and paginate transactions
  const allTransactions = useMemo(() => {
    const salesTrans = filteredSales.map((s) => ({ ...s, type: 'sale' }));
    const bookingsTrans = filteredBookings.map((b) => ({ ...b, type: 'booking' }));
    return [...salesTrans, ...bookingsTrans].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredSales, filteredBookings]);

  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const paginatedTransactions = allTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = useMemo(() => {
    let totalSales = 0;
    let totalBookings = 0;
    let totalExpenses = 0;
    let salesCount = 0;
    let bookingsCount = 0;

    filteredSales.forEach((sale) => {
      totalSales += calculateAmount(sale?.total_amount);
      salesCount++;
    });

    filteredBookings.forEach((booking) => {
      totalBookings += calculateAmount(booking?.total_amount);
      bookingsCount++;
    });

    filteredExpenses.forEach((expense) => {
      totalExpenses += safeNumber(expense?.amount);
    });

    const grossRevenue = totalSales + totalBookings;
    const netProfit = grossRevenue - totalExpenses;
    const dayCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalSales,
      totalBookings,
      totalExpenses,
      grossRevenue,
      netProfit,
      salesCount,
      bookingsCount,
      expensesCount: filteredExpenses.length,
      profitMargin: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0,
      averageDailyRevenue: grossRevenue / dayCount,
    };
  }, [filteredSales, filteredBookings, filteredExpenses, excludeVAT, dateRange]);

  const dailyData = useMemo(() => {
    const days: Record<string, { sales: number; bookings: number; expenses: number; date: string }> = {};
    let currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      days[dateKey] = { sales: 0, bookings: 0, expenses: 0, date: format(currentDate, 'MMM dd') };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    filteredSales.forEach((sale) => {
      if (sale?.created_at) {
        const dateKey = format(new Date(sale.created_at), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].sales += calculateAmount(sale.total_amount);
        }
      }
    });

    filteredBookings.forEach((booking) => {
      if (booking?.created_at) {
        const dateKey = format(new Date(booking.created_at), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].bookings += calculateAmount(booking.total_amount);
        }
      }
    });

    filteredExpenses.forEach((expense) => {
      if (expense?.expense_date) {
        const dateKey = format(new Date(expense.expense_date), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].expenses += safeNumber(expense.amount);
        }
      }
    });

    return Object.values(days).map((day) => ({
      ...day,
      revenue: day.sales + day.bookings,
      profit: day.sales + day.bookings - day.expenses,
    }));
  }, [filteredSales, filteredBookings, filteredExpenses, excludeVAT, dateRange]);

  const staffPerformance = useMemo(() => {
    const performance: Record<string, { sales: number; bookings: number; name: string; role: string }> = {};

    filteredSales.forEach((sale) => {
      const staffId = sale?.staff;
      if (staffId) {
        if (!performance[staffId]) {
          const staffMember = staff?.find((s) => s?.id === staffId);
          performance[staffId] = {
            sales: 0,
            bookings: 0,
            name: staffMember?.full_name || staffMember?.username || 'Unknown',
            role: staffMember?.role || 'Unknown',
          };
        }
        performance[staffId].sales += calculateAmount(sale?.total_amount);
      }
    });

    filteredBookings.forEach((booking) => {
      const staffId = booking?.created_by;
      if (staffId) {
        if (!performance[staffId]) {
          const staffMember = staff?.find((s) => s?.id === staffId);
          performance[staffId] = {
            sales: 0,
            bookings: 0,
            name: staffMember?.full_name || staffMember?.username || 'Unknown',
            role: staffMember?.role || 'Unknown',
          };
        }
        performance[staffId].bookings += calculateAmount(booking?.total_amount);
      }
    });

    return Object.entries(performance)
      .map(([id, data]) => ({
        id,
        ...data,
        total: data.sales + data.bookings,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredSales, filteredBookings, staff, excludeVAT]);

  const salesByMethod = useMemo(() => {
    const methods: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const method = sale?.payment_method || 'cash';
      methods[method] = (methods[method] || 0) + calculateAmount(sale?.total_amount);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [filteredSales, excludeVAT]);

  const expensesByCategory = expenseSummary?.by_category || [];

  const topProducts = useMemo(() => {
    const products: Record<string, { name: string; revenue: number; quantity: number }> = {};

    filteredSales.forEach((sale) => {
      if (sale?.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const productName = item?.product_name || item?.product?.name;
          if (productName) {
            if (!products[productName]) {
              products[productName] = { name: productName, revenue: 0, quantity: 0 };
            }
            const itemTotal = item?.subtotal || (item?.quantity * item?.unit_price);
            products[productName].revenue += calculateAmount(itemTotal);
            products[productName].quantity += safeNumber(item?.quantity);
          }
        });
      }
    });

    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales, excludeVAT]);

  const chartData = dailyData.map((day) => ({
    name: day.date,
    revenue: day.revenue,
    profit: day.profit,
    expenses: day.expenses,
    sales: day.sales,
    bookings: day.bookings,
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let csvContent = 'Date,Type,Reference,Amount (₦),Category,Payment Method,Status,Staff\n';

      filteredSales.forEach((sale) => {
        csvContent += `${sale?.created_at || ''},Sale,${sale?.transaction_number || ''},${calculateAmount(sale?.total_amount).toFixed(2)},N/A,${sale?.payment_method || ''},Completed,${sale?.staff_name || 'N/A'}\n`;
      });

      filteredBookings.forEach((booking) => {
        csvContent += `${booking?.created_at || ''},Booking,${booking?.booking_reference || ''},${calculateAmount(booking?.total_amount).toFixed(2)},Room ${booking?.room?.room_number || 'N/A'},${booking?.payment_method || 'N/A'},${booking?.status || ''},${booking?.created_by_name || 'N/A'}\n`;
      });

      filteredExpenses.forEach((expense) => {
        csvContent += `${expense?.expense_date || ''},Expense,${expense?.expense_number || ''},${safeNumber(expense?.amount).toFixed(2)},${expense?.category_name || expense?.category || 'N/A'},${expense?.payment_method || ''},-,\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const datePresetLabels: Record<DatePreset, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 Days',
    last30: 'Last 30 Days',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    all: 'All Time',
  };

  const getChartColor = () => {
    if (selectedChartMetric === 'revenue') return COLORS.primary;
    if (selectedChartMetric === 'profit') return COLORS.secondary;
    return COLORS.warning;
  };

  const getChartTitle = () => {
    if (selectedChartMetric === 'revenue') return 'Revenue Trend';
    if (selectedChartMetric === 'profit') return 'Profit Trend';
    return 'Expenses Trend';
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-500">Financial Reports</h1>
            <p className="text-sm text-gray-600">Comprehensive business analytics and insights</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="flex flex-wrap gap-1">
              {(['today', 'yesterday', 'last7', 'last30', 'thisMonth', 'lastMonth', 'thisYear', 'all'] as DatePreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setDatePreset(preset);
                    setShowCustomPicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    datePreset === preset && !showCustomPicker
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {datePresetLabels[preset]}
                </button>
              ))}
              <button
                onClick={() => {
                  setDatePreset('all');
                  setShowCustomPicker(!showCustomPicker);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  showCustomPicker ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Custom
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">VAT (7.5%):</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setExcludeVAT(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${!excludeVAT ? 'bg-red-600 text-white' : 'text-gray-700'}`}
                >
                  Include
                </button>
                <button
                  onClick={() => setExcludeVAT(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${excludeVAT ? 'bg-red-600 text-white' : 'text-gray-700'}`}
                >
                  Exclude
                </button>
              </div>
            </div>
          </div>

          {showCustomPicker && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={format(customDateRange.start, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setDatePreset('all');
                    setCustomDateRange({ ...customDateRange, start: new Date(e.target.value) });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={format(customDateRange.end, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setDatePreset('all');
                    setCustomDateRange({ ...customDateRange, end: new Date(e.target.value) });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button onClick={() => setShowCustomPicker(false)} className="px-3 py-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₦{Math.round(totals.grossRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{totals.salesCount + totals.bookingsCount} transactions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Net Profit</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${(totals.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{Math.round(totals.netProfit || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Margin: {totals.profitMargin.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Avg Daily Revenue</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">₦{Math.round(totals.averageDailyRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">per day</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-600">₦{Math.round(totals.totalExpenses || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{totals.expensesCount} expenses</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedChartMetric('revenue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChartMetric === 'revenue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedChartMetric('profit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChartMetric === 'profit' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Profit
          </button>
          <button
            onClick={() => setSelectedChartMetric('expenses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChartMetric === 'expenses' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
        </div>

        {/* Main Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-500">{getChartTitle()}</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChartColor() }}></span>
              <span className="text-xs text-gray-600">{getChartTitle()}</span>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={Math.floor(chartData.length / 10)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedChartMetric}
                  stroke={getChartColor()}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  name={selectedChartMetric === 'revenue' ? 'Revenue' : selectedChartMetric === 'profit' ? 'Profit' : 'Expenses'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Revenue Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill={COLORS.primary} />
                  <Bar dataKey="bookings" name="Bookings" fill={COLORS.info} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Sales by Payment Method</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {salesByMethod.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4">Top 10 Products by Revenue</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center">{index + 1}</div>
                    <div>
                      <p className="font-medium text-dark-500">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">₦{Math.round(product.revenue || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No product data available</p>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4">Expenses by Category</h2>
          {expensesByCategory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="total"
                      label={({ category_name, percent }) => `${category_name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {expensesByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {expensesByCategory.map((category, index) => (
                  <div key={category.category_id} className="flex justify-between items-center p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-sm text-gray-700">{category.category_name}</span>
                    </div>
                    <span className="text-sm font-medium">₦{Math.round(category.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No expense data available</p>
            </div>
          )}
        </div>

        {/* Staff Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark-500 flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                Staff Performance
              </h2>
              <p className="text-xs text-gray-500">Ranked by total revenue generated</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales (₦)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bookings (₦)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (₦)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffPerformance.map((staffMember, index) => {
                  const maxTotal = staffPerformance[0]?.total || 1;
                  const percentage = ((staffMember.total || 0) / maxTotal) * 100;
                  return (
                    <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{staffMember.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{staffMember.role?.toLowerCase()}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">₦{Math.round(staffMember.sales || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-blue-600 font-medium">₦{Math.round(staffMember.bookings || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-600">₦{Math.round(staffMember.total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 rounded-full h-2 transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions with Pagination */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-dark-500">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((item: any, idx) => {
                  const isSale = item.type === 'sale';
                  const amount = calculateAmount(item?.total_amount);
                  const guestName = isSale ? item?.guest_name : `${item?.guest?.first_name || ''} ${item?.guest?.last_name || ''}`.trim();
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {item?.created_at ? format(new Date(item.created_at), 'dd MMM yyyy HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isSale ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isSale ? 'Sale' : 'Booking'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {isSale ? item?.transaction_number : item?.booking_reference}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600 whitespace-nowrap">
                        ₦{Math.round(amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {isSale ? item?.staff_name : item?.created_by_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {guestName || 'Walk-in Guest'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {isSale 
                          ? `${item?.items?.length || 0} items`
                          : `Room ${item?.room?.room_number || 'N/A'}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}