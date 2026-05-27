'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import { PostType, Book, ShelfType } from '@/lib/types';
import { searchBooks } from '@/lib/openLibraryApi';
import Avatar from './Avatar';
import StarRating from './StarRating';
import {
  PenLine, Star, MessageCircle, CheckCircle2, Rocket,
  Camera, BookOpen, Globe, ChevronDown, X, Maximize2, Minimize2,
  type LucideIcon,
} from 'lucide-react';

const POST_TYPES: { type: PostType; Icon: LucideIcon; label: string }[] = [
  { type: 'update',   Icon: PenLine,       label: 'Update'   },
  { type: 'review',   Icon: Star,          label: 'Review'   },
  { type: 'quote',    Icon: MessageCircle, label: 'Quote'    },
  { type: 'finished', Icon: CheckCircle2,  label: 'Finished' },
  { type: 'started',  Icon: Rocket,        label: 'Started'  },
];

const QUICK_ACTIONS: { Icon: LucideIcon; label: string; type: PostType }[] = [
  { Icon: Camera,        label: 'Photo',        type: 'update' },
  { Icon: BookOpen,      label: 'Add Book',     type: 'update' },
  { Icon: Star,          label: 'Write Review', type: 'review' },
  { Icon: MessageCircle, label: 'Share Quote',  type: 'quote'  },
];

export default function ComposeBox() {
  const { currentUser, addPost, addToShelf } = useApp();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('update');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookQuery, setBookQuery] = useState('');
  const [rating, setRating] = useState(0);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [bookSearching, setBookSearching] = useState(false);
  const [bookDisplay, setBookDisplay] = useState<'small' | 'big'>('small');

  // Image upload state
  const [imagePreview, setImagePreview] = useState('');   // local blob URL for preview
  const [uploadedImageUrl, setUploadedImageUrl] = useState(''); // Supabase public URL
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced book search
  useEffect(() => {
    if (!bookQuery.trim()) { setBookResults([]); return; }
    const timer = setTimeout(async () => {
      setBookSearching(true);
      try {
        const results = await searchBooks(bookQuery);
        setBookResults(results.slice(0, 8));
      } catch {
        setBookResults([]);
      } finally {
        setBookSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [bookQuery]);

  const openWith = (type: PostType) => {
    setPostType(type);
    setExpanded(true);
    if (['review', 'finished', 'started', 'quote'].includes(type)) setShowBookSearch(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Handle image file selection & upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `posts/${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      setUploadedImageUrl(data.publicUrl);
    } catch {
      // keep preview but no URL; post will use local preview only (won't persist after reload)
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setUploadedImageUrl('');
  };

  const handlePost = () => {
    if (!content.trim()) return;

    // Build encoded content
    let finalContent = content.trim();
    const imageUrl = uploadedImageUrl || imagePreview; // fall back to local URL if upload failed
    if (imageUrl) finalContent += `\n[img]${imageUrl}`;
    if (selectedBook && bookDisplay === 'big') finalContent += '\n[bigcover]';

    addPost({
      type: postType,
      content: finalContent,
      book: selectedBook ?? undefined,
      rating: postType === 'review' ? rating : undefined,
    });

    if (selectedBook && postType === 'finished') addToShelf(selectedBook, 'read' as ShelfType);
    if (selectedBook && postType === 'started')  addToShelf(selectedBook, 'reading' as ShelfType);

    reset();
  };

  const reset = () => {
    setContent('');
    setSelectedBook(null);
    setBookQuery('');
    setBookResults([]);
    setRating(0);
    setShowBookSearch(false);
    setExpanded(false);
    setPostType('update');
    removeImage();
    setBookDisplay('small');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-4 overflow-hidden">
      {!expanded ? (
        /* ── Collapsed ── */
        <div>
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <Avatar initials={currentUser.avatar} colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
            <button
              onClick={() => setExpanded(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              What are you reading?
            </button>
          </div>
          <div className="flex items-center border-t border-gray-50 dark:border-gray-800 px-2 pb-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => openWith(a.type)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <a.Icon className="w-4 h-4" />
                <span className="hidden sm:block">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Expanded ── */
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={currentUser.avatar} colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentUser.name}</p>
              <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full mt-0.5">
                <Globe className="w-3 h-3" /> Anyone <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Post type selector */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.type}
                onClick={() => setPostType(pt.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  postType === pt.type
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <pt.Icon className="w-3.5 h-3.5" /> {pt.label}
              </button>
            ))}
          </div>

          {/* Book search */}
          {(showBookSearch || selectedBook) && (
            <div className="mb-3">
              {selectedBook ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5">
                    {selectedBook.coverUrl && (
                      <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-8 h-11 rounded object-cover shadow-sm flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 line-clamp-1">{selectedBook.title}</p>
                      <p className="text-xs text-amber-500">{selectedBook.author}</p>
                    </div>
                    <button onClick={() => { setSelectedBook(null); setBookQuery(''); }} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Book tag size toggle */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Book tag size:</span>
                    <button
                      onClick={() => setBookDisplay('small')}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${bookDisplay === 'small' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                    >
                      <Minimize2 className="w-3 h-3" /> Small circle
                    </button>
                    <button
                      onClick={() => setBookDisplay('big')}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${bookDisplay === 'big' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                    >
                      <Maximize2 className="w-3 h-3" /> Full cover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                    placeholder="Search for a book..."
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-200 placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                  {(bookSearching || bookResults.length > 0) && bookQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                      {bookSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                      ) : bookResults.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => { setSelectedBook(book); setBookQuery(''); setBookResults([]); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt="" className="w-7 h-10 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-10 rounded bg-amber-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{book.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{book.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Star rating */}
          {postType === 'review' && (
            <div className="flex items-center gap-3 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Your rating</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <img src={imagePreview} alt="Preview" className="w-full h-auto block" />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Uploading…</span>
                </div>
              )}
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'review'   ? 'Share your thoughts on this book...' :
              postType === 'quote'    ? 'Paste a quote that resonated with you...' :
              postType === 'finished' ? 'You finished it! What did you think?' :
              postType === 'started'  ? 'What made you pick up this book?' :
                                       'What are you thinking about?'
            }
            className="w-full resize-none outline-none text-sm text-gray-800 dark:text-gray-200 min-h-28 leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 bg-transparent"
            rows={4}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-1">
              {/* Image upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Add photo"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  imagePreview ? 'bg-amber-100 text-amber-500' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                } disabled:opacity-50`}
              >
                <Camera className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

              {/* Book search toggle */}
              <button
                onClick={() => setShowBookSearch(!showBookSearch)}
                title="Tag a book"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  showBookSearch ? 'bg-amber-100 text-amber-500' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reset} className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!content.trim()}
                className="text-sm bg-amber-500 text-white px-5 py-2 rounded-xl hover:bg-amber-600 disabled:opacity-40 font-semibold transition-colors shadow-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
