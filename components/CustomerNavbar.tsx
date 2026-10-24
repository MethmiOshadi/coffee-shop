'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderNotificationBell from './OrderNotificationBell';

interface CustomerNavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function CustomerNavbar({ cartCount = 0, onOpenCart }: CustomerNavbarProps) {
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
    <header className="sticky top-0 z-40 bg-[#120B08]/85 backdrop-blur-md border-b border-[#2E221B] px-4 md:px-10 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 text-lg md:text-xl font-black tracking-wider text-white transition hover:opacity-90"
        >
          <span className="w-8 h-8 rounded-xl bg-[#2E221B] border border-[#3D2D24] flex items-center justify-center text-sm shadow-inner group-hover:border-[#D2A072]/50 transition">
            ☕
          </span>
          <span className="bg-gradient-to-r from-white via-[#EADCCF] to-[#D2A072] bg-clip-text text-transparent">
            BREW & BEAN
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 md:gap-3.5">
          {customer ? (
            <div className="flex items-center gap-2 md:gap-3 bg-[#1C1410] border border-[#2E221B] px-3 py-1.5 rounded-2xl shadow-lg">
              {/* Notification Bell */}
              <OrderNotificationBell />

              <div className="h-4 w-[1px] bg-[#2E221B] hidden sm:block" />

              {/* User Greeting */}
              <span className="text-xs text-[#A39284] hidden md:inline">
                Hello, <span className="text-[#D2A072] font-bold">{customer.name}</span>
              </span>

              {/* My Orders Button */}
              <Link
                href="/my-orders"
                className="bg-[#D2A072]/10 border border-[#D2A072]/30 text-[#D2A072] hover:bg-[#D2A072] hover:text-[#120B08] px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm"
              >
                📋 <span className="hidden sm:inline">My</span> Orders
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 bg-red-950/30 border border-red-900/40 hover:bg-red-900/50 px-2.5 py-1.5 rounded-xl transition duration-200"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              href="/customer-login"
              className="bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-black text-xs px-4 py-2 rounded-xl transition duration-300 shadow-md hover:shadow-[#D2A072]/10"
            >
              Sign In / Register
            </Link>
          )}

          {/* Cart Drawer Trigger Button (If handler provided) */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative bg-[#1C1410] border border-[#2E221B] hover:border-[#D2A072]/50 px-3.5 py-2 rounded-2xl text-xs font-bold text-white flex items-center gap-2 transition shadow-md"
            >
              🛒 <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#D2A072] text-[#120B08] px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
}