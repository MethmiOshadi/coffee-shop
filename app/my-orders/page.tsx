'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface OrderType {
  _id: string;
  orderType: string;
  pickupTime?: string;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  createdAt: string;
}

interface CustomerType {
  name: string;
  phone: string;
}

const statusConfig = {
  Pending: {
    label: 'Order received',
    description: 'We have received your order and are getting things ready.',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    step: 1,
  },
  Preparing: {
    label: 'Brewing now',
    description: 'Our team is actively crafting your items.',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    step: 2,
  },
  Ready: {
    label: 'Ready for you!',
    description: 'Your order is ready. Come grab it or watch for delivery.',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    step: 3,
  },
  Completed: {
    label: 'Completed',
    description: 'Enjoy your favorite brew from Elephantpath!',
    dot: 'bg-stone-500',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    step: 4,
  },
  Cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-800 border-red-200',
    step: 0,
  },
};

function formatPrice(amount: number) {
  return `LKR ${Number(amount || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  if (!date) return 'Recently';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleTimeString('en-LK', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function OrderProgress({ status }: { status: OrderType['status'] }) {
  if (status === 'Cancelled') {
    return (
      <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700 font-medium">
        This order has been cancelled. Reach out to the shop if you have questions.
      </div>
    );
  }

  const steps = [
    { label: 'Received', number: 1 },
    { label: 'Brewing', number: 2 },
    { label: 'Ready', number: 3 },
    { label: 'Done', number: 4 },
  ];

  const currentStep = statusConfig[status].step;

  return (
    <div className="mt-6 pt-5 border-t border-[#F0EAE2]">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const complete = currentStep >= step.number;
          const active = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    complete
                      ? 'bg-[#30251E] text-[#D9BA91]'
                      : 'bg-[#F0EAE2] text-[#A69A8D]'
                  } ${active ? 'ring-4 ring-[#A17B50]/15' : ''}`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold tracking-wide ${
                    active ? 'text-[#30251E]' : 'text-[#A69A8D]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mb-4 mx-1 h-0.5 flex-1 ${
                    currentStep > step.number ? 'bg-[#30251E]' : 'bg-[#EAE2D8]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderType }) {
  const config = statusConfig[order.status] ?? statusConfig.Pending;

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E9E0D5] bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Top row: Status & Date */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#F0EAE2]">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-3 w-3 rounded-full ${config.dot}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-[#30251E]">
            {config.label}
          </span>
        </div>
        <span className="text-xs text-[#8C7A6B] font-medium">
          {formatDate(order.createdAt)}
        </span>
      </div>

      {/* Middle: Items summary */}
      <div className="py-4 space-y-2.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FAF7F2] font-bold text-[#A17B50] text-xs">
                {item.quantity}×
              </span>
              <span className="font-semibold text-[#30251E] truncate">{item.name}</span>
            </div>
            <span className="text-[#8C7A6B] font-medium whitespace-nowrap ml-4">
              {item.price}
            </span>
          </div>
        ))}
      </div>

      {/* Details Box: Type & Total */}
      <div className="rounded-xl bg-[#FAF7F2] p-4 flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[#8C7A6B] uppercase text-[10px] font-bold tracking-wider block">Fulfillment</span>
          <span className="font-bold text-[#30251E] mt-0.5 block">
            {order.orderType} {order.pickupTime ? `(${order.pickupTime})` : ''}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[#8C7A6B] uppercase text-[10px] font-bold tracking-wider block">Total Amount</span>
          <span className="text-sm font-black text-[#A17B50] mt-0.5 block">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Visual Step Tracker */}
      <OrderProgress status={order.status} />
    </article>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCustomerOrders = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(phone)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) {
        setOrders(Array.isArray(json.data) ? json.data : []);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('brew_customer');
    if (!savedCustomer) {
      window.location.href = '/customer-login';
      return;
    }

    try {
      const parsed = JSON.parse(savedCustomer) as CustomerType;
      if (!parsed.phone) {
        window.location.href = '/customer-login';
        return;
      }
      setCustomer(parsed);
      void fetchCustomerOrders(parsed.phone);

      // Auto poll every 10s for live updates
      const interval = window.setInterval(() => {
        void fetchCustomerOrders(parsed.phone);
      }, 10000);
      return () => window.clearInterval(interval);
    } catch {
      window.location.href = '/customer-login';
    }
  }, [fetchCustomerOrders]);

  return (
    <main className="min-h-screen bg-[#F8F5EF] text-[#30251E]">
      <header className="border-b border-[#E9E0D5] bg-[#F8F5EF]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-sm">
              <span className="text-lg">🐘</span>
            </span>
            <span className="text-sm font-black tracking-widest uppercase">Elephantpath</span>
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#E4D9CB] px-4 py-2 text-xs font-bold transition hover:bg-white"
          >
            ← Back to Menu
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
            Activity Hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">My Orders</h1>
          {customer && (
            <p className="text-xs text-[#77695C] mt-1">
              Signed in as <strong className="text-[#30251E]">{customer.name}</strong> ({customer.phone})
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4 py-12 text-center text-xs text-[#8C7A6B]">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-[#E9E0D5] bg-white p-8 text-center">
            <p className="text-sm font-bold text-[#30251E]">Unable to fetch your orders right now.</p>
            <button
              onClick={() => customer?.phone && fetchCustomerOrders(customer.phone)}
              className="mt-4 rounded-xl bg-[#30251E] px-5 py-2.5 text-xs font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-[#E9E0D5] bg-white p-12 text-center shadow-sm">
            <p className="text-base font-bold text-[#30251E]">No active orders yet</p>
            <p className="text-xs text-[#77695C] mt-1 max-w-xs mx-auto">
              Your favorite coffee or snack is just a few clicks away.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-[#30251E] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#49372B]"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}