'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Post, Comment } from '@/lib/types';
import { useApp } from '@/lib/context';
import { useChatContext } from '@/lib/chatContext';
import Avatar from './Avatar';
import StarRating from './StarRating';
import EmojiPicker from './EmojiPicker';
import {
  Heart, MessageCircle, Share2,
  MoreHorizontal, Pencil, Trash2, Send, Reply, Smile,
} from 'lucide-react';

const POST_TYPE_LABELS: Record<Post['type'], string> = {
  review: 'reviewed',
  quote: 'shared a quote from',
  update: 'is reading',
  finished: 'finished',
  started: 'started reading',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Parse \n[img]URL and \n[bigcover] from content */
function parseContent(raw: string) {
  let text = raw;
  let imgUrl: string | undefined;
  let bigCover = false;

  const imgMarker = '\n[img]';
  const imgIdx = text.indexOf(imgMarker);
  if (imgIdx !== -1) {
    imgUrl = text.slice(imgIdx + imgMarker.length).split('\n')[0];
    text = text.slice(0, imgIdx) + text.slice(imgIdx + imgMarker.length + imgUrl.length);
  }
  if (text.includes('\n[bigcover]')) {
    bigCover = true;
    text = text.replace('\n[bigcover]', '');
  }
  return { text: text.trim(), imgUrl, bigCover };
}

/** Group comments into top-level + replies map */
function buildCommentTree(comments: Comment[]) {
  const top: Comment[] = [];
  const replies: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (!c.parentId) {
      top.push(c);
    } else {
      if (!replies[c.parentId]) replies[c.parentId] = [];
      replies[c.parentId].push(c);
    }
  }
  return { top, replies };
}

// ── Single comment row ──────────────────────────────────────────
function CommentRow({
  comment,
  postId,
  depth = 0,
  replies,
}: {
  comment: Comment;
  postId: string;
  depth?: number;
  replies: Record<string, Comment[]>;
}) {
  const { toggleCommentReaction, addComment, getUserById, currentUser } = useApp();
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  const author = getUserById(comment.userId);

  const handleReact = (emoji: string) => toggleCommentReaction(postId, comment.id, emoji);

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment(postId, replyText.trim(), comment.id);
    setReplyText('');
    setReplyOpen(false);
  };

  // Group reactions by emoji
  const reactionGroups: { emoji: string; count: number; myReaction: boolean }[] = [];
  const emojiMap = new Map<string, { count: number; mine: boolean }>();
  for (const r of comment.reactions) {
    const existing = emojiMap.get(r.emoji);
    if (existing) {
      existing.count++;
      if (r.userId === currentUser.id) existing.mine = true;
    } else {
      emojiMap.set(r.emoji, { count: 1, mine: r.userId === currentUser.id });
    }
  }
  emojiMap.forEach((v, emoji) => reactionGroups.push({ emoji, count: v.count, myReaction: v.mine }));

  const childReplies = replies[comment.id] ?? [];

  return (
    <div className={depth > 0 ? 'ml-8 mt-2' : ''}>
      <div className="flex gap-2.5">
        {author && (
          <Link href={author.id === currentUser.id ? '/profile' : `/profile/${author.username}`} className="flex-shrink-0">
            <Avatar initials={author.avatar} size="sm" colorSeed={author.id} avatarUrl={author.avatarUrl} />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-3.5 py-2.5">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5">
              {author?.name ?? 'Unknown'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Reactions + actions */}
          <div className="flex items-center gap-3 mt-1.5 px-1">
            {/* Existing reactions */}
            {reactionGroups.map(({ emoji, count, myReaction }) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
                  myReaction
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {emoji} {count}
              </button>
            ))}

            {/* React button */}
            <div className="relative" ref={emojiRef}>
              <button
                onClick={() => setShowEmoji((s) => !s)}
                className="text-xs text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-0.5"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {showEmoji && (
                <EmojiPicker
                  onSelect={handleReact}
                  onClose={() => setShowEmoji(false)}
                  position="above"
                />
              )}
            </div>

            {/* Reply button */}
            {depth === 0 && (
              <button
                onClick={() => setReplyOpen((s) => !s)}
                className="text-xs text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-0.5"
              >
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
            )}

            <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Reply input */}
          {replyOpen && (
            <div className="flex items-center gap-2 mt-2 pl-1">
              <Avatar initials={currentUser.avatar} size="sm" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
              <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3.5 py-1.5 gap-2">
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  placeholder={`Reply to ${author?.name?.split(' ')[0] ?? 'comment'}…`}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-800 dark:text-gray-200"
                />
                {replyText.trim() && (
                  <button onClick={handleReply} className="text-amber-500 hover:text-amber-600 flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {childReplies.map((r) => (
        <CommentRow key={r.id} comment={r} postId={postId} depth={depth + 1} replies={replies} />
      ))}
    </div>
  );
}

