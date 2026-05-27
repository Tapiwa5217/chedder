'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import { mockBooks } from '@/lib/mockData';
import BookCarousel from '@/components/BookCarousel';

export default function LandingPage() {
  const { shelf, posts, currentUser } = useApp();

  const readingBooks = shelf.filter((e) => e.shelf === 'reading').map((e) => e.book);
  const wishlistBooks = shelf.filter((e) => e.shelf === 'wishlist').map((e) => e.book);

  const followingIds = new Set(currentUser.following);
  const friendBookIds = new Set(
    posts
      .filter((p) => followingIds.has(p.userId) && p.book)
      .map((p) => p.book!.id)
  );
  const friendBooks = mockBooks.filter((b) => friendBookIds.has(b.id));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-amber-900 to-slate-900 px-8 py-16 md:px-16 md:py-20 mb-12">
        {/* Background book covers */}
        <div className="absolute inset-0 pointer-events-none">
          {mockBooks
            .slice(0, 5)
            .filter((b) => b.coverUrl)
            .map((book, i) => (
              <img
                key={book.id}
                src={book.coverUrl}
                alt=""
                aria-hidden="true"
                className="absolute rounded-xl object-cover opacity-20 shadow-2xl"
                style={{
                  width: `${[130, 110, 120, 100, 115][i]}px`,
                  top: `${[8, 50, 10, 55, 30][i]}%`,
                  right: `${[4, 18, 34, 50, 65][i]}%`,
                  transform: `rotate(${[-6, 4, -9, 6, -3][i]}deg)`,
                }}
              />
            ))}
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 backdrop-blur">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Your reading community is waiting
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-[1.05] tracking-tight">
            Reading is better
            <br />
            <span className="text-amber-300">together.</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-md">
            Discover books through trusted networks. Track your journey. Share insights with
            people who inspire you.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/explore"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-semibold transition-colors text-sm shadow-lg shadow-amber-800/40"
            >
              Explore Books
            </Link>
            <Link
              href="/feed"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors text-sm backdrop-blur border border-white/10"
            >
              View Feed
            </Link>
          </div>
        </div>
      </div>

      {/* Continue reading */}
      {readingBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Continue Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readingBooks.map((book) => {
              const entry = shelf.find((e) => e.book.id === book.id);
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-4 flex gap-4 items-start"
                >
                  <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                    {book.coverUrl && (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug group-hover:text-amber-500 transition-colors">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className="bg-amber-500 h-1 rounded-full transition-all"
                          style={{ width: `${entry?.progress ?? 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{entry?.progress ?? 0}% complete</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {friendBooks.length > 0 && (
        <BookCarousel title="Friends Are Reading" books={friendBooks} />
      )}

      <BookCarousel title="Trending This Week" books={mockBooks} />

      {wishlistBooks.length > 0 && (
        <BookCarousel title="Your Wishlist" books={wishlistBooks} />
      )}

      {/* Stats banner */}
      <div className="mt-4 grid grid-cols-3 gap-4 mb-2">
        {[
          { value: '2.4M+', label: 'Books Tracked' },
          { value: '180K+', label: 'Readers' },
          { value: '500K+', label: 'Reviews Shared' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
          >
            <div className="text-2xl font-black text-amber-500">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
