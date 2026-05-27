'use client';

import { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';
import BookCarousel from '@/components/BookCarousel';
import { searchBooks, fetchTopBySubject } from '@/lib/openLibraryApi';
import { Book } from '@/lib/types';
import { Search, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

// OL subject slugs → sorted by readinglog (most want-to-read / already-read)
const GENRES = [
  { label: 'Self-Help & Productivity', subject: 'self_help' },
  { label: 'Philosophy & Ideas',       subject: 'philosophy' },
  { label: 'History & Biography',      subject: 'biography' },
  { label: 'Science & Nature',         subject: 'science' },
  { label: 'Fiction & Literature',     subject: 'fiction' },
  { label: 'Business & Economics',     subject: 'business_and_economics' },
  { label: 'Psychology',               subject: 'psychology' },
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [genreBooks, setGenreBooks] = useState<Record<string, Book[]>>({});

  // Load top books per genre on mount — staggered to avoid hammering the API
  useEffect(() => {
    GENRES.forEach(async ({ label, subject }, i) => {
      await new Promise((r) => setTimeout(r, i * 300)); // 300ms stagger
      try {
        const books = await fetchTopBySubject(subject, 14);
        // Prefer books with covers so the row looks full
        const withCover = books.filter((b) => b.coverUrl);
        const withoutCover = books.filter((b) => !b.coverUrl);
        setGenreBooks((prev) => ({
          ...prev,
          [label]: [...withCover, ...withoutCover].slice(0, 12),
        }));
      } catch {
        // silently skip failed genre
      }
    });
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(false);
    try {
      const books = await searchBooks(query.trim());
      setResults(books);
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">Explore</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Search millions of books from the Open Library</p>
        </div>
        <Link
          href="/recommendations"
          className="flex items-center gap-2 text-sm px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-700/50"
        >
          <Sparkles className="w-4 h-4" /> For you
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title, author, or topic..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 text-sm shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3.5 bg-amber-500 text-white rounded-2xl font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors text-sm shadow-sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? 'Searching Open Library...'
                : error
                ? 'Search failed. Check your connection.'
                : `${results.length} results for "${query}"`}
            </p>
            <button onClick={clearSearch} className="text-sm text-amber-500 hover:underline">
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {results.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {GENRES.map(({ label }) => (
            genreBooks[label]?.length ? (
              <BookCarousel key={label} title={label} books={genreBooks[label]} />
            ) : (
              /* Skeleton row while loading */
              <div key={label} className="mb-8">
                <div className="h-5 w-48 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-28">
                      <div className="w-28 h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-full animate-pulse mb-1" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
