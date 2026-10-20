'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1C1410] border border-[#2E221B] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {isSignUp ? 'Create Admin Account' : 'Admin Login'}
        </h1>
        <p className="text-xs text-[#A39284] text-center mb-6">
          {isSignUp ? 'Set up credentials to manage the coffee shop.' : 'Enter your admin credentials to continue.'}
        </p>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 text-red-400 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#A39284] mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#D2A072] outline-none"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A39284] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#D2A072] outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl transition duration-300 text-sm mt-2"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-[#A39284] hover:text-[#D2A072] underline transition"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}