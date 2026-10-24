'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
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

export default function CustomerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanedPhone = phone.trim();

    if (!/^0\d{9}$/.test(cleanedPhone)) {
      setError(`Phone number must be exactly 10 digits starting with '0' (Current length: ${cleanedPhone.length})`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/customer/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSignUp ? 'signup' : 'login',
          name: isSignUp ? name : undefined,
          phone: cleanedPhone,
          password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        if (isSignUp) {
          setSuccessMsg('Account created successfully! Please sign in with your credentials.');
          setIsSignUp(false);
          setPassword('');
        } else {
          localStorage.setItem('brew_customer', JSON.stringify(json.customer));
          window.location.href = '/checkout';
        }
      } else {
        setError(json.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#30251E] flex flex-col justify-between p-6 md:p-12">
      
      {/* Top Header Link */}
      <div className="max-w-md mx-auto w-full flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-3.5 group"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-md transition-transform group-hover:scale-105">
            <span className="text-lg" aria-hidden="true">🐘</span>
          </span>
          <span className="text-xs font-black tracking-widest text-[#30251E]">ELEPHANTPATH</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#77695C] hover:text-[#30251E] bg-white border border-[#E4D9CB] px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Icon name="arrow-left" size={15} /> Back to Menu
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto bg-white border border-[#E9E0D5] rounded-[28px] p-8 sm:p-10 shadow-sm my-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#E4D9CB] text-[#A17B50] mb-4 shadow-sm">
            <Icon name={isSignUp ? 'user' : 'coffee'} size={26} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
            {isSignUp ? 'Customer Registration' : 'Secure Customer Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30251E] mt-1">
            {isSignUp ? 'Create account' : 'Welcome back.'}
          </h1>
          <p className="text-xs text-[#77695C] mt-2 leading-relaxed">
            {isSignUp
              ? 'Create your account with your 10-digit mobile number to start ordering.'
              : 'Sign in with your mobile number and password to proceed to checkout.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-2xl mb-6 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl mb-6 font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#8C7A6B]">
                  <Icon name="user" size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl pl-12 pr-4 py-3.5 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">
              Phone Number {phone && <span className="text-[#A17B50]">({phone.length}/10)</span>}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#8C7A6B]">
                <Icon name="phone" size={18} />
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl pl-12 pr-4 py-3.5 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
                placeholder="07xxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#8C7A6B]">
                <Icon name="lock" size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl pl-12 pr-4 py-3.5 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#30251E] hover:bg-[#49372B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg mt-3 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Customer Account' : 'Sign In & Proceed'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F0EAE2] text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-[#A17B50] hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-[10px] text-[#77695C]">
        <p>© {new Date().getFullYear()} Elephantpath Coffee House. All rights reserved.</p>
      </footer>
    </div>
  );
}