'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderType {
  _id: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  pickupTime?: string;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{ name: string; price: string; quantity: number }>;
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  createdAt: string;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (name) {
    case 'arrow-left':
      return (
        <svg {...common}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'coffee':
      return (
        <svg {...common}>
          <path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
          <path d="M17 10h2a2 2 0 1 1 0 4h-2M8 4c-2 2 2 2 0 4m5-4c-2 2 2 2 0 4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000); // Poll live orders every 6 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, newPaymentStatus?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus }) 
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchOrders();
      } else {
        alert(`Failed to update order status: ${json.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status');
    }
  };

  const ongoingOrders = orders.filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const historyOrders = orders.filter((o) => ['Completed', 'Cancelled'].includes(o.status));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Completed':
        return 'bg-[#EAE1D3] text-[#77695C] border-[#E4D9CB]';
      default:
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#30251E] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-[#E9E0D5] rounded-[28px] p-6 sm:p-8 shadow-sm gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-md">
              <Icon name="coffee" size={24} />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
                Live Dispatch Logbook
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30251E]">
                Kitchen Orders Dashboard
              </h1>
            </div>
          </div>
          
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#77695C] hover:text-[#30251E] bg-[#FAF7F2] border border-[#E4D9CB] px-4 py-2.5 rounded-xl transition"
          >
            <Icon name="arrow-left" size={16} /> Menu Admin
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E9E0D5] space-x-6">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'ongoing'
                ? 'border-[#30251E] text-[#30251E]'
                : 'border-transparent text-[#77695C] hover:text-[#30251E]'
            }`}
          >
            Ongoing Orders ({ongoingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'history'
                ? 'border-[#30251E] text-[#30251E]'
                : 'border-transparent text-[#77695C] hover:text-[#30251E]'
            }`}
          >
            Order History ({historyOrders.length})
          </button>
        </div>

        {/* Orders Display */}
        {loading ? (
          <div className="text-center py-20 text-xs font-bold text-[#77695C]">Loading incoming orders...</div>
        ) : (activeTab === 'ongoing' ? ongoingOrders : historyOrders).length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E9E0D5] rounded-[28px]">
            <p className="text-xs font-semibold text-[#77695C]">No {activeTab} orders found at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'ongoing' ? ongoingOrders : historyOrders).map((order) => (
              <div
                key={order._id}
                className="bg-white border border-[#E9E0D5] rounded-[28px] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#A17B50] transition"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-[#F0EAE2] pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#A17B50] font-bold">#{order._id.slice(-6)}</span>
                      <h3 className="text-sm font-extrabold text-[#30251E]">{order.customerName}</h3>
                      <p className="text-xs text-[#77695C] font-medium">{order.customerPhone}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-[#77695C]">
                    <p className="flex justify-between">
                      <span>Method:</span>
                      <strong className="text-[#30251E]">{order.orderType === 'In-Shop QR' ? 'Dine-In' : order.orderType}</strong>
                    </p>
                    {order.pickupTime && (
                      <p className="flex justify-between">
                        <span>Pickup Time:</span>
                        <strong className="text-[#30251E]">{order.pickupTime}</strong>
                      </p>
                    )}
                    {order.deliveryAddress && (
                      <div className="pt-1">
                        <span className="block text-[10px] uppercase font-bold text-[#A17B50]">Delivery Address:</span>
                        <p className="text-xs text-[#30251E] font-medium leading-relaxed">{order.deliveryAddress}</p>
                      </div>
                    )}
                    <p className="flex justify-between pt-1 border-t border-[#F0EAE2]">
                      <span>Payment:</span>
                      <strong className="text-[#30251E]">{order.paymentMethod} ({order.paymentStatus})</strong>
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="font-semibold text-[#30251E]">{item.name} <span className="text-[#A17B50]">x{item.quantity}</span></span>
                        <span className="text-[#77695C] font-bold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F0EAE2] pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#77695C]">Total Amount</span>
                    <span className="text-base font-black text-[#A17B50]">
                      LKR {order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Status Action Buttons */}
                  {activeTab === 'ongoing' && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Preparing')}
                          className="w-full py-3 bg-[#30251E] hover:bg-[#49372B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Icon name="coffee" size={16} /> Start Preparing
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Ready')}
                          className="w-full py-3 bg-[#A17B50] hover:bg-[#8c6740] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Icon name="clock" size={16} /> Mark as Ready
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Completed', 'Paid')}
                          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Icon name="check" size={16} /> Complete & Move to History
                        </button>
                      )}

                      <button
                        onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                        className="w-full py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}