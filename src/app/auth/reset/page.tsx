'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/feed');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-sm">
          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-8">
            <img src="/chedder_logo.svg" alt="Chedder" className="h-16 w-auto mx-auto" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">Chedder</h1>
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">Choose a new password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Make it strong — at least 8 characters.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-amber-950 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel — branding, keep exactly as-is */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-300 flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="flex justify-center mb-6">
            <img src="/chedder_logo_white.svg" alt="Chedder" className="h-40 w-auto" />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight text-amber-950">
            Reading is better<br />together
          </h1>
          <p className="text-lg text-amber-900/70 leading-relaxed">
            Track what you read, share your thoughts, and connect with fellow readers.
          </p>
        </div>
      </div>
    </div>
  );
}
