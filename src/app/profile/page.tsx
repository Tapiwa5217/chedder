'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import BookCard from '@/components/BookCard';
import PostCard from '@/components/PostCard';
import Avatar from '@/components/Avatar';
import StarRating from '@/components/StarRating';
import {
  BookOpen, CheckCircle2, Bookmark, Library, NotebookText, PenLine,
  Camera, Plus, Globe, Lock, Users,
} from 'lucide-react';

function coverGradient(seed: string): string {
  const gradients = [
    'from-amber-400 via-orange-400 to-pink-400',
    'from-blue-500 via-indigo-500 to-purple-500',
    'from-emerald-400 via-teal-400 to-cyan-400',
    'from-rose-400 via-pink-400 to-fuchsia-400',
    'from-amber-500 via-yellow-400 to-amber-300',
    'from-violet-500 via-purple-400 to-pink-400',
    'from-sky-400 via-blue-400 to-indigo-500',
  ];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 65536;
  return gradients[Math.abs(h) % gradients.length];
}

export default function ProfilePage() {
  const { currentUser, shelf, posts, journals, bookLists, updateProfile } = useApp();
  const supabase = createClient();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'shelves' | 'collections' | 'journal' | 'posts' | 'stats'>('shelves');
  const [uploadingCover, setUploadingCover] = useState(false);

  const myPosts = posts.filter((p) => p.userId === currentUser.id);
  const myJournals = journals.filter((j) => j.userId === currentUser.id);
  const readBooks = shelf.filter((e) => e.shelf === 'read');
  const readingBooks = shelf.filter((e) => e.shelf === 'reading');
  const wishlistBooks = shelf.filter((e) => e.shelf === 'wishlist');
  const myLists = bookLists.filter((l) => l.userId === currentUser.id);

  const ratedBooks = readBooks.filter((e) => e.rating);
  const avgRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((acc, e) => acc + (e.rating ?? 0), 0) / ratedBooks.length
      : 0;

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingCover(true);
    try {
      const path = `${currentUser.id}/cover.jpg`;
      await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateProfile({ coverUrl: `${data.publicUrl}?t=${Date.now()}` });
    } catch { /* silently fail */ }
    setUploadingCover(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
        {/* Cover photo */}
        <div className="relative h-44 group cursor-pointer" onClick={() => !uploadingCover && coverInputRef.current?.click()}>
          {currentUser.coverUrl ? (
            <img src={currentUser.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${coverGradient(currentUser.id)}`} />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 text-white text-sm font-medium px-4 py-2 rounded-full">
              {uploadingCover ? 'Uploading…' : <><Camera className="w-4 h-4" /> Change cover</>}
            </div>
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        {/* Profile body */}
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-4">
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                <Avatar initials={currentUser.avatar} size="lg" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} className="w-full h-full" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <Link
              href="/settings"
              className="text-sm px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Edit Profile
            </Link>
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentUser.name}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">@{currentUser.username}</p>

          {/* Stats row */}
          <div className="flex gap-8 my-3">
            {[
              { value: readBooks.length, label: 'books read' },
              { value: currentUser.following.length, label: 'following' },
              { value: currentUser.followers.length, label: 'followers' },
              { value: myPosts.length, label: 'posts' },
            ].map((stat) => (
              <div key={stat.label}>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{stat.value}</span>
                <span className="text-gray-400 dark:text-gray-500 text-sm ml-1.5">{stat.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">{currentUser.bio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6">
        {([
          { key: 'shelves',     label: 'Shelves'     },
          { key: 'collections', label: 'Collections' },
          { key: 'journal',     label: 'Journal'     },
          { key: 'posts',       label: 'Posts'       },
          { key: 'stats',       label: 'Stats'       },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 px-5 text-sm font-semibold transition-colors whitespace-nowrap ${
              tab === key
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
            {key === 'collections' && myLists.length > 0 && (
              <span className="ml-1.5 text-xs bg-amber-100 text-amber-500 px-1.5 py-0.5 rounded-full">
                {myLists.length}
              </span>
            )}
            {key === 'journal' && myJournals.length > 0 && (
              <span className="ml-1.5 text-xs bg-amber-100 text-amber-500 px-1.5 py-0.5 rounded-full">
                {myJournals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'shelves' && (
        <div className="space-y-8">
          {readingBooks.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Currently Reading
              </h2>
              <div className="space-y-3">
                {readingBooks.map((e) => <BookCard key={e.book.id} book={e.book} />)}
              </div>
            </section>
          )}
          {readBooks.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Read
              </h2>
              <div className="space-y-3">
                {readBooks.map((e) => (
                  <div key={e.book.id}>
                    <BookCard book={e.book} />
                    {(e.rating || e.review) && (
                      <div className="mt-2 px-4">
                        {e.rating !== undefined && <StarRating value={e.rating} readonly size="sm" />}
                        {e.review && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">"{e.review}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {wishlistBooks.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" /> Wishlist
              </h2>
              <div className="space-y-3">
                {wishlistBooks.map((e) => <BookCard key={e.book.id} book={e.book} />)}
              </div>
            </section>
          )}
          {shelf.length === 0 && (
            <div className="text-center py-20 text-gray-300 dark:text-gray-600">
              <Library className="w-12 h-12 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Your library is empty</p>
              <Link href="/explore" className="text-sm text-amber-500 hover:underline mt-2 inline-block">
                Start exploring books →
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{myLists.length} collection{myLists.length !== 1 ? 's' : ''}</p>
            <Link
              href="/collections/create"
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> New collection
            </Link>
          </div>

          {myLists.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <NotebookText className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No collections yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create a curated book collection to share with the community</p>
            </div>
          ) : (
            myLists.map((list) => (
              <Link key={list.id} href={`/collections/${list.id}`} className="block group">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors leading-tight">
                        {list.title}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{list.description}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                      list.isPublic
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {list.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {list.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    {/* Mini book covers */}
                    <div className="flex -space-x-2">
                      {list.books.slice(0, 5).map((b) => (
                        <div key={b.id} className="w-8 h-11 rounded-md overflow-hidden border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex-shrink-0 shadow-sm">
                          {b.coverUrl && <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>{list.books.length} book{list.books.length !== 1 ? 's' : ''}</span>
                      {list.followers.length > 0 && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {list.followers.length} following</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{myJournals.length} entr{myJournals.length !== 1 ? 'ies' : 'y'}</p>
            <Link
              href="/notes"
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              <NotebookText className="w-4 h-4" /> Open Journal
            </Link>
          </div>

          {myJournals.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <NotebookText className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No journal entries yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">Capture your thoughts, lessons, and insights from the books you read</p>
              <Link href="/notes" className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
                <NotebookText className="w-4 h-4" /> Start journaling
              </Link>
            </div>
          ) : (
            myJournals
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((journal) => (
                <Link key={journal.id} href={`/books/${journal.bookId}`} className="block group">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4">
                    <div className="flex-shrink-0 w-12 h-18 rounded-xl overflow-hidden shadow-md">
                      {journal.book.coverUrl ? (
                        <img src={journal.book.coverUrl} alt={journal.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-100 dark:bg-amber-900/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 truncate">{journal.book.title}</p>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug group-hover:text-amber-500 transition-colors">
                        {journal.title || 'Journal Entry'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{journal.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {journal.lessons.length > 0 && (
                          <span className="text-xs text-amber-500 font-medium">
                            {journal.lessons.length} key lesson{journal.lessons.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          journal.isPublic
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}>
                          {journal.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </div>
      )}

      {tab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-300 dark:text-gray-600">
              <PenLine className="w-12 h-12 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
            </div>
          ) : (
            myPosts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: readBooks.length, label: 'Books Read', sub: 'all time' },
            { value: shelf.length, label: 'In Library', sub: 'total' },
            { value: avgRating > 0 ? avgRating.toFixed(1) : '—', label: 'Avg Rating', sub: `from ${ratedBooks.length} rated` },
            { value: myPosts.length, label: 'Posts Shared', sub: 'with community' },
            { value: myJournals.length, label: 'Journal Entries', sub: 'written' },
            { value: readingBooks.length, label: 'Reading Now', sub: 'in progress' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="text-3xl font-black text-amber-500 mb-0.5">{s.value}</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{s.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
