'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import Avatar from '@/components/Avatar';
import { Plus, Globe, Lock, Users, BookOpen } from 'lucide-react';

type Filter = 'all' | 'mine' | 'following';

export default function ListsPage() {
  const { currentUser, bookLists, getUserById } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const myLists = bookLists.filter((l) => l.userId === currentUser.id);
  const followingLists = bookLists.filter((l) => l.userId !== currentUser.id && l.followers.includes(currentUser.id));
  const publicLists = bookLists.filter((l) => l.isPublic && l.userId !== currentUser.id);

  const displayed =
    filter === 'mine' ? myLists :
    filter === 'following' ? followingLists :
    [...myLists, ...publicLists].filter((l, i, arr) => arr.findIndex((x) => x.id === l.id) === i);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">Collections</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Curated book collections from the community</p>
        </div>
        <Link
          href="/collections/create"
          className="flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New collection
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: 'all' as Filter, label: 'All collections' },
          { id: 'mine' as Filter, label: `My collections (${myLists.length})` },
          { id: 'following' as Filter, label: `Following (${followingLists.length})` },
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
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {filter === 'mine' ? 'No collections yet' : filter === 'following' ? "You're not following any collections" : 'No collections to show'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
            {filter === 'mine' ? 'Create your first curated book collection' : 'Discover lists from the community and follow ones you like'}
          </p>
          {filter === 'mine' && (
            <Link href="/collections/create" className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
              <Plus className="w-4 h-4" /> Create a collection
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayed.map((list) => {
            const owner = getUserById(list.userId);
            const isOwner = list.userId === currentUser.id;
            return (
              <Link key={list.id} href={`/collections/${list.id}`} className="block group">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors leading-snug">
                        {list.title}
                      </h2>
                      {list.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                      list.isPublic
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {list.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {list.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  {/* Book cover preview */}
                  <div className="flex -space-x-2 mb-3">
                    {list.books.slice(0, 6).map((b) => (
                      <div key={b.id} className="w-9 h-13 rounded-md overflow-hidden border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-sm flex-shrink-0">
                        {b.coverUrl && <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                    ))}
                    {list.books.length > 6 && (
                      <div className="w-9 h-13 rounded-md border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-sm flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium">+{list.books.length - 6}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    {owner && !isOwner && (
                      <span className="flex items-center gap-1.5">
                        <Avatar initials={owner.avatar} size="sm" colorSeed={owner.id} avatarUrl={owner.avatarUrl} />
                        {owner.name}
                      </span>
                    )}
                    {isOwner && <span className="text-amber-500 font-medium">Your collection</span>}
                    <span>{list.books.length} book{list.books.length !== 1 ? 's' : ''}</span>
                    {list.followers.length > 0 && (
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {list.followers.length} following</span>
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