// ── Main PostCard ───────────────────────────────────────────────
export default function PostCard({ post }: { post: Post }) {
  const { toggleLike, addComment, getUserById, currentUser, updatePost, deletePost, users } = useApp();
  const { openChat } = useChatContext();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);

  // Options menu
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Inline edit
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Share modal
  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const author = getUserById(post.userId);
  const liked = post.likes.includes(currentUser.id);
  const isOwn = post.userId === currentUser.id;

  const { text: displayContent, imgUrl: inlineImageUrl, bigCover } = parseContent(post.content);
  const { top: topComments, replies } = buildCommentTree(post.comments);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showOptions && !showShare) return;
    const handler = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setShowOptions(false);
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShare(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOptions, showShare]);

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
    setShowComments(true);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    updatePost(post.id, editContent.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    deletePost(post.id);
    setConfirmDelete(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* blocked */ }
  };

  const handleShareToDM = (userId: string) => {
    const preview = displayContent.slice(0, 120);
    openChat(userId);
    // The actual message is sent from ChatWidget; here we just open the chat.
    // We pass a starter message via URL so ChatWidget can pre-fill it.
    sessionStorage.setItem(`chat_prefill_${userId}`, `Check out this post: "${preview}…" ${window.location.origin}/posts/${post.id}`);
    setShowShare(false);
  };

  // People I follow (for DM share)
  const following = users.filter((u) => currentUser.following.includes(u.id));

  return (
    <>
      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1.5">Delete post?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This can't be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post card ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            {author && (
              <Link href={author.id === currentUser.id ? '/profile' : `/profile/${author.username}`}>
                <Avatar initials={author.avatar} colorSeed={author.id} avatarUrl={author.avatarUrl} />
              </Link>
            )}
            <div>
              <Link
                href={author ? (author.id === currentUser.id ? '/profile' : `/profile/${author.username}`) : '#'}
                className="font-bold text-gray-900 dark:text-gray-100 text-sm hover:text-amber-500 transition-colors"
              >
                {author?.name}
              </Link>
              {post.book ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {POST_TYPE_LABELS[post.type]}{' '}
                  <Link href={`/books/${post.book.id}`} className="font-semibold text-amber-500 hover:underline">
                    {post.book.title}
                  </Link>
                </p>
              ) : (
                <Link href={`/posts/${post.id}`} className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hover:underline block">
                  {timeAgo(post.createdAt)}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
            {post.book && (
              <Link href={`/posts/${post.id}`} className="text-xs text-gray-300 dark:text-gray-600 mr-1 hover:underline">
                {timeAgo(post.createdAt)}
              </Link>
            )}

            {/* Options dropdown */}
            <div className="relative" ref={optionsRef}>
              <button onClick={() => setShowOptions((s) => !s)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 w-36 z-20 overflow-hidden">
                  {isOwn ? (
                    <>
                      <button onClick={() => { setEditContent(post.content); setEditing(true); setShowOptions(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-gray-400" /> Edit
                      </button>
                      <button onClick={() => { setConfirmDelete(true); setShowOptions(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  ) : (
                    <p className="px-3.5 py-2.5 text-xs text-gray-400 dark:text-gray-500 text-center">No options</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        {post.rating !== undefined && (
          <div className="px-4 pb-2">
            <StarRating value={post.rating} readonly size="sm" />
          </div>
        )}

        {/* Book tag — small circle */}
        {post.book && !bigCover && (
          <div className="px-4 pb-3">
            <Link href={`/books/${post.book.id}`} className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors rounded-full pl-1 pr-3 py-1">
              {post.book.coverUrl ? (
                <img src={post.book.coverUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-800 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 max-w-[160px] truncate">{post.book.title}</span>
            </Link>
          </div>
        )}

        {/* Text content or inline edit */}
        {editing ? (
          <div className="px-4 pb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              autoFocus
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={handleSaveEdit} disabled={!editContent.trim()} className="px-4 py-1.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-sm text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          displayContent && (
            <p className="px-4 pb-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{displayContent}</p>
          )
        )}

        {/* Big cover (opt-in) */}
        {post.book?.coverUrl && bigCover && (
          <Link href={`/books/${post.book.id}`} className="block">
            <div className="bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center overflow-hidden" style={{ height: '240px' }}>
              <img src={post.book.coverUrl} alt={post.book.title} className="h-full w-full object-contain" />
            </div>
          </Link>
        )}

        {/* Uploaded image — full natural size, no cropping */}
        {inlineImageUrl && !editing && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <img src={inlineImageUrl} alt="Post image" className="w-full h-auto block" />
          </div>
        )}

        {/* Engagement counts */}
        {(post.likes.length > 0 || post.comments.length > 0) && (
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            {post.likes.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-rose-500 rounded-full inline-flex items-center justify-center">
                  <Heart className="w-2.5 h-2.5 text-white" fill="white" />
                </span>
                <span>{post.likes.length}</span>
              </div>
            ) : <div />}
            {post.comments.length > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center border-t border-gray-100 dark:border-gray-800 px-2">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors ${liked ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
            <span>Like</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>

          {/* Share dropdown */}
          <div className="flex-1 relative" ref={shareRef}>
            <button
              onClick={() => setShowShare((s) => !s)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            {showShare && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-64 z-30 overflow-hidden">
                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                  {shareCopied ? <span className="text-emerald-500 font-semibold">Link copied!</span> : 'Copy link'}
                </button>

                {/* Send to DM */}
                {following.length > 0 && (
                  <div>
                    <p className="px-4 pt-2.5 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Send to DM</p>
                    <div className="max-h-40 overflow-y-auto">
                      {following.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleShareToDM(u.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <Avatar initials={u.avatar} size="sm" colorSeed={u.id} avatarUrl={u.avatarUrl} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                          </div>
                          <Send className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="px-4 pt-2 pb-1 border-t border-gray-50 dark:border-gray-800 space-y-3">
            {topComments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} postId={post.id} replies={replies} />
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2.5">
          <Avatar initials={currentUser.avatar} size="sm" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 gap-2 relative">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-800 dark:text-gray-200"
            />
            <div className="flex items-center gap-1 flex-shrink-0 relative">
              <button onClick={() => setShowCommentEmoji((s) => !s)} className="text-gray-400 hover:text-amber-500 transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              {showCommentEmoji && (
                <EmojiPicker
                  onSelect={(emoji) => setCommentText((t) => t + emoji)}
                  onClose={() => setShowCommentEmoji(false)}
                  position="above"
                />
              )}
              {commentText.trim() && (
                <button onClick={handleComment} className="text-amber-500 hover:text-amber-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
