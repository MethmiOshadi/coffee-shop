'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CustomerNavbar() {
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('brew_customer');
    if (savedCustomer) {
      setCustomer(JSON.parse(savedCustomer));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('brew_customer');
    setCustomer(null);
    window.location.href = '/customer-login';
  };

  return (
    <div className="bg-[#1C1410] border-b border-[#2E221B] px-6 py-3 flex justify-between items-center text-xs">
      <Link href="/" className="font-extrabold text-white text-sm flex items-center gap-2">
        ☕ Ceylon Brews
      </Link>

      <div className="flex items-center gap-4">
        {customer ? (
          <>
            <span className="text-[#A39284] hidden sm:inline">
              Welcome, <span className="text-[#D2A072] font-bold">{customer.name}</span>
            </span>
            <Link
              href="/my-orders"
              className="bg-[#D2A072]/10 border border-[#D2A072]/30 text-[#D2A072] px-3 py-1.5 rounded-xl font-bold hover:bg-[#D2A072]/20 transition"
            >
              📋 My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 border border-red-900/40 px-3 py-1.5 rounded-xl transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <Link
            href="/customer-login"
            className="bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold px-4 py-1.5 rounded-xl transition"
          >
            Sign In / Register
          </Link>
        )}
      </div>
    </div>
  );
}