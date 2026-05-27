'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import Avatar from './Avatar';
import { BookOpen } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_VERB: Record<string, string> = {
  finished: 'finished',
  started: 'started reading',
  review: 'reviewed',
  quote: 'quoted from',
  update: 'is reading',
};

export default function RightSidebar() {
  const { currentUser, users, posts, isFollowing, followUser } = useApp();

  // Active friends — people the current user follows
  const activeFriends = users.filter((u) => currentUser.following.includes(u.id));

  // Latest activity — most recent posts from the whole network
  const recentActivity = posts
    .filter((p) => p.userId !== currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // People to follow
  const suggestions = users
    .filter((u) => u.id !== currentUser.id && !isFollowing(u.id))
    .slice(0, 3);

  return (
    <div className="space-y-3">

      {/* Latest Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Latest Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((post) => {
              const author = users.find((u) => u.id === post.userId);
              if (!author) return null;
              return (
                <div key={post.id} className="flex items-start gap-2.5">
                  <div className="relative flex-shrink-0">
                    <Avatar initials={author.avatar} size="sm" colorSeed={author.id} avatarUrl={author.avatarUrl} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <BookOpen className="w-2 h-2 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                      <Link
                        href={`/profile/${author.username}`}
                        className="font-bold text-gray-900 dark:text-gray-100 hover:text-amber-500 transition-colors"
                      >
                        {author.name}
                      </Link>
                      {' '}
                      <span className="text-gray-500 dark:text-gray-400">{TYPE_VERB[post.type]}</span>
                      {post.book && (
                        <>
                          {' '}
                          <Link href={`/books/${post.book.id}`} className="font-semibold text-amber-500 hover:underline">
                            {post.book.title}
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(post.createdAt)}</p>
                  </div>
                  {post.book?.coverUrl && (
                    <Link href={`/books/${post.book.id}`} className="flex-shrink-0">
                      <img src={post.book.coverUrl} alt={post.book.title} className="w-8 h-11 rounded-lg object-cover shadow-sm" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Friends */}
      {activeFriends.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Active Friends</h3>
          <div className="space-y-2.5">
            {activeFriends.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative flex-shrink-0">
                  <Avatar initials={user.avatar} size="sm" colorSeed={user.id} avatarUrl={user.avatarUrl} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-emerald-500">Active now</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* People to follow */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">People to Follow</h3>
            <Link href="/friends" className="text-xs text-amber-500 font-semibold hover:underline">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5">
                <Avatar initials={user.avatar} size="sm" colorSeed={user.id} avatarUrl={user.avatarUrl} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{user.followers.length} followers</p>
                </div>
                <button
                  onClick={() => followUser(user.id)}
                  className="text-xs px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-500 rounded-full hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors font-semibold flex-shrink-0"
                >
                  + Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-300 dark:text-gray-600 px-1 leading-relaxed">
        Chedder · About · Privacy · Terms
      </p>
    </div>
  );
}
