'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { ShelfType } from '@/lib/types';
import Avatar from '@/components/Avatar';
import StarRating from '@/components/StarRating';
import {
  BookOpen, Bookmark, CheckCircle2, Library, LayoutGrid, LayoutList,
  Plus, Globe, Lock, Users, type LucideIcon,
} from 'lucide-react';

const SHELF_TABS: { key: ShelfType; label: string; Icon: LucideIcon; color: string }[] = [
  { key: 'reading', label: 'Reading',  Icon: BookOpen,     color: 'text-blue-600'    },
  { key: 'wishlist', label: 'Wishlist', Icon: Bookmark,    color: 'text-amber-600'   },
  { key: 'read',    label: 'Read',     Icon: CheckCircle2, color: 'text-emerald-600' },
];

type ActiveTab = ShelfType | 'collections';

export default function LibraryPage() {
  const { shelf, bookLists, currentUser, getUserById, updateEntry, followList, unfollowList } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('reading');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [collectionFilter, setCollectionFilter] = useState<'mine' | 'following'>('mine');

  const counts: Record<ShelfType, number> = {
    read:     shelf.filter((e) => e.shelf === 'read').length,
    reading:  shelf.filter((e) => e.shelf === 'reading').length,
    wishlist: shelf.filter((e) => e.shelf === 'wishlist').length,
  };

  const tabBooks = activeTab !== 'collections' ? shelf.filter((e) => e.shelf === activeTab) : [];

  const myCollections = bookLists.filter((l) => l.userId === currentUser.id);
  const followingCollections = bookLists.filter(
    (l) => l.userId !== currentUser.id && l.followers.includes(currentUser.id)
  );
  const displayedCollections = collectionFilter === 'mine' ? myCollections : followingCollections;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Library</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {shelf.length} books · {counts.read} read · {counts.reading} reading now
          </p>
        </div>
        {activeTab !== 'collections' && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                view === 'grid' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                view === 'list' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <LayoutList className="w-4 h-4" /> List
            </button>
          </div>
        )}
        {activeTab === 'collections' && (
          <Link
            href="/collections/create"
            className="flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New collection
          </Link>
        )}
      </div>

      {/* Stat cards — shelf only */}
      {activeTab !== 'collections' && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {SHELF_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all p-5 text-left shadow-sm hover:shadow-md ${
                activeTab === tab.key ? 'border-amber-500 shadow-amber-100 dark:shadow-amber-900/20' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="mb-2">
                <tab.Icon className={`w-6 h-6 ${tab.color}`} />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{counts[tab.key]}</div>
              <div className={`text-sm font-medium mt-0.5 ${tab.color}`}>{tab.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6">
        {SHELF_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
            <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              {counts[tab.key]}
            </span>
          </button>
        ))}

        {/* Collections tab */}
        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 px-5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'collections'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Library className="w-4 h-4" />
          Collections
          {myCollections.length > 0 && (
            <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              {myCollections.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Collections tab content ─────────────────────────── */}
      {activeTab === 'collections' && (
        <div>
          {/* Sub-filter */}
          <div className="flex gap-2 mb-5">
            {([
              { id: 'mine' as const,      label: `My collections (${myCollections.length})` },
              { id: 'following' as const, label: `Following (${followingCollections.length})` },
            ]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCollectionFilter(id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  collectionFilter === id
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {displayedCollections.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <Library className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {collectionFilter === 'mine' ? 'No collections yet' : "You're not following any collections"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                {collectionFilter === 'mine'
                  ? 'Create a curated book collection to share with the community'
                  : 'Browse public collections and follow the ones you like'}
              </p>
              {collectionFilter === 'mine' && (
                <Link
                  href="/collections/create"
                  className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create a collection
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedCollections.map((col) => {
                const owner = getUserById(col.userId);
                const isOwner = col.userId === currentUser.id;
                const isFollowing = col.followers.includes(currentUser.id);

                return (
                  <div key={col.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Link href={`/collections/${col.id}`} className="flex-1 min-w-0 group">
                        <h2 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors leading-snug">
                          {col.title}
                        </h2>
                        {col.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">
                            {col.description}
                          </p>
                        )}
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                          col.isPublic
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {col.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {col.isPublic ? 'Public' : 'Private'}
                        </span>
                        {!isOwner && col.isPublic && (
                          <button
                            onClick={() => isFollowing ? unfollowList(col.id) : followList(col.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isFollowing
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500'
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                            }`}
                          >
                            {isFollowing ? 'Following' : '+ Follow'}
                          </button>
                        )}
                        {isOwner && (
                          <Link href={`/collections/${col.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Book cover preview */}
                    <div className="flex -space-x-2 mb-3">
                      {col.books.slice(0, 7).map((b) => (
                        <div key={b.id} className="w-9 rounded-md overflow-hidden border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-sm flex-shrink-0" style={{ height: '52px' }}>
                          {b.coverUrl && <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                      {col.books.length > 7 && (
                        <div className="w-9 rounded-md border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-sm flex-shrink-0 flex items-center justify-center" style={{ height: '52px' }}>
                          <span className="text-[10px] text-gray-400 font-medium">+{col.books.length - 7}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      {!isOwner && owner && (
                        <span className="flex items-center gap-1.5">
                          <Avatar initials={owner.avatar} size="sm" colorSeed={owner.id} avatarUrl={owner.avatarUrl} />
                          {owner.name}
                        </span>
                      )}
                      {isOwner && <span className="text-amber-500 font-medium">Your collection</span>}
                      <span>{col.books.length} book{col.books.length !== 1 ? 's' : ''}</span>
                      {col.followers.length > 0 && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {col.followers.length} following</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Shelf tab content ───────────────────────────────── */}
      {activeTab !== 'collections' && (
        <>
          {tabBooks.length === 0 ? (
            <div className="text-center py-20 text-gray-300 dark:text-gray-600">
              <Library className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold text-gray-500 dark:text-gray-400">Nothing here yet</p>
              <Link href="/explore" className="inline-block mt-3 text-sm text-amber-500 hover:underline font-medium">
                Discover books to add →
              </Link>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {tabBooks.map((entry) => (
                <Link key={entry.book.id} href={`/books/${entry.book.id}`} className="group">
                  <div
                    className="relative rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-0.5 bg-gray-100 dark:bg-gray-800"
                    style={{ aspectRatio: '2/3' }}
                  >
                    {entry.book.coverUrl ? (
                      <img src={entry.book.coverUrl} alt={entry.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-gray-500 dark:text-gray-400 leading-snug bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                        {entry.book.title}
                      </div>
                    )}
                    {activeTab === 'reading' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
                        <div className="h-full bg-amber-500" style={{ width: `${entry.progress ?? 0}%` }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{entry.book.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tabBooks.map((entry) => (
                <div key={entry.book.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex gap-4">
                  <Link href={`/books/${entry.book.id}`} className="flex-shrink-0">
                    <div className="w-16 h-24 rounded-lg overflow-hidden shadow">
                      {entry.book.coverUrl ? (
                        <img src={entry.book.coverUrl} alt={entry.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 text-center p-1">No cover</div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${entry.book.id}`}>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 hover:text-amber-500 transition-colors line-clamp-1">{entry.book.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{entry.book.author}</p>

                    {activeTab === 'reading' && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <input
                            type="range" min={0} max={100} value={entry.progress ?? 0}
                            onChange={(e) => updateEntry(entry.book.id, { progress: Number(e.target.value) })}
                            className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
                          />
                          <span className="text-xs text-gray-400 dark:text-gray-500 w-7 text-right tabular-nums">{entry.progress ?? 0}%</span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'read' && (
                      <div className="mt-2 space-y-2">
                        <StarRating value={entry.rating ?? 0} onChange={(v) => updateEntry(entry.book.id, { rating: v })} />
                        {editingId === entry.book.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-amber-200 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                              rows={3} placeholder="Write your review..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => { updateEntry(entry.book.id, { review: reviewText }); setEditingId(null); }}
                                className="text-sm bg-amber-500 text-white px-4 py-1.5 rounded-lg hover:bg-amber-600"
                              >Save</button>
                              <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {entry.review && <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{entry.review}"</p>}
                            <button
                              onClick={() => { setEditingId(entry.book.id); setReviewText(entry.review ?? ''); }}
                              className="text-xs text-amber-500 hover:underline mt-1"
                            >{entry.review ? 'Edit review' : 'Write a review'}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
