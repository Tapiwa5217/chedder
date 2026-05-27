'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Book } from '@/lib/types';
import { searchBooks } from '@/lib/openLibraryApi';
import { ArrowLeft, Search, X, Globe, Lock } from 'lucide-react';

export default function CreateGroupPage() {
  const { createGroup } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleBookSearch = async () => {
    if (!bookQuery.trim()) return;
    setSearchingBooks(true);
    try {
      const books = await searchBooks(bookQuery.trim());
      setBookResults(books.slice(0, 8));
    } catch { setBookResults([]); }
    setSearchingBooks(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const id = await createGroup(name.trim(), description.trim() || undefined, selectedBook ?? undefined, isPublic);
      if (id) router.push(`/groups/${id}`);
      else setError('Failed to create group — make sure the database tables are set up.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to groups
      </Link>

      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">Create a book group</h1>

      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Group name *</label>
          <input
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Philosophy Book Club"'
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What will this group read and discuss?"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Optional featured book */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Featured book (optional)</label>
          {selectedBook ? (
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50">
              {selectedBook.coverUrl && (
                <img src={selectedBook.coverUrl} alt="" className="w-10 h-14 rounded-lg object-cover flex-shrink-0 shadow-sm" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{selectedBook.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedBook.author}</p>
              </div>
              <button type="button" onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBookSearch())}
                    placeholder="Search for a book…"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 placeholder-gray-400"
                  />
                </div>
                <button type="button" onClick={handleBookSearch} disabled={searchingBooks || !bookQuery.trim()} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  {searchingBooks ? '…' : 'Search'}
                </button>
              </div>
              {bookResults.length > 0 && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {bookResults.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => { setSelectedBook(book); setBookResults([]); setBookQuery(''); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="w-8 h-11 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {book.coverUrl && <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{book.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{book.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Who can join?</p>
          <div className="flex gap-3">
            {[
              { value: false, Icon: Lock, label: 'Private', desc: 'Invite only — you control who joins' },
              { value: true,  Icon: Globe, label: 'Public', desc: 'Anyone can discover and join this group' },
            ].map(({ value, Icon, label, desc }) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsPublic(value)}
                className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                  isPublic === value
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isPublic === value ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <div>
                  <p className={`text-sm font-semibold ${isPublic === value ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create group'}
          </button>
          <Link href="/groups" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
