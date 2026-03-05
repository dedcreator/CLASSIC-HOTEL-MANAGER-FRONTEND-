// frontend/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  DocumentArrowDownIcon,
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
import { useRevenueReport, useTopProducts, useInventoryReport, useStaffPerformance } from '@/lib/api/hooks/useReports';
import { exportToPDF, exportToExcel } from '@/lib/utils/pdfExport';

const COLORS = ['#E53E3E', '#C53030', '#9B2C2C', '#742A2A', '#4A1E1E'];

const reportTypes = [
  { id: 'revenue', name: 'Revenue Report', icon: CurrencyDollarIcon, color: 'bg-green-100 text-green-600' },
  { id: 'products', name: 'Product Performance', icon: BeakerIcon, color: 'bg-blue-100 text-blue-600' },
  { id: 'inventory', name: 'Inventory Status', icon: ShoppingCartIcon, color: 'bg-purple-100 text-purple-600' },
  { id: 'staff', name: 'Staff Performance', icon: UserGroupIcon, color: 'bg-amber-100 text-amber-600' },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch real data
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(selectedPeriod);
  const { data: topProducts } = useTopProducts(5);
  const { data: inventoryReport } = useInventoryReport();
  const { data: staffData } = useStaffPerformance(
    selectedPeriod === 'daily' || selectedPeriod === 'weekly' ? 'weekly' : 'monthly'
  );

  // Log data to see what we're getting
  useEffect(() => {
    console.log('Revenue Data:', revenueData);
    console.log('Top Products:', topProducts);
    console.log('Inventory Report:', inventoryReport);
    console.log('Staff Data:', staffData);
  }, [revenueData, topProducts, inventoryReport, staffData]);

  // Extract product data correctly from API response
  const productByQuantity = topProducts?.by_quantity || [];
  const productByRevenue = topProducts?.by_revenue || [];

  // Extract inventory data with fallbacks
  const inventorySummary = inventoryReport?.summary || {
    total_products: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_value: 0,
  };
  
  const categoryData = inventoryReport?.by_category || [];

  // Format category data for pie chart
  const pieChartData = categoryData.map((item: any) => ({
    name: item.category,
    value: item.stock,
  }));

  // Format revenue data
  const revenueChartData = Array.isArray(revenueData) ? revenueData : [];

  // Format staff data
  const formattedStaffData = Array.isArray(staffData) ? staffData : [];

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    
    try {
      let data: any[] = [];
      let columns: { header: string; dataKey: string }[] = [];
      let title = '';
      
      // Prepare data based on selected report
      switch (selectedReport) {
        case 'revenue':
          title = 'Revenue Report';
          data = revenueChartData;
          columns = [
            { header: 'Period', dataKey: 'name' },
            { header: 'Revenue (₦)', dataKey: 'revenue' },
            { header: 'Expenses (₦)', dataKey: 'expenses' },
            { header: 'Profit (₦)', dataKey: 'profit' },
            { header: 'Transactions', dataKey: 'transactions' },
          ];
          break;
          
        case 'products':
          title = 'Product Performance';
          data = productByRevenue;
          columns = [
            { header: 'Product', dataKey: 'name' },
            { header: 'Sales', dataKey: 'sales' },
            { header: 'Revenue (₦)', dataKey: 'revenue' },
          ];
          break;
          
        case 'inventory':
          title = 'Inventory Report';
          data = categoryData;
          columns = [
            { header: 'Category', dataKey: 'category' },
            { header: 'Stock', dataKey: 'stock' },
            { header: 'Value (₦)', dataKey: 'value' },
          ];
          break;
          
        case 'staff':
          title = 'Staff Performance';
          data = formattedStaffData;
          columns = [
            { header: 'Staff', dataKey: 'name' },
            { header: 'Role', dataKey: 'role' },
            { header: 'Transactions', dataKey: 'transactions' },
            { header: 'Revenue (₦)', dataKey: 'revenue' },
            { header: 'Avg Sale (₦)', dataKey: 'avg_sale' },
          ];
          break;
      }
      
      if (format === 'pdf') {
        exportToPDF({ title, period: selectedPeriod, data, columns });
      } else {
        exportToExcel({ title, period: selectedPeriod, data, columns });
      }
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-500">Reports & Analytics</h1>
            <p className="text-sm text-gray-600">View insights and export reports</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${selectedReport === type.id
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-red-300 bg-white'
                }
              `}
            >
              <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mb-2`}>
                <type.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-dark-500">{type.name}</h3>
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedPeriod === period
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        {selectedReport === 'revenue' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Revenue Overview</h2>
            
            {revenueChartData.length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
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
                        formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#E53E3E" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                      <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-dark-500">
                      ₦{revenueChartData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      ₦{revenueChartData.reduce((sum: number, item: any) => sum + (item.profit || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                    <p className="text-xl font-bold text-blue-600">
                      {revenueChartData.reduce((sum: number, item: any) => sum + (item.transactions || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No revenue data available for this period</p>
                  <p className="text-sm mt-2">Try selecting a different period or adding some sales</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Performance */}
        {selectedReport === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products by Sales (Quantity) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Top Products by Sales</h2>
              {productByQuantity.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productByQuantity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Bar dataKey="sales" fill="#E53E3E" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No sales data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Products by Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Top Products by Revenue</h2>
              {productByRevenue.length > 0 ? (
                <div className="space-y-3">
                  {productByRevenue.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full bg-red-${(index + 1) * 100} text-white text-xs flex items-center justify-center font-medium`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-dark-500">{product.name}</span>
                      </div>
                      <span className="font-semibold text-green-600">₦{product.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No revenue data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory Report */}
        {selectedReport === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock by Category Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Stock by Category</h2>
              {pieChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </div>

            {/* Inventory Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-dark-500 mb-4">Inventory Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Products</span>
                  <span className="text-xl font-bold text-dark-500">{inventorySummary.total_products}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Low Stock Items</span>
                  <span className="text-xl font-bold text-yellow-600">{inventorySummary.low_stock}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Out of Stock</span>
                  <span className="text-xl font-bold text-red-600">{inventorySummary.out_of_stock}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Value</span>
                  <span className="text-xl font-bold text-green-600">₦{inventorySummary.total_value?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Performance */}
        {selectedReport === 'staff' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">Staff Performance</h2>
            
            {formattedStaffData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Sale</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formattedStaffData.map((staff: any, index: number) => (
                      <tr key={staff.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-500">{staff.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{staff.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{staff.transactions}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">₦{staff.revenue?.toLocaleString() || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦{staff.avg_sale?.toLocaleString() || staff.avg?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No staff performance data available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}