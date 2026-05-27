'use client';

import Link from 'next/link';
import { Book, ShelfType } from '@/lib/types';
import { useApp } from '@/lib/context';
import { BookOpen } from 'lucide-react';

const SHELF_LABELS: Record<ShelfType, string> = {
  wishlist: 'Wishlist',
  reading: 'Reading',
  read: 'Read',
};

const SHELF_BADGE: Record<ShelfType, string> = {
  wishlist: 'bg-amber-100 text-amber-700',
  reading: 'bg-blue-100 text-blue-700',
  read: 'bg-emerald-100 text-emerald-700',
};

type BookCardProps = {
  book: Book;
  showActions?: boolean;
};

export default function BookCard({ book, showActions = true }: BookCardProps) {
  const { getShelfEntry, addToShelf, removeFromShelf } = useApp();
  const entry = getShelfEntry(book.id);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4">
      <Link href={`/books/${book.id}`} className="flex-shrink-0">
        <div className="w-16 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/books/${book.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>
        {book.year && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{book.year}</p>}
        {book.subjects && book.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.subjects.slice(0, 3).map((s) => (
              <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        {showActions && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {entry ? (
              <>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SHELF_BADGE[entry.shelf]}`}>
                  {SHELF_LABELS[entry.shelf]}
                </span>
                <button
                  onClick={() => removeFromShelf(book.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {(['wishlist', 'reading', 'read'] as ShelfType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => addToShelf(book, s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors"
                  >
                    + {SHELF_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
