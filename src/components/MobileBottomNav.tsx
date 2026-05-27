'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useChatContext } from '@/lib/chatContext';
import { Home, Search, Library, Users, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/feed',
    Icon: Home,
    label: 'Feed',
    match: (p: string) => p === '/feed' || p.startsWith('/feed/'),
  },
  {
    href: '/explore',
    Icon: Search,
    label: 'Explore',
    match: (p: string) =>
      p === '/explore' || p.startsWith('/explore/') || p.startsWith('/books/') || p.startsWith('/recommendations'),
  },
  {
    href: '/library',
    Icon: Library,
    label: 'Library',
    match: (p: string) => p === '/library' || p.startsWith('/library/') || p.startsWith('/lists/'),
  },
  {
    href: '/friends',
    Icon: Users,
    label: 'Friends',
    match: (p: string) => p === '/friends' || p.startsWith('/profile/'),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getUnreadCount } = useApp();
  const { mobileOpen, setMobileOpen, setActiveMobileChatId } = useChatContext();
  const unreadCount = getUnreadCount();

  const openMessages = () => {
    setActiveMobileChatId(null);
    setMobileOpen(true);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}
    >
      {NAV_ITEMS.map(({ href, Icon, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 pt-2 pb-1 px-4 min-w-[60px] transition-colors ${
              active ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}

      {/* Messages */}
      <button
        onClick={openMessages}
        className={`relative flex flex-col items-center gap-0.5 pt-2 pb-1 px-4 min-w-[60px] transition-colors ${
          mobileOpen ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        <MessageSquare className="w-6 h-6" strokeWidth={mobileOpen ? 2.5 : 1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="text-[10px] font-semibold">Messages</span>
      </button>
    </nav>
  );
}
