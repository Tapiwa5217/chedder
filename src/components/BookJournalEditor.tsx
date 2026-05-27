'use client';

import { useState } from 'react';
import { Book } from '@/lib/types';
import { useApp } from '@/lib/context';
import { NotebookText, Globe, Lock, ChevronRight, X } from 'lucide-react';

export default function BookJournalEditor({ book }: { book: Book }) {
  const { getJournalForBook, addJournal, updateJournal, deleteJournal } = useApp();
  const existing = getJournalForBook(book.id);

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [lessonInput, setLessonInput] = useState('');
  const [lessons, setLessons] = useState<string[]>(existing?.lessons ?? []);
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? false);

  const openEditor = () => {
    setTitle(existing?.title ?? '');
    setContent(existing?.content ?? '');
    setLessons(existing?.lessons ?? []);
    setIsPublic(existing?.isPublic ?? false);
    setMode('edit');
  };

  const save = () => {
    if (existing) {
      updateJournal(existing.id, { title, content, lessons, isPublic });
    } else {
      addJournal({ bookId: book.id, book, title, content, lessons, isPublic });
    }
    setMode('view');
  };

  const addLesson = () => {
    if (!lessonInput.trim()) return;
    setLessons((prev) => [...prev, lessonInput.trim()]);
    setLessonInput('');
  };

  if (mode === 'edit') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
            <NotebookText className="w-5 h-5 text-amber-500" /> My Journal
          </h3>
          {existing && (
            <button
              onClick={() => setMode('view')}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`My notes on "${book.title}"...`}
          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent mb-4 placeholder-gray-300 dark:placeholder-gray-600"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your full thoughts, reflections, and review of this book. What moved you? What challenged you? What will you apply?"
          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent resize-none leading-relaxed placeholder-gray-300 dark:placeholder-gray-600"
          rows={9}
        />

        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">
            Key Lessons
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={lessonInput}
              onChange={(e) => setLessonInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLesson()}
              placeholder="One key lesson or insight — press Enter to add"
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent placeholder-gray-300 dark:placeholder-gray-600"
            />
            <button
              onClick={addLesson}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Add
            </button>
          </div>
          {lessons.length > 0 && (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3.5 py-2.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{lesson}</span>
                  <button
                    onClick={() => setLessons(lessons.filter((_, j) => j !== i))}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className="flex items-center gap-2.5 group"
          >
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${
                isPublic ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  isPublic ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              {isPublic
                ? <><Globe className="w-4 h-4 text-emerald-500" /> Visible to everyone</>
                : <><Lock className="w-4 h-4 text-gray-400" /> Only you can see this</>
              }
            </span>
          </button>

          <div className="flex gap-2">
            {existing && (
              <button
                onClick={() => {
                  deleteJournal(existing.id);
                  setMode('view');
                }}
                className="text-sm text-red-400 hover:text-red-600 px-3 py-2 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={save}
              disabled={!content.trim()}
              className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors"
            >
              Save Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!existing) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center hover:border-amber-200 dark:hover:border-amber-700 transition-colors group">
        <div className="flex justify-center mb-3">
          <NotebookText className="w-12 h-12 text-gray-300 dark:text-gray-600 group-hover:text-amber-300 transition-colors" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Write a Journal Entry</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 leading-relaxed">
          Document your thoughts, key lessons, and reflections on this book. Make it private or share it with your network.
        </p>
        <button
          onClick={openEditor}
          className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          Start Writing
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
            {existing.title || 'My Journal Entry'}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                existing.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {existing.isPublic
                ? <><Globe className="w-3 h-3" /> Public</>
                : <><Lock className="w-3 h-3" /> Private</>
              }
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(existing.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <button
          onClick={openEditor}
          className="text-sm text-amber-500 hover:text-amber-700 font-medium transition-colors"
        >
          Edit
        </button>
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{existing.content}</p>

      {existing.lessons.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-50 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Key Lessons
          </p>
          <ul className="space-y-2">
            {existing.lessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
