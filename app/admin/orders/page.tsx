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
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ongoingOrders = orders.filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const historyOrders = orders.filter((o) => ['Completed', 'Cancelled'].includes(o.status));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'Preparing':
        return 'bg-blue-950/80 text-blue-400 border-blue-800 animate-pulse';
      case 'Ready':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800 font-bold';
      case 'Completed':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      default:
        return 'bg-red-950/80 text-red-400 border-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="flex justify-between items-center bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white">⚙️ Live Orders & Status Dashboard</h1>
            <p className="text-xs text-[#A39284] mt-1">
              Process customer orders in real-time. Status changes instantly alert customer notification bells.
            </p>
          </div>
          
          <Link
            href="/admin"
            className="text-xs font-bold text-[#A39284] hover:text-white border border-[#2E221B] px-4 py-2 rounded-xl transition"
          >
            ← Back to Menu Admin
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2E221B] space-x-4">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'ongoing'
                ? 'border-[#D2A072] text-[#D2A072]'
                : 'border-transparent text-[#A39284] hover:text-white'
            }`}
          >
            Ongoing Orders ({ongoingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'history'
                ? 'border-[#D2A072] text-[#D2A072]'
                : 'border-transparent text-[#A39284] hover:text-white'
            }`}
          >
            Order History ({historyOrders.length})
          </button>
        </div>

        {/* Orders Display */}
        {loading ? (
          <div className="text-center py-20 text-xs text-[#A39284]">Loading orders...</div>
        ) : (activeTab === 'ongoing' ? ongoingOrders : historyOrders).length === 0 ? (
          <div className="text-center py-20 bg-[#1C1410] border border-[#2E221B] rounded-2xl">
            <p className="text-xs text-[#A39284]">No {activeTab} orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'ongoing' ? ongoingOrders : historyOrders).map((order) => (
              <div
                key={order._id}
                className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#D2A072]/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-[#2E221B] pb-3">
                    <div>
                      <span className="text-[10px] text-[#A39284] uppercase font-mono">#{order._id.slice(-6)}</span>
                      <h3 className="text-sm font-bold text-white">{order.customerName}</h3>
                      <p className="text-[11px] text-[#D2A072]">{order.customerPhone}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-[#A39284]">
                    <p>Method: <span className="text-white font-semibold">{order.orderType}</span></p>
                    {order.pickupTime && <p>Pickup Time: <span className="text-white font-semibold">{order.pickupTime}</span></p>}
                    {order.deliveryAddress && <p>Address: <span className="text-white font-semibold">{order.deliveryAddress}</span></p>}
                    <p>Payment: <span className="text-white font-semibold">{order.paymentMethod}</span> ({order.paymentStatus})</p>
                  </div>

                  {/* Items List */}
                  <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-3 space-y-1.5 max-h-32 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-white">{item.name} x{item.quantity}</span>
                        <span className="text-[#A39284]">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#2E221B] pt-3 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A39284]">Total Amount</span>
                    <span className="text-sm font-black text-[#D2A072]">LKR {order.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Status Action Buttons */}
                  {activeTab === 'ongoing' && (
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Preparing')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-md"
                        >
                          ☕ Start Preparing
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Ready')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md"
                        >
                          🎉 Mark as Ready
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Completed', 'Paid')}
                          className="w-full py-2 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-black text-xs rounded-xl transition shadow-lg"
                        >
                          ✅ Complete & Archive
                        </button>
                      )}

                      <button
                        onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                        className="w-full py-1.5 bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 font-semibold text-[11px] rounded-xl transition"
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