'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { searchBooks } from '@/lib/openLibraryApi';
import { Book } from '@/lib/types';
import { NotebookText, Plus, Globe, Lock, ChevronRight, BookOpen, X, Search } from 'lucide-react';

export default function JournalPage() {
  const { journals, currentUser } = useApp();

  const myJournals = journals
    .filter((j) => j.userId === currentUser.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Book picker state
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchBooks(query);
        setResults(r.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const closePicker = () => {
    setShowPicker(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">My Journal</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {myJournals.length} {myJournals.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Book picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closePicker}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Choose a book</h2>
              <button
                onClick={closePicker}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Search for a book to start a journal entry. You can write your thoughts on its page.
            </p>

            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {searching && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Searching…</p>
              )}
              {!searching && !query.trim() && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Type to search for a book
                </p>
              )}
              {!searching && query.trim() && results.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No books found</p>
              )}
              {!searching &&
                results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onClick={closePicker}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt=""
                        className="w-8 h-12 rounded object-cover flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-12 rounded bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{book.author}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {myJournals.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-center mb-4">
            <NotebookText className="w-14 h-14 text-gray-200 dark:text-gray-700" />
          </div>
          <p className="font-semibold text-gray-500 dark:text-gray-400">No journal entries yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">
            Click "New Entry" to start writing about a book
          </p>
          <button
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Start writing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {myJournals.map((journal) => (
            <Link key={journal.id} href={`/books/${journal.bookId}`} className="block group">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all p-5 flex gap-4">
                {/* Book cover */}
                <div className="flex-shrink-0 w-14 h-20 rounded-xl overflow-hidden shadow-md">
                  {journal.book.coverUrl ? (
                    <img
                      src={journal.book.coverUrl}
                      alt={journal.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {journal.book.title}
                      </p>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors text-sm leading-snug mt-0.5">
                        {journal.title || 'Journal Entry'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                          journal.isPublic
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {journal.isPublic ? (
                          <>
                            <Globe className="w-3 h-3" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" /> Private
                          </>
                        )}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(journal.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {journal.content}
                  </p>

                  {journal.lessons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {journal.lessons.slice(0, 2).map((lesson, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full"
                        >
                          <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{lesson}</span>
                        </span>
                      ))}
                      {journal.lessons.length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                          +{journal.lessons.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
