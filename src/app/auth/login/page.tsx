'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/feed');
      router.refresh();
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    setOauthLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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

          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Sign in to your account</p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {oauthLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
            </button>

            <button
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              {oauthLoading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
            </button>

            <button
              onClick={() => handleOAuth('facebook')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.273h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              {oauthLoading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSignIn} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/auth/forgot" className="text-xs text-amber-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-amber-950 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-amber-500 font-semibold hover:underline">
              Sign up free
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
            Track what you read, share your thoughts, and connect with fellow readers who love the same books.
          </p>
          <div className="mt-10 flex justify-center gap-6 text-sm text-amber-900/60">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-950">2.4M+</div>
              <div>Books to explore</div>
            </div>
            <div className="w-px bg-amber-900/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-950">100%</div>
              <div>Free, forever</div>
            </div>
            <div className="w-px bg-amber-900/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-950">0</div>
              <div>Ads. Ever.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
