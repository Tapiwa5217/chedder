'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import BookCard from '@/components/BookCard';
import Avatar from '@/components/Avatar';
import { Book } from '@/lib/types';
import { searchBooks } from '@/lib/openLibraryApi';
import {
  ArrowLeft, Globe, Lock, Users, Plus, Trash2, Search, X, UserPlus,
} from 'lucide-react';

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    currentUser, bookLists, users, getUserById,
    deleteList, updateList, addBookToList, removeBookFromList,
    followList, unfollowList,
  } = useApp();

  const list = bookLists.find((l) => l.id === id);
  const [addingBook, setAddingBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!list) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">List not found.</p>
        <Link href="/profile" className="text-sm text-amber-500 hover:underline mt-2 inline-block">← Back to profile</Link>
      </div>
    );
  }

  const owner = getUserById(list.userId);
  const isOwner = list.userId === currentUser.id;
  const isFollowing = list.followers.includes(currentUser.id);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const books = await searchBooks(searchQuery.trim());
      setSearchResults(books.filter((b) => !list.books.find((lb) => lb.id === b.id)));
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const handleAddBook = async (book: Book) => {
    await addBookToList(list.id, book);
    setSearchResults((prev) => prev.filter((b) => b.id !== book.id));
  };

  const handleStartEdit = () => {
    setEditTitle(list.title);
    setEditDescription(list.description ?? '');
    setEditIsPublic(list.isPublic);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    await updateList(list.id, {
      title: editTitle.trim() || list.title,
      description: editDescription.trim() || undefined,
      isPublic: editIsPublic,
    });
    setSaving(false);
    setEditing(false);
  };

  const followerUsers = list.followers
    .map((uid) => users.find((u) => u.id === uid))
    .filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* List header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-4">
        {editing ? (
          <div className="space-y-4">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-black bg-transparent border-b-2 border-amber-400 outline-none text-gray-900 dark:text-gray-100 pb-1"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              placeholder="Description…"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none text-gray-700 dark:text-gray-300 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditIsPublic(true)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${editIsPublic ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Public
              </button>
              <button
                onClick={() => setEditIsPublic(false)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${!editIsPublic ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
              >
                <Lock className="w-3.5 h-3.5" /> Private
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} disabled={saving} className="text-sm px-5 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-tight">{list.title}</h1>
                {list.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{list.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={handleStartEdit} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg">
                    Edit
                  </button>
                  <button
                    onClick={async () => { await deleteList(list.id); window.history.back(); }}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              {owner && (
                <Link href={owner.id === currentUser.id ? '/profile' : `/profile/${owner.username}`} className="flex items-center gap-2 group">
                  <Avatar initials={owner.avatar} size="sm" colorSeed={owner.id} avatarUrl={owner.avatarUrl} />
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-amber-500 transition-colors text-xs font-medium">{owner.name}</span>
                </Link>
              )}
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
                {list.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {list.isPublic ? 'Public' : 'Private'}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">{list.books.length} book{list.books.length !== 1 ? 's' : ''}</span>
              {followerUsers.length > 0 && (
                <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
                  <Users className="w-3 h-3" /> {followerUsers.length} following
                </span>
              )}
            </div>

            {/* Follow / unfollow for non-owners */}
            {!isOwner && list.isPublic && (
              <div className="mt-4">
                <button
                  onClick={() => isFollowing ? unfollowList(list.id) : followList(list.id)}
                  className={`flex items-center gap-2 text-sm px-5 py-2 rounded-xl font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {isFollowing ? (
                    <><X className="w-4 h-4" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow collection</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add book section (owners only) */}
      {isOwner && (
        <div className="mb-4">
          {!addingBook ? (
            <button
              onClick={() => setAddingBook(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 border border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" /> Add a book
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for a book to add…"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
                <button onClick={handleSearch} disabled={searching || !searchQuery.trim()} className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors">
                  {searching ? '…' : 'Search'}
                </button>
                <button onClick={() => { setAddingBook(false); setSearchQuery(''); setSearchResults([]); }} className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {searchResults.map((book) => (
                    <div key={book.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {book.coverUrl && <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{book.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{book.author}</p>
                      </div>
                      <button
                        onClick={() => handleAddBook(book)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Books */}
      <div className="space-y-3">
        {list.books.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No books yet</p>
            {isOwner && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add some books to get this list started</p>}
          </div>
        ) : (
          list.books.map((book) => (
            <div key={book.id} className="relative">
              <BookCard book={book} />
              {isOwner && (
                <button
                  onClick={() => removeBookFromList(list.id, book.id)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-700 transition-colors shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
