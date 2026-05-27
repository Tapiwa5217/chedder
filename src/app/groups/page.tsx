'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import Avatar from '@/components/Avatar';
import { Plus, Users, BookOpen, Lock, Globe } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GroupsPage() {
  const { currentUser, groups, users } = useApp();
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');

  const myGroups = groups.filter((g) => g.memberIds.includes(currentUser.id));
  const displayed = filter === 'mine' ? myGroups : groups;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">Book Groups</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Read and discuss books together</p>
        </div>
        <Link
          href="/groups/create"
          className="flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New group
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: 'mine' as const, label: `My groups (${myGroups.length})` },
          { id: 'all' as const, label: 'All groups' },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === id
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {filter === 'mine' ? "You're not in any groups yet" : 'No groups yet'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
            Create a group to read and discuss books with friends
          </p>
          <Link href="/groups/create" className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
            <Plus className="w-4 h-4" /> Create a group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayed.map((group) => {
            const lastMsg = group.messages[group.messages.length - 1];
            const lastSender = lastMsg ? users.find((u) => u.id === lastMsg.senderId) : null;
            const isAdmin = group.adminId === currentUser.id;
            const isMember = group.memberIds.includes(currentUser.id);

            return (
              <Link key={group.id} href={`/groups/${group.id}`} className="block group">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5">
                  <div className="flex items-start gap-4">
                    {/* Group icon */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      {group.book?.coverUrl ? (
                        <img src={group.book.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors leading-snug">
                            {group.name}
                          </h2>
                          {group.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{group.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isAdmin && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Admin</span>}
                          {!isAdmin && isMember && <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Member</span>}
                        </div>
                      </div>

                      {/* Last message preview */}
                      {lastMsg && lastSender ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-1">
                          <span className="font-medium">{lastSender.name.split(' ')[0]}:</span> {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1.5">No messages yet</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {group.memberIds.length}
                        </span>
                        {group.book && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <BookOpen className="w-3 h-3" /> {group.book.title}
                          </span>
                        )}
                        {group.isPublic ? (
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
                        ) : (
                          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                        )}
                        {lastMsg && <span className="ml-auto">{timeAgo(lastMsg.createdAt)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex -space-x-2 mt-3 pl-18">
                    {group.memberIds.slice(0, 8).map((uid) => {
                      const u = users.find((x) => x.id === uid);
                      return u ? (
                        <div key={uid} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900">
                          <Avatar initials={u.avatar} size="sm" colorSeed={u.id} avatarUrl={u.avatarUrl} />
                        </div>
                      ) : null;
                    })}
                    {group.memberIds.length > 8 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <span className="text-[9px] text-gray-500 font-medium">+{group.memberIds.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
