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
import { useOrders } from '@/lib/api/hooks/useMenu';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import DateRangePicker from './components/DateRangePicker';

const COLORS = {
  primary: '#16302B',
  secondary: '#10B981',
  gold: '#C9A468',
  goldHover: '#B8905B',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  cream: '#F7F1E4',
  dark: '#2A2622',
  muted: '#8A8377',
  border: '#DDD5C4',
};

const PIE_COLORS = [COLORS.primary, COLORS.gold, COLORS.secondary, COLORS.info, COLORS.purple, COLORS.pink, COLORS.cyan];

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all' | 'custom';

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
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [excludeVAT, setExcludeVAT] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<'revenue' | 'profit' | 'expenses'>('revenue');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all data
  const { data: sales } = useSales({});
  const { data: bookings } = useBookings({});
  const { data: expenses } = useExpenses({});
  const { data: expenseSummary } = useExpenseSummary();
  const { data: staff } = useStaff();
  const { data: orders } = useOrders({});

  const VAT_RATE = 0.075;

  const handleDateRangeChange = (range: DateRange, preset?: DatePreset) => {
    setDateRange(range);
    if (preset) {
      setDatePreset(preset);
    }
  };

  const calculateAmount = (amount: any): number => {
    const safeAmount = safeNumber(amount);
    if (excludeVAT) {
      return safeAmount / (1 + VAT_RATE);
    }
    return safeAmount;
  };

  const filterByDateRange = (date: string) => {
    if (!date) return false;
    const itemDate = new Date(date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  };

  const filteredSales = sales?.filter((s: any) => s && filterByDateRange(s.created_at)) || [];
  const filteredBookings = bookings?.filter((b: any) => b && filterByDateRange(b.created_at)) || [];
  const filteredExpenses = expenses?.filter((e: any) => e && filterByDateRange(e.expense_date)) || [];
  const filteredOrders = orders?.filter((o: any) => o && filterByDateRange(o.placed_at)) || [];

  const allTransactions = useMemo(() => {
    const salesTrans = filteredSales.map((s: any) => ({ ...s, type: 'sale' }));
    const bookingsTrans = filteredBookings.map((b: any) => ({ ...b, type: 'booking' }));
    const ordersTrans = filteredOrders.map((o: any) => ({ ...o, type: 'order' }));
    return [...salesTrans, ...bookingsTrans, ...ordersTrans].sort(
      (a, b) => new Date(b.created_at || b.placed_at).getTime() - new Date(a.created_at || a.placed_at).getTime()
    );
  }, [filteredSales, filteredBookings, filteredOrders]);

  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const paginatedTransactions = allTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = useMemo(() => {
    let totalSales = 0;
    let totalBookings = 0;
    let totalOrders = 0;
    let totalExpenses = 0;
    let salesCount = 0;
    let bookingsCount = 0;
    let ordersCount = 0;

    filteredSales.forEach((sale: any) => {
      totalSales += calculateAmount(sale?.total_amount);
      salesCount++;
    });

    filteredBookings.forEach((booking: any) => {
      totalBookings += calculateAmount(booking?.total_amount);
      bookingsCount++;
    });

    filteredOrders.forEach((order: any) => {
      totalOrders += calculateAmount(order?.total_amount);
      ordersCount++;
    });

    filteredExpenses.forEach((expense: any) => {
      totalExpenses += safeNumber(expense?.amount);
    });

    const grossRevenue = totalSales + totalBookings + totalOrders;
    const netProfit = grossRevenue - totalExpenses;
    const dayCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalSales,
      totalBookings,
      totalOrders,
      totalExpenses,
      grossRevenue,
      netProfit,
      salesCount,
      bookingsCount,
      ordersCount,
      expensesCount: filteredExpenses.length,
      profitMargin: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0,
      averageDailyRevenue: grossRevenue / dayCount,
    };
  }, [filteredSales, filteredBookings, filteredOrders, filteredExpenses, excludeVAT, dateRange]);

  const dailyData = useMemo(() => {
    const days: Record<string, { sales: number; bookings: number; orders: number; expenses: number; date: string }> = {};
    let currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      days[dateKey] = { sales: 0, bookings: 0, orders: 0, expenses: 0, date: format(currentDate, 'MMM dd') };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    filteredSales.forEach((sale: any) => {
      if (sale?.created_at) {
        const dateKey = format(new Date(sale.created_at), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].sales += calculateAmount(sale.total_amount);
        }
      }
    });

    filteredBookings.forEach((booking: any) => {
      if (booking?.created_at) {
        const dateKey = format(new Date(booking.created_at), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].bookings += calculateAmount(booking.total_amount);
        }
      }
    });

    filteredOrders.forEach((order: any) => {
      if (order?.placed_at) {
        const dateKey = format(new Date(order.placed_at), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].orders += calculateAmount(order.total_amount);
        }
      }
    });

    filteredExpenses.forEach((expense: any) => {
      if (expense?.expense_date) {
        const dateKey = format(new Date(expense.expense_date), 'yyyy-MM-dd');
        if (days[dateKey]) {
          days[dateKey].expenses += safeNumber(expense.amount);
        }
      }
    });

    return Object.values(days).map((day) => ({
      ...day,
      revenue: day.sales + day.bookings + day.orders,
      profit: day.sales + day.bookings + day.orders - day.expenses,
    }));
  }, [filteredSales, filteredBookings, filteredOrders, filteredExpenses, excludeVAT, dateRange]);

  const staffPerformance = useMemo(() => {
    const performance: Record<string, { sales: number; bookings: number; orders: number; name: string; role: string }> = {};

    filteredSales.forEach((sale: any) => {
      const staffId = sale?.staff || sale?.created_by;
      if (staffId) {
        if (!performance[staffId]) {
          const staffMember = staff?.find((s: any) => s?.id === staffId);
          performance[staffId] = {
            sales: 0,
            bookings: 0,
            orders: 0,
            name: staffMember?.full_name || staffMember?.username || 'Unknown',
            role: staffMember?.role || 'Unknown',
          };
        }
        performance[staffId].sales += calculateAmount(sale?.total_amount);
      }
    });

    filteredBookings.forEach((booking: any) => {
      const staffId = booking?.created_by;
      if (staffId) {
        if (!performance[staffId]) {
          const staffMember = staff?.find((s: any) => s?.id === staffId);
          performance[staffId] = {
            sales: 0,
            bookings: 0,
            orders: 0,
            name: staffMember?.full_name || staffMember?.username || 'Unknown',
            role: staffMember?.role || 'Unknown',
          };
        }
        performance[staffId].bookings += calculateAmount(booking?.total_amount);
      }
    });

    filteredOrders.forEach((order: any) => {
      const staffId = order?.created_by;
      if (staffId) {
        if (!performance[staffId]) {
          const staffMember = staff?.find((s: any) => s?.id === staffId);
          performance[staffId] = {
            sales: 0,
            bookings: 0,
            orders: 0,
            name: staffMember?.full_name || staffMember?.username || 'Unknown',
            role: staffMember?.role || 'Unknown',
          };
        }
        performance[staffId].orders += calculateAmount(order?.total_amount);
      }
    });

    return Object.entries(performance)
      .map(([id, data]) => ({
        id,
        ...data,
        total: data.sales + data.bookings + data.orders,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredSales, filteredBookings, filteredOrders, staff, excludeVAT]);

  const salesByMethod = useMemo(() => {
    const methods: Record<string, number> = {};
    filteredSales.forEach((sale: any) => {
      const method = sale?.payment_method || 'cash';
      methods[method] = (methods[method] || 0) + calculateAmount(sale?.total_amount);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [filteredSales, excludeVAT]);

  const expensesByCategory = expenseSummary?.by_category || [];

  const topProducts = useMemo(() => {
    const products: Record<string, { name: string; revenue: number; quantity: number; source: string }> = {};

    // POS Sales Products
    filteredSales.forEach((sale: any) => {
      if (sale?.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const productName = item?.product_name || item?.product?.name || 'Unknown';
          if (!products[productName]) {
            products[productName] = { name: productName, revenue: 0, quantity: 0, source: 'POS' };
          }
          const itemTotal = item?.subtotal || (item?.quantity * item?.unit_price);
          products[productName].revenue += calculateAmount(itemTotal);
          products[productName].quantity += safeNumber(item?.quantity);
        });
      }
    });

    // Menu Orders Products
    filteredOrders.forEach((order: any) => {
      if (order?.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          const productName = item?.item_name || 'Unknown';
          if (!products[productName]) {
            products[productName] = { name: productName, revenue: 0, quantity: 0, source: 'Menu' };
          }
          products[productName].revenue += calculateAmount(item?.subtotal || 0);
          products[productName].quantity += safeNumber(item?.quantity);
        });
      }
    });

    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales, filteredOrders, excludeVAT]);

  const chartData = dailyData.map((day) => ({
    name: day.date,
    revenue: day.revenue,
    profit: day.profit,
    expenses: day.expenses,
    sales: day.sales,
    bookings: day.bookings,
    orders: day.orders,
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let csvContent = 'Date,Type,Reference,Amount (₦),Category,Payment Method,Status,Staff\n';

      filteredSales.forEach((sale: any) => {
        csvContent += `${sale?.created_at || ''},Sale,${sale?.transaction_number || ''},${calculateAmount(sale?.total_amount).toFixed(2)},N/A,${sale?.payment_method || ''},Completed,${sale?.staff_name || 'N/A'}\n`;
      });

      filteredBookings.forEach((booking: any) => {
        csvContent += `${booking?.created_at || ''},Booking,${booking?.booking_reference || ''},${calculateAmount(booking?.total_amount).toFixed(2)},Room ${booking?.room?.room_number || 'N/A'},${booking?.payment_method || 'N/A'},${booking?.status || ''},${booking?.created_by_name || 'N/A'}\n`;
      });

      filteredOrders.forEach((order: any) => {
        csvContent += `${order?.placed_at || ''},Menu Order,${order?.order_number || ''},${calculateAmount(order?.total_amount).toFixed(2)},Menu Items,${order?.payment_method || 'N/A'},${order?.status || ''},${order?.created_by_name || 'N/A'}\n`;
      });

      filteredExpenses.forEach((expense: any) => {
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
      <div className="space-y-4 sm:space-y-6 pb-20 px-3 sm:px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DDD5C4] pb-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-medium text-[#2A2622]">Financial Reports</h1>
            <p className="font-body text-xs sm:text-sm text-[#8A8377] mt-0.5">Comprehensive business analytics and insights</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              preset={datePreset}
              onPresetChange={setDatePreset}
            />
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="font-body inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* VAT Toggle */}
        <div className="flex items-center justify-end gap-2">
          <span className="font-body text-xs text-[#8A8377]">VAT (7.5%):</span>
          <div className="flex bg-[#F7F1E4] rounded-lg p-0.5">
            <button
              onClick={() => setExcludeVAT(false)}
              className={`font-body px-3 py-1 rounded-md text-xs font-medium transition-colors ${!excludeVAT ? 'bg-[#16302B] text-[#F7F1E4]' : 'text-[#5B564B]'}`}
            >
              Include
            </button>
            <button
              onClick={() => setExcludeVAT(true)}
              className={`font-body px-3 py-1 rounded-md text-xs font-medium transition-colors ${excludeVAT ? 'bg-[#16302B] text-[#F7F1E4]' : 'text-[#5B564B]'}`}
            >
              Exclude
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-3 sm:p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-[10px] sm:text-sm text-[#8A8377]">Total Revenue</p>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#F7F1E4] rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#16302B]" />
              </div>
            </div>
            <p className="font-display text-sm sm:text-2xl font-medium text-[#2A2622]">₦{Math.round(totals.grossRevenue || 0).toLocaleString()}</p>
            <p className="font-body text-[8px] sm:text-xs text-[#8A8377] mt-0.5">{totals.salesCount + totals.bookingsCount + totals.ordersCount} transactions</p>
          </div>

          <div className="bg-white rounded-lg border border-[#DDD5C4] p-3 sm:p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-[10px] sm:text-sm text-[#8A8377]">Net Profit</p>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#D1FAE5] rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#10B981]" />
              </div>
            </div>
            <p className={`font-display text-sm sm:text-2xl font-medium ${(totals.netProfit || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              ₦{Math.round(totals.netProfit || 0).toLocaleString()}
            </p>
            <p className="font-body text-[8px] sm:text-xs text-[#8A8377] mt-0.5">Margin: {totals.profitMargin.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-lg border border-[#DDD5C4] p-3 sm:p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-[10px] sm:text-sm text-[#8A8377]">Avg Daily Revenue</p>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#3B82F6]" />
              </div>
            </div>
            <p className="font-display text-sm sm:text-2xl font-medium text-[#3B82F6]">₦{Math.round(totals.averageDailyRevenue || 0).toLocaleString()}</p>
            <p className="font-body text-[8px] sm:text-xs text-[#8A8377] mt-0.5">per day</p>
          </div>

          <div className="bg-white rounded-lg border border-[#DDD5C4] p-3 sm:p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-[10px] sm:text-sm text-[#8A8377]">Total Expenses</p>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#F59E0B]" />
              </div>
            </div>
            <p className="font-display text-sm sm:text-2xl font-medium text-[#F59E0B]">₦{Math.round(totals.totalExpenses || 0).toLocaleString()}</p>
            <p className="font-body text-[8px] sm:text-xs text-[#8A8377] mt-0.5">{totals.expensesCount} expenses</p>
          </div>
        </div>

        {/* Revenue Breakdown by Source */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] mb-4">Revenue Breakdown by Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F7F1E4] rounded-lg p-4 text-center">
              <p className="font-body text-sm text-[#8A8377]">POS Sales</p>
              <p className="font-display text-2xl font-medium text-[#16302B]">₦{Math.round(totals.totalSales || 0).toLocaleString()}</p>
              <p className="font-body text-xs text-[#8A8377]">{totals.salesCount} transactions</p>
            </div>
            <div className="bg-[#F7F1E4] rounded-lg p-4 text-center">
              <p className="font-body text-sm text-[#8A8377]">Menu Orders</p>
              <p className="font-display text-2xl font-medium text-[#C9A468]">₦{Math.round(totals.totalOrders || 0).toLocaleString()}</p>
              <p className="font-body text-xs text-[#8A8377]">{totals.ordersCount} orders</p>
            </div>
            <div className="bg-[#F7F1E4] rounded-lg p-4 text-center">
              <p className="font-body text-sm text-[#8A8377]">Room Bookings</p>
              <p className="font-display text-2xl font-medium text-[#3B82F6]">₦{Math.round(totals.totalBookings || 0).toLocaleString()}</p>
              <p className="font-body text-xs text-[#8A8377]">{totals.bookingsCount} bookings</p>
            </div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedChartMetric('revenue')}
            className={`font-body px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              selectedChartMetric === 'revenue' ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedChartMetric('profit')}
            className={`font-body px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              selectedChartMetric === 'profit' ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
            }`}
          >
            Profit
          </button>
          <button
            onClick={() => setSelectedChartMetric('expenses')}
            className={`font-body px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              selectedChartMetric === 'expenses' ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
            }`}
          >
            Expenses
          </button>
        </div>

        {/* Main Revenue Chart */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622]">{getChartTitle()}</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChartColor() }}></span>
              <span className="font-body text-xs text-[#8A8377]">{getChartTitle()}</span>
            </div>
          </div>
          <div className="h-64 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F7F1E4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={Math.floor(chartData.length / 10)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #DDD5C4' }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] mb-4">Revenue Breakdown</h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F7F1E4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #DDD5C4' }}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="POS Sales" fill={COLORS.primary} />
                  <Bar dataKey="orders" name="Menu Orders" fill={COLORS.gold} />
                  <Bar dataKey="bookings" name="Bookings" fill={COLORS.info} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] mb-4">Sales by Payment Method</h2>
            <div className="h-64 sm:h-80">
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
                  <Tooltip 
                    formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #DDD5C4' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] mb-4">Top 10 Products by Revenue</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-2 sm:p-3 bg-[#F7F1E4] rounded-lg hover:bg-[#DDD5C4] transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center ${
                      index === 0 ? 'bg-[#C9A468] text-white' :
                      index === 1 ? 'bg-[#DDD5C4] text-[#2A2622]' :
                      index === 2 ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#F7F1E4] text-[#8A8377]'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-body text-sm sm:text-base font-medium text-[#2A2622]">{product.name}</p>
                      <p className="font-body text-[10px] sm:text-xs text-[#8A8377]">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <p className="font-body text-sm sm:text-base font-semibold text-[#16302B]">₦{Math.round(product.revenue || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-[#8A8377]">
              <ShoppingCartIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-[#DDD5C4] mb-2" />
              <p className="font-body">No product data available</p>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] mb-4">Expenses by Category</h2>
          {expensesByCategory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 sm:h-80">
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
                    <Tooltip 
                      formatter={(value: number) => [`₦${Math.round(value || 0).toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #DDD5C4' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {expensesByCategory.map((category, index) => (
                  <div key={category.category_id} className="flex justify-between items-center p-2 border-b border-[#F7F1E4]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="font-body text-sm text-[#5B564B]">{category.category_name}</span>
                    </div>
                    <span className="font-body text-sm font-medium text-[#2A2622]">₦{Math.round(category.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-[#8A8377]">
              <CurrencyDollarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-[#DDD5C4] mb-2" />
              <p className="font-body">No expense data available</p>
            </div>
          )}
        </div>

        {/* Staff Performance Table */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#DDD5C4] bg-[#F7F1E4]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622] flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#C9A468]" />
                Staff Performance
              </h2>
              <p className="font-body text-[10px] sm:text-xs text-[#8A8377]">Ranked by revenue</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#F7F1E4]">
              <thead className="bg-[#FAF6EF]">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Rank</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Staff</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Role</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Total</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase hidden sm:table-cell">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F1E4]">
                {staffPerformance.map((staffMember, index) => {
                  const maxTotal = staffPerformance[0]?.total || 1;
                  const percentage = ((staffMember.total || 0) / maxTotal) * 100;
                  return (
                    <tr key={staffMember.id} className="hover:bg-[#F7F1E4] transition-colors">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-body text-sm font-medium">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-body text-sm font-medium text-[#2A2622] truncate max-w-[80px] sm:max-w-none">
                        {staffMember.name}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-body text-xs sm:text-sm text-[#8A8377] capitalize truncate max-w-[60px] sm:max-w-none">
                        {staffMember.role?.toLowerCase()}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-body text-xs sm:text-sm text-right font-bold text-[#10B981]">
                        ₦{Math.round(staffMember.total || 0).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                        <div className="w-full bg-[#DDD5C4] rounded-full h-2">
                          <div 
                            className="bg-[#16302B] rounded-full h-2 transition-all duration-500" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#DDD5C4] bg-[#F7F1E4]">
            <h2 className="font-display text-base sm:text-lg font-medium text-[#2A2622]">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#F7F1E4]">
              <thead className="bg-[#FAF6EF]">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Date</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Type</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Ref</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase">Amount</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase hidden md:table-cell">Staff</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-body text-[10px] sm:text-xs font-medium text-[#8A8377] uppercase hidden lg:table-cell">Guest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F1E4]">
                {paginatedTransactions.slice(0, 5).map((item: any, idx) => {
                  const isSale = item.type === 'sale';
                  const isOrder = item.type === 'order';
                  const amount = calculateAmount(item?.total_amount);
                  const guestName = isSale ? item?.guest_name : 
                                   isOrder ? item?.customer_name : 
                                   `${item?.guest?.first_name || ''} ${item?.guest?.last_name || ''}`.trim();
                  const date = item?.created_at || item?.placed_at;
                  const ref = isSale ? item?.transaction_number : 
                             isOrder ? item?.order_number : 
                             item?.booking_reference;
                  const staffName = isSale ? item?.staff_name : 
                                   isOrder ? item?.created_by_name : 
                                   item?.created_by_name;
                  return (
                    <tr key={idx} className="hover:bg-[#F7F1E4] transition-colors">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-body text-[10px] sm:text-sm text-[#8A8377] whitespace-nowrap">
                        {date ? format(new Date(date), 'dd/MM/yy') : '-'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 font-body text-[8px] sm:text-xs font-medium rounded-full ${
                          isSale ? 'bg-[#D1FAE5] text-[#065F46]' : 
                          isOrder ? 'bg-[#FEF3C7] text-[#92400E]' : 
                          'bg-[#DBEAFE] text-[#1E40AF]'
                        }`}>
                          {isSale ? 'Sale' : isOrder ? 'Order' : 'Book'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-body text-[10px] sm:text-sm font-mono text-[#8A8377] truncate max-w-[60px] sm:max-w-none">
                        {ref?.slice(0, 8) || '-'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-body text-[10px] sm:text-sm font-semibold text-[#16302B] whitespace-nowrap">
                        ₦{Math.round(amount || 0).toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-body text-[10px] sm:text-sm text-[#8A8377] hidden md:table-cell truncate max-w-[60px]">
                        {staffName?.split(' ')[0] || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-body text-[10px] sm:text-sm text-[#8A8377] hidden lg:table-cell truncate max-w-[80px]">
                        {guestName ? guestName.split(' ')[0] : 'Walk-in'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#DDD5C4] bg-[#FAF6EF] flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="font-body px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-[#DDD5C4] rounded-md hover:bg-[#F7F1E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <span className="font-body text-xs sm:text-sm text-[#8A8377]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="font-body px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-[#DDD5C4] rounded-md hover:bg-[#F7F1E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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