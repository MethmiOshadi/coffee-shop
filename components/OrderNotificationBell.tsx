'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrderNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedCustomer = localStorage.getItem('brew_customer');
    if (!savedCustomer) return;

    const { phone } = JSON.parse(savedCustomer);

    const checkStatusUpdates = async () => {
      try {
        const res = await fetch(`/api/customer/orders?phone=${phone}`);
        const json = await res.json();
        if (json.success && json.data) {
          const currentStatuses: Record<string, string> = {};
          const newAlerts: string[] = [];

          json.data.forEach((order: any) => {
            currentStatuses[order._id] = order.status;

            if (lastStatuses[order._id] && lastStatuses[order._id] !== order.status) {
              newAlerts.push(`Order #${order._id.slice(-6)} is now ${order.status}!`);
            }
          });

          if (newAlerts.length > 0) {
            setNotifications((prev) => [...newAlerts, ...prev]);
            setUnreadCount((prev) => prev + newAlerts.length);
          }

          setLastStatuses(currentStatuses);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatusUpdates();
    const interval = setInterval(checkStatusUpdates, 6000);
    return () => clearInterval(interval);
  }, [lastStatuses]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="relative p-2 bg-[#1C1410] border border-[#2E221B] hover:border-[#D2A072]/50 rounded-xl text-white transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1C1410] border border-[#2E221B] rounded-2xl shadow-2xl p-4 z-50 space-y-3">
          <div className="flex justify-between items-center border-b border-[#2E221B] pb-2">
            <h4 className="text-xs font-bold text-white">Order Notifications</h4>
            <button onClick={() => setIsOpen(false)} className="text-[10px] text-[#A39284]">✕</button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-[11px] text-[#A39284] text-center py-4">No recent status updates.</p>
            ) : (
              notifications.map((msg, idx) => (
                <div key={idx} className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-2.5 text-[11px] text-[#D2A072]">
                  {msg}
                </div>
              ))
            )}
          </div>

          <Link
            href="/my-orders"
            className="block text-center text-[11px] text-[#D2A072] font-bold hover:underline pt-1"
          >
            View All Active Orders ➔
          </Link>
        </div>
      )}
    </div>
  );
}