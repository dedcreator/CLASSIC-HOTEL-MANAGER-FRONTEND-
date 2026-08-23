// frontend/app/menu/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  QueueListIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  EyeIcon,
  DocumentTextIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useOrders, useUpdateOrderStatus } from '@/lib/api/hooks/useMenu';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  table: string;
  table_number: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  status_display: string;
  placed_at: string;
  notes?: string;
  special_instructions?: string;
}

const statusColors = {
  pending: 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]',
  preparing: 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]',
  ready: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
  served: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
  paid: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
  cancelled: 'bg-[#FCE4EC] text-[#C62828] border-[#EF9A9A]',
};

const statusIcons = {
  pending: <ClockIcon className="h-4 w-4" />,
  preparing: <BoltIcon className="h-4 w-4" />,
  ready: <CheckCircleIcon className="h-4 w-4" />,
  served: <CheckCircleIcon className="h-4 w-4" />,
  paid: <CheckCircleIcon className="h-4 w-4" />,
  cancelled: <XCircleIcon className="h-4 w-4" />,
};

export default function OrderManagementPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const { data: orders, isLoading, refetch } = useOrders(filter !== 'all' ? { status: filter } : {});
  const updateOrderStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const getFilteredOrders = () => {
    if (!orders) return [];
    if (filter === 'all') return orders;
    return orders.filter((order: Order) => order.status === filter);
  };

  const filteredOrders = getFilteredOrders();

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Order Management</h1>
              <p className="font-body text-sm text-[#8A8377]">Track and manage customer orders</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="font-body px-4 py-2 bg-[#F7F1E4] text-[#5B564B] rounded-lg hover:bg-[#DDD5C4] transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 border-b border-[#DDD5C4] pb-4">
            {['all', 'pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`font-body px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-[#16302B] text-[#F7F1E4]'
                    : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({orders?.filter((o: Order) => o.status === status).length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-[#DDD5C4] rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-[#F7F1E4] rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-3/4"></div>
                </div>
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white border border-[#DDD5C4] rounded-xl">
                <QueueListIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
                <p className="font-body text-[#8A8377]">No orders found</p>
                <p className="font-body text-sm text-[#8A8377]">Orders will appear here once customers place them</p>
              </div>
            ) : (
              filteredOrders.map((order: Order) => (
                <div key={order.id} className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-display font-medium text-[#2A2622]">
                          {order.order_number}
                        </h3>
                        <p className="font-body text-sm text-[#8A8377] flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          Table {order.table_number}
                          {order.customer_name && (
                            <>
                              <span className="text-[#DDD5C4]">|</span>
                              <UserIcon className="h-3 w-3" />
                              {order.customer_name}
                            </>
                          )}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${statusColors[order.status]}`}>
                        {statusIcons[order.status]}
                        <span className="font-body text-xs font-medium">{order.status_display}</span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      {order.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-body text-sm">
                          <span className="text-[#5B564B]">{item.item_name} x{item.quantity}</span>
                          <span className="font-medium text-[#16302B]">₦{item.subtotal?.toLocaleString()}</span>
                        </div>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <p className="font-body text-xs text-[#8A8377]">+{order.items.length - 3} more items</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[#F7F1E4]">
                      <div>
                        <p className="font-body text-xs text-[#8A8377]">Total</p>
                        <p className="font-display text-lg font-medium text-[#16302B]">
                          ₦{order.total_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                          className="font-body p-2 text-[#8A8377] hover:text-[#16302B] transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {order.status !== 'paid' && order.status !== 'cancelled' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="font-body text-sm border border-[#DDD5C4] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A468]"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="served">Served</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {order.special_instructions && (
                        <span className="font-body text-xs bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full">
                          📝 Special instructions
                        </span>
                      )}
                      {order.notes && (
                        <span className="font-body text-xs bg-[#F7F1E4] text-[#5B564B] px-2 py-0.5 rounded-full">
                          📋 Notes
                        </span>
                      )}
                      <span className="font-body text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded-full">
                        {new Date(order.placed_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl">
              <div>
                <h2 className="font-display text-lg font-medium">Order Details</h2>
                <p className="font-body text-sm text-[#B9C4B9]">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }} className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F7F1E4] rounded-lg p-3">
                  <p className="font-body text-xs text-[#8A8377]">Table</p>
                  <p className="font-body font-medium text-[#2A2622]">Table {selectedOrder.table_number}</p>
                </div>
                <div className="bg-[#F7F1E4] rounded-lg p-3">
                  <p className="font-body text-xs text-[#8A8377]">Status</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${statusColors[selectedOrder.status]}`}>
                    {statusIcons[selectedOrder.status]}
                    <span className="font-body text-xs font-medium">{selectedOrder.status_display}</span>
                  </div>
                </div>
                {selectedOrder.customer_name && (
                  <div className="bg-[#F7F1E4] rounded-lg p-3">
                    <p className="font-body text-xs text-[#8A8377]">Customer</p>
                    <p className="font-body font-medium text-[#2A2622]">{selectedOrder.customer_name}</p>
                  </div>
                )}
                <div className="bg-[#F7F1E4] rounded-lg p-3">
                  <p className="font-body text-xs text-[#8A8377]">Placed</p>
                  <p className="font-body font-medium text-[#2A2622]">
                    {new Date(selectedOrder.placed_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-body font-medium text-[#2A2622] mb-3">Items</h4>
                <div className="bg-[#FAF6EF] rounded-lg border border-[#DDD5C4] overflow-hidden">
                  <table className="w-full divide-y divide-[#DDD5C4]">
                    <thead className="bg-[#F7F1E4]">
                      <tr>
                        <th className="px-4 py-2 text-left font-body text-xs font-medium text-[#8A8377]">Item</th>
                        <th className="px-4 py-2 text-center font-body text-xs font-medium text-[#8A8377]">Qty</th>
                        <th className="px-4 py-2 text-right font-body text-xs font-medium text-[#8A8377]">Price</th>
                        <th className="px-4 py-2 text-right font-body text-xs font-medium text-[#8A8377]">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7F1E4]">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#F7F1E4] transition-colors">
                          <td className="px-4 py-2 font-body text-sm text-[#2A2622]">{item.item_name}</td>
                          <td className="px-4 py-2 font-body text-sm text-center text-[#5B564B]">{item.quantity}</td>
                          <td className="px-4 py-2 font-body text-sm text-right text-[#5B564B]">₦{item.unit_price?.toLocaleString()}</td>
                          <td className="px-4 py-2 font-body text-sm text-right font-medium text-[#16302B]">₦{item.subtotal?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#F7F1E4]">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-body text-sm font-medium text-[#2A2622]">Subtotal</td>
                        <td className="px-4 py-2 text-right font-body text-sm text-[#5B564B]">₦{selectedOrder.subtotal?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-body text-sm font-medium text-[#2A2622]">Tax</td>
                        <td className="px-4 py-2 text-right font-body text-sm text-[#5B564B]">₦{selectedOrder.tax?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-display font-medium text-[#2A2622]">Total</td>
                        <td className="px-4 py-2 text-right font-display font-medium text-[#16302B]">₦{selectedOrder.total_amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div className="bg-[#FFF3E0] rounded-lg p-3 border border-[#FFCC80]">
                  <p className="font-body text-sm font-medium text-[#E65100]">Special Instructions</p>
                  <p className="font-body text-sm text-[#5B564B]">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="bg-[#F7F1E4] rounded-lg p-3 border border-[#DDD5C4]">
                  <p className="font-body text-sm font-medium text-[#2A2622]">Notes</p>
                  <p className="font-body text-sm text-[#5B564B]">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }}
                  className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                >
                  Close
                </button>
                {selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => {
                        const nextStatus = selectedOrder.status === 'pending' ? 'preparing' :
                                         selectedOrder.status === 'preparing' ? 'ready' :
                                         selectedOrder.status === 'ready' ? 'served' : 'served';
                        handleStatusUpdate(selectedOrder.id, nextStatus);
                      }}
                      className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors"
                    >
                      Update Status
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}