'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import PostCard from '@/components/PostCard';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ComposeBox from '@/components/ComposeBox';
import { Inbox } from 'lucide-react';

export default function FeedPage() {
  const { posts, currentUser } = useApp();
  const [filter, setFilter] = useState<'following' | 'all'>('following');

  const followingIds = new Set(currentUser.following);
  const feedPosts = posts
    .filter((p) =>
      filter === 'all' ? true : followingIds.has(p.userId) || p.userId === currentUser.id
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-5 items-start">
        {/* Left sidebar — sticky */}
        <div className="hidden lg:block w-60 flex-shrink-0 sticky top-20">
          <LeftSidebar />
        </div>

        {/* Center feed */}
        <div className="flex-1 min-w-0">
          {/* Compose box */}
          <ComposeBox />

          {/* Filter tabs */}
          <div className="flex gap-1 mb-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-1">
            {(['following', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f === 'following' ? 'Following' : 'Discover'}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4 pb-24">
            {feedPosts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-center mb-4">
                  <Inbox className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                </div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Nothing in your feed yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Follow readers to see their updates</p>
              </div>
            ) : (
              feedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Right sidebar — sticky */}
        <div className="hidden xl:block w-72 flex-shrink-0 sticky top-20">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
