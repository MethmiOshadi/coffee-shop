'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
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
    case 'lock':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...common}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSignUp ? 'signup' : 'login',
          username,
          password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(json.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#30251E] flex flex-col justify-between p-6">
      {/* Top Header Navigation */}
      <div className="mx-auto w-full max-w-md flex justify-between items-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#77695C] hover:text-[#30251E] transition"
        >
          <Icon name="arrow-left" size={16} /> Back to Store
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">🐘</span>
          <span className="text-xs font-black tracking-widest text-[#30251E]">ELEPHANTPATH</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-white border border-[#E9E0D5] rounded-[32px] p-8 sm:p-10 shadow-sm my-auto">
        <div className="text-center mb-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-md mb-4">
            <Icon name="lock" size={24} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
            Staff Portal
          </span>
          <h1 className="text-2xl font-extrabold text-[#30251E] tracking-tight mt-1">
            {isSignUp ? 'Create Admin Account' : 'Admin Portal Access'}
          </h1>
          <p className="text-xs text-[#77695C] mt-1">
            {isSignUp ? 'Set up administrator credentials to manage Elephantpath.' : 'Enter your verified admin credentials to proceed.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-2xl mb-5 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3.5 text-sm text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3.5 text-sm text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#30251E] hover:bg-[#49372B] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition duration-300 shadow-md mt-2 disabled:opacity-50"
          >
            {loading ? 'Verifying Credentials...' : isSignUp ? 'Create Account' : 'Authenticate & Log In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#F0EAE2] pt-5">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-semibold text-[#77695C] hover:text-[#30251E] underline underline-offset-4 transition"
          >
            {isSignUp ? 'Already have an admin account? Log In' : "Need a new admin login? Register account"}
          </button>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
          Elephantpath Security Systems
        </p>
      </div>
    </div>
  );
}