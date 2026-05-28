'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import OfficialBadge from '@/components/OfficialBadge';
import BookCard from '@/components/BookCard';
import PostCard from '@/components/PostCard';
import StarRating from '@/components/StarRating';
import { useChatContext } from '@/lib/chatContext';
import { ShelfEntry, ShelfType } from '@/lib/types';
import { User, BookOpen, CheckCircle2, Bookmark, Library, PenLine, NotebookText, MessageCircle } from 'lucide-react';

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

function mapShelfEntry(e: Record<string, unknown>): ShelfEntry {
  const book = e.book as Record<string, unknown>;
  return {
    book: {
      id: book.id as string,
      title: book.title as string,
      author: book.author as string,
      coverUrl: (book.cover_url as string) ?? undefined,
      description: (book.description as string) ?? undefined,
      year: (book.year as number) ?? undefined,
      pages: (book.pages as number) ?? undefined,
    },
    shelf: e.shelf as ShelfType,
    addedAt: e.added_at as string,
    rating: (e.rating as number) ?? undefined,
    review: (e.review as string) ?? undefined,
    progress: (e.progress as number) ?? undefined,
  };
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { users, currentUser, posts, journals, isFollowing, followUser, unfollowUser } = useApp();
  const { openChat } = useChatContext();
  const supabase = createClient();
  const [tab, setTab] = useState<'shelves' | 'posts' | 'journal'>('posts');
  const [userShelf, setUserShelf] = useState<ShelfEntry[]>([]);

  const user = users.find((u) => u.username === username);

  // Fetch user's shelf when we know who they are
  useEffect(() => {
    if (!user) return;
    supabase
      .from('shelf_entries')
      .select('id, book_id, shelf, added_at, rating, review, progress, book:books(*)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setUserShelf((data as Record<string, unknown>[]).map(mapShelfEntry));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="flex justify-center mb-4">
          <User className="w-12 h-12 text-gray-200 dark:text-gray-700" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">User not found</h1>
        <Link href="/friends" className="text-sm text-amber-500 hover:underline">
          Discover readers
        </Link>
      </div>
    );
  }

  // Redirect to own profile if viewing yourself
  if (user.id === currentUser.id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 text-sm">This is your own profile.</p>
        <Link href="/profile" className="text-sm text-amber-500 hover:underline mt-2 inline-block">
          Go to My Profile →
        </Link>
      </div>
    );
  }

  const following = isFollowing(user.id);
  const userPosts = posts
    .filter((p) => p.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Only show public journals
  const userJournals = journals.filter((j) => j.userId === user.id && j.isPublic);

  const readingBooks  = userShelf.filter((e) => e.shelf === 'reading');
  const readBooks     = userShelf.filter((e) => e.shelf === 'read');
  const wishlistBooks = userShelf.filter((e) => e.shelf === 'wishlist');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
        {/* Banner / cover photo */}
        {user.coverUrl ? (
          <img src={user.coverUrl} alt="" className="h-44 w-full object-cover" />
        ) : (
          <div className={`h-44 bg-gradient-to-br ${coverGradient(user.id)}`} />
        )}

        <div className="px-8 pb-6">
          {/* Avatar — overlaps banner */}
          <div className="-mt-12 mb-4 flex items-end justify-between flex-wrap gap-4">
            <div className="w-20 h-20 rounded-full border-[3px] border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
              <Avatar initials={user.avatar} colorSeed={user.id} avatarUrl={user.avatarUrl} className="w-full h-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => (following ? unfollowUser(user.id) : followUser(user.id))}
                className={`text-sm px-5 py-2 rounded-xl font-semibold transition-colors ${
                  following
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 border border-gray-200 dark:border-gray-700'
                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                }`}
              >
                {following ? 'Following' : '+ Follow'}
              </button>
              <button
                onClick={() => openChat(user.id)}
                className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</h1>
            {user.isOfficial && <OfficialBadge size="md" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed max-w-lg">{user.bio}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{user.followers.length}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1.5">followers</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{user.following.length}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1.5">following</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{userPosts.length}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1.5">posts</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{readBooks.length}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1.5">books read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — official accounts only show Posts */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6 bg-white dark:bg-gray-900 rounded-t-2xl px-2">
        {(user.isOfficial
          ? [{ key: 'posts' as const, label: 'Posts' }]
          : [
              { key: 'shelves' as const, label: 'Shelves' },
              { key: 'posts'   as const, label: 'Posts'   },
              { key: 'journal' as const, label: 'Journal' },
            ]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 pt-3 px-5 text-sm font-semibold transition-colors ${
              tab === key
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
            {key === 'journal' && userJournals.length > 0 && (
              <span className="ml-1.5 text-xs bg-amber-100 text-amber-500 px-1.5 py-0.5 rounded-full">
                {userJournals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shelves tab — real shelf data */}
      {tab === 'shelves' && (
        <div className="space-y-8">
          {readingBooks.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Currently Reading
              </h2>
              <div className="space-y-3">
                {readingBooks.map((e) => (
                  <div key={e.book.id}>
                    <BookCard book={e.book} showActions={false} />
                    {e.progress != null && (
                      <div className="mt-1.5 px-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums">{e.progress}%</span>
                      </div>
                    )}
                  </div>
                ))}
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
                    <BookCard book={e.book} showActions={false} />
                    {e.rating && (
                      <div className="mt-1.5 px-4">
                        <StarRating value={e.rating} readonly size="sm" />
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
                <Bookmark className="w-5 h-5 text-amber-500" /> Want to Read
              </h2>
              <div className="space-y-3">
                {wishlistBooks.map((e) => <BookCard key={e.book.id} book={e.book} showActions={false} />)}
              </div>
            </section>
          )}
          {userShelf.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-center mb-3">
                <Library className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No books on shelf yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {user.name.split(' ')[0]} hasn't added any books yet
              </p>
            </div>
          )}
        </div>
      )}

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-center mb-3">
                <PenLine className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Journal tab — public entries only */}
      {tab === 'journal' && (
        <div className="space-y-4">
          {userJournals.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-center mb-3">
                <NotebookText className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No public journal entries</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {user.name.split(' ')[0]} hasn't shared any journal entries publicly yet
              </p>
            </div>
          ) : (
            userJournals.map((journal) => (
              <Link key={journal.id} href={`/books/${journal.bookId}`} className="block group">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4">
                  <div className="flex-shrink-0 w-14 h-20 rounded-xl overflow-hidden shadow-md">
                    {journal.book.coverUrl ? (
                      <img src={journal.book.coverUrl} alt={journal.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{journal.book.title}</p>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug group-hover:text-amber-500 transition-colors">
                      {journal.title || 'Journal Entry'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{journal.content}</p>
                    {journal.lessons.length > 0 && (
                      <p className="text-xs text-amber-500 mt-2">
                        {journal.lessons.length} key lesson{journal.lessons.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
