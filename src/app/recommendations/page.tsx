'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import BookCard from '@/components/BookCard';
import Avatar from '@/components/Avatar';
import { Book } from '@/lib/types';
import { Sparkles, BookOpen, Users } from 'lucide-react';

type ScoredBook = {
  book: Book;
  score: number;
  reasons: string[];
};

function useRecommendations(): ScoredBook[] {
  const { currentUser, shelf, posts, users } = useApp();

  return useMemo(() => {
    const userBookIds = new Set(shelf.map((e) => e.book.id));

    // Build subject interest map from user's shelf (weighted by shelf type)
    const subjectWeights: Record<string, number> = {};
    for (const entry of shelf) {
      const weight = entry.shelf === 'reading' ? 3 : entry.shelf === 'read' ? 2 : 1;
      for (const s of (entry.book.subjects ?? [])) {
        subjectWeights[s.toLowerCase()] = (subjectWeights[s.toLowerCase()] ?? 0) + weight;
      }
    }

    // Build network activity from posts
    const followedUserIds = new Set(currentUser.following);
    const networkFinished = new Map<string, string[]>(); // bookId → userNames
    const networkReading  = new Map<string, string[]>(); // bookId → userNames

    for (const post of posts) {
      if (!post.book || !followedUserIds.has(post.userId)) continue;
      const authorName = users.find((u) => u.id === post.userId)?.name ?? '';
      if (post.type === 'finished' || post.type === 'review') {
        const arr = networkFinished.get(post.book.id) ?? [];
        if (!arr.includes(authorName)) arr.push(authorName);
        networkFinished.set(post.book.id, arr);
      } else if (post.type === 'started' || post.type === 'update') {
        const arr = networkReading.get(post.book.id) ?? [];
        if (!arr.includes(authorName)) arr.push(authorName);
        networkReading.set(post.book.id, arr);
      }
    }

    // Score all books from posts that aren't on user's shelf
    const bookScores = new Map<string, ScoredBook>();

    for (const post of posts) {
      if (!post.book || userBookIds.has(post.book.id)) continue;
      const b = post.book;
      const existing = bookScores.get(b.id) ?? { book: b, score: 0, reasons: [] };

      // Subject overlap score
      let subjectScore = 0;
      for (const s of (b.subjects ?? [])) {
        subjectScore += subjectWeights[s.toLowerCase()] ?? 0;
      }
      existing.score += Math.min(subjectScore * 0.5, 6);

      // Network activity
      const finishedBy = networkFinished.get(b.id) ?? [];
      const readingBy  = networkReading.get(b.id) ?? [];

      if (finishedBy.length > 0) {
        existing.score += finishedBy.length * 5;
        const names = finishedBy.slice(0, 2).join(', ');
        const r = `${names} finished this`;
        if (!existing.reasons.includes(r)) existing.reasons.push(r);
      }
      if (readingBy.length > 0) {
        existing.score += readingBy.length * 3;
        const names = readingBy.slice(0, 2).join(', ');
        const r = `${names} is reading this`;
        if (!existing.reasons.includes(r)) existing.reasons.push(r);
      }

      // Community engagement
      existing.score += Math.min(post.likes.length * 0.3, 3);

      bookScores.set(b.id, existing);
    }

    return Array.from(bookScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);
  }, [currentUser, shelf, posts, users]);
}

export default function RecommendationsPage() {
  const { currentUser, shelf, posts, users } = useApp();
  const recommendations = useRecommendations();
  const [activeFilter, setActiveFilter] = useState<'all' | 'network' | 'similar'>('all');

  // People reading similar things to you
  const similarReaders = useMemo(() => {
    const userSubjects = new Set(
      shelf.flatMap((e) => (e.book.subjects ?? []).map((s) => s.toLowerCase()))
    );
    if (userSubjects.size === 0) return [];

    return users
      .filter((u) => u.id !== currentUser.id)
      .map((u) => {
        const theirBooks = posts.filter((p) => p.userId === u.id && p.book);
        const overlap = theirBooks.filter((p) =>
          (p.book?.subjects ?? []).some((s) => userSubjects.has(s.toLowerCase()))
        ).length;
        return { user: u, overlap };
      })
      .filter((x) => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 6);
  }, [currentUser.id, shelf, posts, users]);

  const hasShelf = shelf.length > 0;
  const hasFollowing = currentUser.following.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Recommended</h1>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Personalised picks based on your reading tastes and your network's activity
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-8">
        {(['all', 'network', 'similar'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              activeFilter === f
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All picks' : f === 'network' ? 'From your network' : 'Similar interests'}
          </button>
        ))}
      </div>

      {/* Empty state if nothing on shelf + no following */}
      {!hasShelf && !hasFollowing && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-600 dark:text-gray-400 font-semibold mb-1">Nothing to recommend yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Add books to your library and follow other readers to unlock personalised picks
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/explore" className="text-sm px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
              Explore books
            </Link>
            <Link href="/friends" className="text-sm px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Find readers
            </Link>
          </div>
        </div>
      )}

      {/* Recommendations grid */}
      {recommendations.length > 0 && (activeFilter === 'all' || activeFilter === 'network' || activeFilter === 'similar') && (
        <section className="mb-10">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Books you might love
          </h2>
          <div className="space-y-3">
            {recommendations.map(({ book, reasons }) => (
              <div key={book.id}>
                <BookCard book={book} />
                {reasons.length > 0 && (
                  <div className="mt-1 px-4 flex flex-wrap gap-2">
                    {reasons.slice(0, 2).map((r) => (
                      <span key={r} className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-full">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {recommendations.length === 0 && (
            <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Keep adding books and following readers to get recommendations
              </p>
            </div>
          )}
        </section>
      )}

      {/* Similar readers */}
      {similarReaders.length > 0 && (activeFilter === 'all' || activeFilter === 'similar') && (
        <section>
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Readers with similar taste
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {similarReaders.map(({ user, overlap }) => (
              <Link key={user.id} href={`/profile/${user.username}`} className="block group">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-3">
                  <Avatar initials={user.avatar} size="sm" colorSeed={user.id} avatarUrl={user.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</p>
                    <p className="text-xs text-amber-500 mt-0.5">{overlap} book{overlap !== 1 ? 's' : ''} in common</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
