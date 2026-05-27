'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-8">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <MailCheck className="w-16 h-16 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Check your inbox</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            We sent a password reset link to <strong>{email}</strong>. Click it to choose a new password.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-amber-500 font-semibold hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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

          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">Reset your password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-amber-950 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-amber-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
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
