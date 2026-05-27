'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import UserCard from '@/components/UserCard';
import { Users, Sparkles } from 'lucide-react';

export default function FriendsPage() {
  const { users, currentUser, isFollowing } = useApp();
  const [tab, setTab] = useState<'following' | 'discover'>('following');

  const following = users.filter((u) => u.id !== currentUser.id && isFollowing(u.id));
  const discover = users.filter((u) => u.id !== currentUser.id && !isFollowing(u.id));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">People</h1>

      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-1">
        {(['following', 'discover'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {t === 'following' ? `Following (${following.length})` : `Discover (${discover.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'following' ? (
          following.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <div className="flex justify-center mb-3">
                <Users className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <p className="font-medium">Not following anyone yet</p>
              <p className="text-sm mt-1">Discover readers in the Discover tab</p>
            </div>
          ) : (
            following.map((u) => <UserCard key={u.id} user={u} />)
          )
        ) : discover.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <div className="flex justify-center mb-3">
              <Sparkles className="w-10 h-10 text-gray-200 dark:text-gray-700" />
            </div>
            <p className="font-medium">You're following everyone!</p>
          </div>
        ) : (
          discover.map((u) => <UserCard key={u.id} user={u} />)
        )}
      </div>
    </div>
  );
}
