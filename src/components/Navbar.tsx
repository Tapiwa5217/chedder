'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useTheme } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';
import Avatar from './Avatar';
import { User, Settings, LogOut, ChevronDown, Sun, Moon, Bell, NotebookText } from 'lucide-react';

type NavLink = { href: string; label: string; match: (p: string) => boolean };

const NAV_LINKS: NavLink[] = [
  { href: '/feed',    label: 'Feed',    match: (p) => p === '/feed' || p.startsWith('/feed/') },
  { href: '/explore', label: 'Explore', match: (p) => p === '/explore' || p.startsWith('/explore/') || p.startsWith('/books/') || p.startsWith('/recommendations') },
  { href: '/library', label: 'Library', match: (p) => p === '/library' || p.startsWith('/library/') || p.startsWith('/collections/') },
  { href: '/groups',  label: 'Groups',  match: (p) => p === '/groups' || p.startsWith('/groups/') },
  { href: '/friends', label: 'Friends', match: (p) => p === '/friends' || p.startsWith('/profile/') },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, unreadNotificationCount } = useApp();
  const { theme, toggle } = useTheme();
  const supabase = createClient();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2.5 group">
        <img src="/chedder_logo.svg" alt="Chedder" className="h-9 w-auto" />
        <span className="text-lg font-black text-gray-950 dark:text-gray-100 tracking-tight">Chedder</span>
      </Link>

      <div className="hidden md:flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              link.match(pathname)
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications bell */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="flex items-center gap-2.5 group rounded-xl px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar
              initials={currentUser.avatar}
              size="sm"
              colorSeed={currentUser.id}
              avatarUrl={currentUser.avatarUrl}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform hidden sm:block ${showMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 mb-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{currentUser.username}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              <Link
                href="/notes"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <NotebookText className="w-4 h-4" /> Journal
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>

              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
