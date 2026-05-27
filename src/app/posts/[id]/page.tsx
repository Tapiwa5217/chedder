'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { useChatContext } from '@/lib/chatContext';
import Avatar from '@/components/Avatar';
import StarRating from '@/components/StarRating';
import EmojiPicker from '@/components/EmojiPicker';
import { Comment } from '@/lib/types';
import {
  Heart, MessageCircle, Share2, ArrowLeft, Send, Smile, Reply,
} from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
  if (text.includes('\n[bigcover]')) { bigCover = true; text = text.replace('\n[bigcover]', ''); }
  return { text: text.trim(), imgUrl, bigCover };
}

function buildTree(comments: Comment[]) {
  const top: Comment[] = [];
  const replies: Record<string, Comment[]> = {};
  for (const c of [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())) {
    if (!c.parentId) top.push(c);
    else { if (!replies[c.parentId]) replies[c.parentId] = []; replies[c.parentId].push(c); }
  }
  return { top, replies };
}

// ── Comment thread row ─────────────────────────────────────────
function ThreadComment({
  comment, postId, depth = 0, replies,
}: { comment: Comment; postId: string; depth?: number; replies: Record<string, Comment[]>; }) {
  const { getUserById, currentUser, addComment, toggleCommentReaction } = useApp();
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const author = getUserById(comment.userId);

  const emojiGroups = new Map<string, { count: number; mine: boolean }>();
  for (const r of comment.reactions) {
    const g = emojiGroups.get(r.emoji) ?? { count: 0, mine: false };
    g.count++;
    if (r.userId === currentUser.id) g.mine = true;
    emojiGroups.set(r.emoji, g);
  }

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment(postId, replyText.trim(), comment.id);
    setReplyText('');
    setReplyOpen(false);
  };

  return (
    <div className={depth > 0 ? 'ml-10 mt-3' : 'mt-4'}>
      <div className="flex gap-3">
        {author && (
          <Link href={author.id === currentUser.id ? '/profile' : `/profile/${author.username}`} className="flex-shrink-0 mt-0.5">
            <Avatar initials={author.avatar} size="sm" colorSeed={author.id} avatarUrl={author.avatarUrl} />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-4 py-3">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{author?.name ?? 'Unknown'}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">
            {/* Reactions */}
            {[...emojiGroups.entries()].map(([emoji, { count, mine }]) => (
              <button
                key={emoji}
                onClick={() => toggleCommentReaction(postId, comment.id, emoji)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${mine ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {emoji} {count}
              </button>
            ))}

            {/* React */}
            <div className="relative">
              <button onClick={() => setShowEmoji((s) => !s)} className="text-xs text-gray-400 hover:text-amber-500 flex items-center gap-0.5">
                <Smile className="w-3.5 h-3.5" />
              </button>
              {showEmoji && (
                <EmojiPicker
                  onSelect={(emoji) => { toggleCommentReaction(postId, comment.id, emoji); setShowEmoji(false); }}
                  onClose={() => setShowEmoji(false)}
                  position="above"
                />
              )}
            </div>

            {depth === 0 && (
              <button onClick={() => setReplyOpen((s) => !s)} className="text-xs text-gray-400 hover:text-amber-500 flex items-center gap-0.5">
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
            )}

            <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>

          {replyOpen && (
            <div className="flex items-center gap-2 mt-2">
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
                  <button onClick={handleReply} className="text-amber-500 hover:text-amber-600">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {(replies[comment.id] ?? []).map((r) => (
        <ThreadComment key={r.id} comment={r} postId={postId} depth={depth + 1} replies={replies} />
      ))}
    </div>
  );
}

// ── Post detail page ───────────────────────────────────────────
export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { posts, currentUser, toggleLike, addComment, getUserById, users } = useApp();
  const { openChat } = useChatContext();

  const [commentText, setCommentText] = useState('');
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Post not found.</p>
        <Link href="/feed" className="text-sm text-amber-500 hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

  const author = getUserById(post.userId);
  const liked = post.likes.includes(currentUser.id);
  const { text: displayContent, imgUrl: inlineImageUrl, bigCover } = parseContent(post.content);
  const { top, replies } = buildTree(post.comments);

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* blocked */ }
  };

  const following = users.filter((u) => currentUser.following.includes(u.id));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Post */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          {author && (
            <Link href={author.id === currentUser.id ? '/profile' : `/profile/${author.username}`}>
              <Avatar initials={author.avatar} colorSeed={author.id} avatarUrl={author.avatarUrl} />
            </Link>
          )}
          <div>
            <Link
              href={author ? (author.id === currentUser.id ? '/profile' : `/profile/${author.username}`) : '#'}
              className="font-bold text-gray-900 dark:text-gray-100 hover:text-amber-500 transition-colors"
            >
              {author?.name}
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {post.rating !== undefined && (
          <div className="px-5 pb-2"><StarRating value={post.rating} readonly size="sm" /></div>
        )}

        {/* Book tag */}
        {post.book && !bigCover && (
          <div className="px-5 pb-3">
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

        {displayContent && (
          <p className="px-5 pb-4 text-gray-800 dark:text-gray-200 leading-relaxed">{displayContent}</p>
        )}

        {post.book?.coverUrl && bigCover && (
          <div className="bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center overflow-hidden" style={{ height: '300px' }}>
            <img src={post.book.coverUrl} alt={post.book.title} className="h-full w-full object-contain" />
          </div>
        )}

        {inlineImageUrl && (
          <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <img src={inlineImageUrl} alt="Post image" className="w-full h-auto block" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center border-t border-gray-100 dark:border-gray-800 px-2">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors ${liked ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
            <span>{post.likes.length > 0 ? post.likes.length : ''} Like</span>
          </button>
          <div className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors ${shareCopied ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Share2 className="w-5 h-5" />
            <span>{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Full comment thread */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
          {post.comments.length === 0 ? 'Be the first to comment' : `${post.comments.length} Comment${post.comments.length !== 1 ? 's' : ''}`}
        </h2>

        {/* Comment input */}
        <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100 dark:border-gray-800">
          <Avatar initials={currentUser.avatar} size="sm" colorSeed={currentUser.id} avatarUrl={currentUser.avatarUrl} />
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 gap-2 relative">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-800 dark:text-gray-200"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0 relative">
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

        {/* Threaded comments */}
        {top.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No comments yet. Start the conversation!</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {top.map((comment) => (
              <div key={comment.id} className="py-1">
                <ThreadComment comment={comment} postId={post.id} replies={replies} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
