'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderType {
  _id: string;
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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('brew_customer');
    if (!savedCustomer) {
      window.location.href = '/customer-login';
      return;
    }

    const parsedCustomer = JSON.parse(savedCustomer);
    setCustomer(parsedCustomer);
    fetchCustomerOrders(parsedCustomer.phone);

    // Auto-refresh order statuses every 10 seconds
    const interval = setInterval(() => {
      fetchCustomerOrders(parsedCustomer.phone);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchCustomerOrders = async (phone: string) => {
    try {
      const res = await fetch(`/api/customer/orders?phone=${phone}`);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      case 'Preparing':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/60 animate-pulse';
      case 'Ready':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 font-bold';
      case 'Completed':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      default:
        return 'bg-red-950/60 text-red-400 border-red-800/60';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] p-6 md:p-12 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#1C1410] border border-[#2E221B] rounded-2xl px-6 py-4 shadow-xl">
          <div>
            <h1 className="text-xl font-black text-white">📋 My Active Orders</h1>
            <p className="text-xs text-[#A39284]">
              Tracking for <span className="text-[#D2A072] font-bold">{customer?.name}</span> ({customer?.phone})
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-[#A39284] hover:text-white border border-[#2E221B] px-3 py-1.5 rounded-xl transition"
          >
            ← Menu
          </Link>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20 text-xs text-[#A39284]">Loading your order status...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-[#1C1410] border border-[#2E221B] rounded-2xl">
            <p className="text-xs text-[#A39284] mb-4">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="px-4 py-2 bg-[#D2A072] text-[#120B08] font-bold text-xs rounded-xl"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-5 shadow-lg space-y-4"
              >
                {/* Status Bar */}
                <div className="flex justify-between items-center border-b border-[#2E221B]/60 pb-3">
                  <div>
                    <span className="text-[10px] text-[#A39284] block">ORDER ID</span>
                    <span className="text-xs font-bold text-white uppercase">#{order._id.slice(-6)}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] border ${getStatusBadge(order.status)}`}
                  >
                    {order.status === 'Preparing' ? '☕ Preparing...' : order.status === 'Ready' ? '🎉 Ready for Pickup!' : order.status}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-white font-medium">{item.name} x{item.quantity}</span>
                      <span className="text-[#A39284]">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Details Footer */}
                <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[#A39284] text-[10px]">Method: <span className="text-white font-semibold">{order.orderType}</span></p>
                    {order.pickupTime && <p className="text-[#A39284] text-[10px]">Pickup: <span className="text-white font-semibold">{order.pickupTime}</span></p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[#A39284] text-[10px]">Total</p>
                    <p className="text-[#D2A072] font-black text-sm">LKR {order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}