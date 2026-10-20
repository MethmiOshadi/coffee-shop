'use client';

import { useState } from 'react';
import Link from 'next/link';

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
          // After Sign Up -> Show success message and automatically switch to Sign In mode
          setSuccessMsg('Account created successfully! Please sign in with your credentials.');
          setIsSignUp(false);
          setPassword('');
        } else {
          // After Login -> Save customer to localStorage & force hard navigation to /checkout
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
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1C1410] border border-[#2E221B] rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1">
            ☕ {isSignUp ? 'Customer Registration' : 'Customer Sign In'}
          </h1>
          <p className="text-xs text-[#A39284]">
            {isSignUp
              ? 'Create an account with your 10-digit mobile number.'
              : 'Sign in with your phone and password to continue.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800/60 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs p-3 rounded-xl mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs text-[#A39284] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#D2A072]"
                placeholder="e.g. Oshadi"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-[#A39284] mb-1">
              Phone Number (10 Digits) {phone && <span className="text-[#D2A072]">({phone.length}/10)</span>}
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#D2A072]"
              placeholder="0719575875"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A39284] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#D2A072]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl text-xs transition duration-300 shadow-lg mt-2"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Customer Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-[#D2A072] hover:underline block w-full"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          <Link href="/" className="text-xs text-[#A39284] hover:text-white underline block pt-2">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}