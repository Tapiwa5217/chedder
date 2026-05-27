'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { useApp } from '@/lib/context';
import { BookOpen } from 'lucide-react';

export default function BookCarousel({ title, books }: { title: string; books: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getShelfEntry } = useApp();

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  if (books.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 px-0.5">{title}</h2>
      <div className="relative group/row">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg opacity-0 group-hover/row:opacity-100 transition-opacity -translate-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
        >
          {books.map((book) => {
            const entry = getShelfEntry(book.id);
            return (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group/card flex-shrink-0 w-32 sm:w-36"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md group-hover/card:shadow-xl transition-all duration-300 group-hover/card:-translate-y-1 bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: '2/3' }}>
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                      <BookOpen className="w-8 h-8 text-amber-300" />
                    </div>
                  )}
                  {entry && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{book.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">{book.author}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg opacity-0 group-hover/row:opacity-100 transition-opacity translate-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
