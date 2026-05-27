'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { ArrowLeft, Globe, Lock } from 'lucide-react';

export default function CreateListPage() {
  const { createList } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError('');
    try {
      const id = await createList(title.trim(), description.trim() || undefined, isPublic);
      if (id) router.push(`/lists/${id}`);
      else setError('Failed to create collection — make sure the database tables are set up.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to profile
      </Link>

      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">Create a collection</h1>

      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Collection title *</label>
          <input
            type="text"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Top 10 Books for Entrepreneurs"'
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
            placeholder="What is this list about? Who is it for?"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</p>
          <div className="flex gap-3">
            {[
              { value: true,  Icon: Globe, label: 'Public', desc: 'Anyone can view and follow this list' },
              { value: false, Icon: Lock,  label: 'Private', desc: 'Only you can see this list' },
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
            disabled={creating || !title.trim()}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create collection'}
          </button>
          <Link href="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
