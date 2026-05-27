'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import Avatar from './Avatar';
import { Home, Library, Users, Search, NotebookText, Settings, type LucideIcon } from 'lucide-react';

const NAV_ITEMS: { href: string; Icon: LucideIcon; label: string; bg: string; text: string }[] = [
  { href: '/feed',     Icon: Home,         label: 'Feed',       bg: 'bg-blue-100',   text: 'text-blue-600'   },
  { href: '/library',  Icon: Library,      label: 'My Library', bg: 'bg-amber-100', text: 'text-amber-500' },
  { href: '/friends',  Icon: Users,        label: 'My Network', bg: 'bg-green-100',  text: 'text-green-600'  },
  { href: '/explore',  Icon: Search,       label: 'Explore',    bg: 'bg-orange-100', text: 'text-orange-600' },
  { href: '/notes',    Icon: NotebookText, label: 'My Journal', bg: 'bg-amber-100', text: 'text-amber-500' },
  { href: '/settings', Icon: Settings,     label: 'Settings',   bg: 'bg-gray-100',   text: 'text-gray-600'   },
];

export default function LeftSidebar() {
  const { currentUser, shelf } = useApp();
  const pathname = usePathname();

  const readCount    = shelf.filter((e) => e.shelf === 'read').length;
  const readingCount = shelf.filter((e) => e.shelf === 'reading').length;

  return (
    <div className="space-y-3">

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="h-14 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-300" />
        <div className="px-4 -mt-7 pb-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-white dark:border-gray-900 shadow-md overflow-hidden bg-white dark:bg-gray-800 mb-2">
            <Avatar initials={currentUser.avatar} size="lg" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{currentUser.name}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">@{currentUser.username}</p>
          {currentUser.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-snug line-clamp-2">{currentUser.bio}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-y-2">
            {[
              { label: 'Books read',   value: readCount,         color: 'text-amber-500' },
              { label: 'Reading',      value: readingCount,      color: 'text-blue-600'   },
              { label: 'Followers',    value: currentUser.followers.length,  color: 'text-amber-500'   },
              { label: 'Following',    value: currentUser.following.length,  color: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label}>
                <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors rounded-xl mx-1 ${
                active ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <item.Icon className={`w-5 h-5 ${item.text}`} />
              </div>
              <span className={`text-sm font-semibold ${active ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Currently reading */}
      {readingCount > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <p className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
            Reading Now
          </p>
          <div className="space-y-3">
            {shelf
              .filter((e) => e.shelf === 'reading')
              .map((e) => (
                <Link key={e.book.id} href={`/books/${e.book.id}`} className="flex gap-2.5 items-start group">
                  <div className="w-9 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                    {e.book.coverUrl ? (
                      <img src={e.book.coverUrl} alt={e.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">
                      {e.book.title}
                    </p>
                    <div className="mt-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${e.progress ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{e.progress ?? 0}% complete</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
