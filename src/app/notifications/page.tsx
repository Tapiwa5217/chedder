'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import Avatar from '@/components/Avatar';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_META = {
  like:    { Icon: Heart,        iconClass: 'text-rose-500',  label: 'liked your post' },
  comment: { Icon: MessageCircle, iconClass: 'text-blue-500', label: 'commented on your post' },
  follow:  { Icon: UserPlus,     iconClass: 'text-emerald-500', label: 'started following you' },
} as const;

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, getUserById } = useApp();

  const handleMarkAll = () => markAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-amber-500 hover:text-amber-600 font-semibold transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-center mb-4">
            <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            When someone likes, comments, or follows you, it'll show up here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
          {notifications.map((notif) => {
            const actor = getUserById(notif.actorId);
            const meta = TYPE_META[notif.type];
            const { Icon, iconClass, label } = meta;

            const notifLink = notif.type === 'follow'
              ? (actor ? `/profile/${actor.username}` : '/friends')
              : notif.postId
              ? '/feed'
              : '/feed';

            return (
              <Link
                key={notif.id}
                href={notifLink}
                onClick={() => !notif.read && markNotificationRead(notif.id)}
                className={`flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  !notif.read ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''
                }`}
              >
                {/* Actor avatar */}
                <div className="relative flex-shrink-0">
                  {actor ? (
                    <Avatar
                      initials={actor.avatar}
                      size="md"
                      colorSeed={actor.id}
                      avatarUrl={actor.avatarUrl}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  {/* Type badge */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 ${iconClass}`}>
                    <Icon className="w-3 h-3" fill={notif.type === 'like' ? 'currentColor' : 'none'} />
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                    <span className="font-semibold">{actor?.name ?? 'Someone'}</span>{' '}
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
