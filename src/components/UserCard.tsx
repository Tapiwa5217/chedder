'use client';

import Link from 'next/link';
import { User } from '@/lib/types';
import { useApp } from '@/lib/context';
import Avatar from './Avatar';

export default function UserCard({ user }: { user: User }) {
  const { isFollowing, followUser, unfollowUser, currentUser, posts } = useApp();

  if (user.id === currentUser.id) return null;

  const following = isFollowing(user.id);
  const userPostCount = posts.filter((p) => p.userId === user.id).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
      <Link href={`/profile/${user.username}`}>
        <Avatar initials={user.avatar} size="lg" colorSeed={user.id} avatarUrl={user.avatarUrl} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/profile/${user.username}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-500 transition-colors">
              {user.name}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
          <button
            onClick={() => (following ? unfollowUser(user.id) : followUser(user.id))}
            className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors flex-shrink-0 ${
              following
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{user.bio}</p>
        <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span><span className="font-semibold text-gray-700 dark:text-gray-300">{user.followers.length}</span> followers</span>
          <span><span className="font-semibold text-gray-700 dark:text-gray-300">{userPostCount}</span> posts</span>
          <Link href={`/profile/${user.username}`} className="text-amber-500 hover:underline font-medium">
            View profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
