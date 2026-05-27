'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import ChatWidget from './ChatWidget';
import { useApp } from '@/lib/context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useApp();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef] dark:bg-gray-950">
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-bounce">
            <img src="/chedder_logo.svg" alt="Chedder" className="h-24 w-auto" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Loading your library…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <ChatWidget />
    </>
  );
}
