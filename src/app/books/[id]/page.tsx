'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { fetchBookById } from '@/lib/openLibraryApi';
import { Book, ShelfType } from '@/lib/types';
import StarRating from '@/components/StarRating';
import PostCard from '@/components/PostCard';
import BookAccessLinks from '@/components/BookAccessLinks';
import BookJournalEditor from '@/components/BookJournalEditor';
import { Library, BookOpen } from 'lucide-react';

const SHELF_LABELS: Record<ShelfType, string> = {
  wishlist: 'Wishlist',
  reading: 'Reading',
  read: 'Read',
};

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { shelf, addToShelf, removeFromShelf, moveShelf, updateEntry, posts } = useApp();

  const shelfBook = shelf.find((e) => e.book.id === id)?.book;
  const [book, setBook] = useState<Book | null | undefined>(shelfBook);
  const [fetching, setFetching] = useState(!shelfBook);

  useEffect(() => {
    if (shelfBook) { setBook(shelfBook); return; }
    setFetching(true);
    fetchBookById(id).then((b) => {
      setBook(b);
      setFetching(false);
    });
  }, [id, shelfBook]);

  const entry = shelf.find((e) => e.book.id === id);
  const bookPosts = posts.filter((p) => p.book?.id === id);

  if (fetching) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="rounded-3xl bg-gray-100 dark:bg-gray-800 h-72 mb-8" />
        <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3 mb-3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="flex justify-center mb-4">
          <Library className="w-12 h-12 text-gray-200 dark:text-gray-700" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Book not found</h1>
        <Link href="/explore" className="text-sm text-amber-500 hover:underline">
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero section — intentionally dark, keep as-is */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 mb-8">
        {/* Blurred background cover */}
        {book.coverUrl && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center scale-110 blur-2xl"
            style={{ backgroundImage: `url(${book.coverUrl})` }}
          />
        )}
        <div className="relative z-10 flex gap-8 p-8 md:p-12 flex-wrap">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="w-36 md:w-44 rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '2/3' }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <BookOpen className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
              {book.title}
            </h1>
            <p className="text-gray-300 text-lg mb-3">{book.author}</p>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              {book.year && <span>{book.year}</span>}
              {book.pages && <span>{book.pages} pages</span>}
            </div>

            {book.subjects && book.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {book.subjects.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full backdrop-blur border border-white/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Shelf actions */}
            {entry ? (
              <div className="flex flex-wrap items-center gap-2">
                {(['wishlist', 'reading', 'read'] as ShelfType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => moveShelf(book.id, s)}
                    className={`text-sm px-4 py-2 rounded-xl font-semibold transition-all ${
                      entry.shelf === s
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {SHELF_LABELS[s]}
                  </button>
                ))}
                <button
                  onClick={() => removeFromShelf(book.id)}
                  className="text-sm text-white/40 hover:text-red-400 px-3 py-2 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(['wishlist', 'reading', 'read'] as ShelfType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => addToShelf(book, s)}
                    className="text-sm px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 border border-white/10 font-medium transition-all"
                  >
                    + {SHELF_LABELS[s]}
                  </button>
                ))}
              </div>
            )}

            {entry?.shelf === 'reading' && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-white/70 flex-shrink-0">Progress</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={entry.progress ?? 0}
                  onChange={(e) => updateEntry(book.id, { progress: Number(e.target.value) })}
                  className="flex-1 h-1.5 accent-amber-400 cursor-pointer"
                />
                <span className="text-sm text-white/70 w-10 text-right tabular-nums flex-shrink-0">
                  {entry.progress ?? 0}%
                </span>
              </div>
            )}

            {entry?.shelf === 'read' && (
              <div className="mt-4">
                <StarRating
                  value={entry.rating ?? 0}
                  onChange={(v) => updateEntry(book.id, { rating: v })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">About this book</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Two-column: Journal + Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">My Journal</h2>
          <BookJournalEditor book={book} />
        </div>
        <div>
          <BookAccessLinks book={book} />
        </div>
      </div>

      {/* Community */}
      {bookPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Community ({bookPosts.length})
          </h2>
          <div className="space-y-4">
            {bookPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
