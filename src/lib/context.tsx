'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Book, User, Post, ShelfEntry, ShelfType, Comment, CommentReaction, BookJournal, Conversation, Message, Notification, BookList, BookGroup, GroupMessage } from './types';

type ProfileUpdates = {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  journalPublicDefault?: boolean;
};

type AppContextType = {
  loading: boolean;
  currentUser: User;
  users: User[];
  shelf: ShelfEntry[];
  posts: Post[];
  journals: BookJournal[];
  conversations: Conversation[];
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  addToShelf: (book: Book, shelfType: ShelfType) => Promise<void>;
  removeFromShelf: (bookId: string) => Promise<void>;
  moveShelf: (bookId: string, shelf: ShelfType) => Promise<void>;
  updateEntry: (bookId: string, updates: Partial<Pick<ShelfEntry, 'rating' | 'review' | 'progress'>>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  toggleCommentReaction: (postId: string, commentId: string, emoji: string) => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  getShelfEntry: (bookId: string) => ShelfEntry | undefined;
  isFollowing: (userId: string) => boolean;
  getUserById: (userId: string) => User | undefined;
  addJournal: (journal: Omit<BookJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJournal: (id: string, updates: Partial<Pick<BookJournal, 'title' | 'content' | 'lessons' | 'isPublic'>>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  getJournalForBook: (bookId: string) => BookJournal | undefined;
  sendMessage: (toUserId: string, content: string) => Promise<void>;
  getConversation: (userId: string) => Conversation | undefined;
  getUnreadCount: () => number;
  markConversationRead: (conversationId: string) => void;
  bookLists: BookList[];
  createList: (title: string, description?: string, isPublic?: boolean) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
  updateList: (listId: string, updates: Partial<Pick<BookList, 'title' | 'description' | 'isPublic'>>) => Promise<void>;
  addBookToList: (listId: string, book: Book) => Promise<void>;
  removeBookFromList: (listId: string, bookId: string) => Promise<void>;
  followList: (listId: string) => Promise<void>;
  unfollowList: (listId: string) => Promise<void>;
  groups: BookGroup[];
  createGroup: (name: string, description?: string, book?: Book, isPublic?: boolean) => Promise<string>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  sendGroupMessage: (groupId: string, content: string) => Promise<void>;
  inviteToGroup: (groupId: string, userId: string) => Promise<void>;
};

const EMPTY_USER: User = { id: '', name: '', username: '', bio: '', avatar: 'U', following: [], followers: [] };

const AppContext = createContext<AppContextType | null>(null);

// ── DB → app type helpers ──────────────────────────────────

function mapBook(b: Record<string, unknown>): Book {
  return {
    id: b.id as string,
    title: b.title as string,
    author: b.author as string,
    coverUrl: (b.cover_url as string) ?? undefined,
    description: (b.description as string) ?? undefined,
    year: (b.year as number) ?? undefined,
    subjects: (b.subjects as string[]) ?? undefined,
    pages: (b.pages as number) ?? undefined,
  };
}

function mapProfile(p: Record<string, unknown>): User {
  return {
    id: p.id as string,
    name: p.name as string,
    username: p.username as string,
    bio: (p.bio as string) ?? '',
    avatar: p.avatar as string,
    avatarUrl: (p.avatar_url as string) ?? undefined,
    coverUrl: (p.cover_url as string) ?? undefined,
    journalPublicDefault: (p.journal_public_default as boolean) ?? false,
    following: [],
    followers: [],
  };
}

// ── Provider ───────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [shelf, setShelf] = useState<ShelfEntry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [journals, setJournals] = useState<BookJournal[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Maps conversationId → ID of the last message the user has seen
  const [lastSeenMsgId, setLastSeenMsgId] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('lastSeenMsgId');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [bookLists, setBookLists] = useState<BookList[]>([]);
  const [groups, setGroups] = useState<BookGroup[]>([]);

  // ── Upsert book to shared catalog before any reference ──
  const upsertBook = useCallback(async (book: Book) => {
    await supabase.from('books').upsert({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.coverUrl ?? null,
      description: book.description ?? null,
      year: book.year ?? null,
      subjects: book.subjects ?? null,
      pages: book.pages ?? null,
    }, { onConflict: 'id' });
  }, [supabase]);

  // ── Profile update ────────────────────────────────────────
  const updateProfile = async (updates: ProfileUpdates) => {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
    if (updates.journalPublicDefault !== undefined) dbUpdates.journal_public_default = updates.journalPublicDefault;
    await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, ...updates } : u));
  };

  // ── Load all app data for authenticated user ─────────────
  const loadData = useCallback(async (userId: string) => {
    const [
      profilesResult,
      followsResult,
      shelfResult,
      postsResult,
      journalsResult,
      convsResult,
      notificationsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('follows').select('follower_id, following_id'),
      supabase.from('shelf_entries')
        .select('id, book_id, shelf, added_at, rating, review, progress, book:books(*)')
        .eq('user_id', userId),
      supabase.from('posts')
        .select('id, user_id, type, content, rating, created_at, book:books(*), post_likes(user_id), comments(id, user_id, content, created_at, parent_id, comment_reactions(user_id, emoji))')
        .order('created_at', { ascending: false }),
      supabase.from('book_journals')
        .select('id, user_id, book_id, title, content, lessons, is_public, created_at, updated_at, book:books(*)')
        .or(`user_id.eq.${userId},is_public.eq.true`),
      supabase.from('conversations')
        .select('id, participant_1, participant_2, messages(id, sender_id, content, created_at)')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`),
      supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    // Build users with follow arrays derived from follows table
    const profiles = (profilesResult.data ?? []) as Record<string, unknown>[];
    const allFollows = (followsResult.data ?? []) as { follower_id: string; following_id: string }[];

    const usersList: User[] = profiles.map((p) => ({
      ...mapProfile(p),
      following: allFollows.filter((f) => f.follower_id === p.id).map((f) => f.following_id),
      followers: allFollows.filter((f) => f.following_id === p.id).map((f) => f.follower_id),
    }));

    setUsers(usersList);
    const me = usersList.find((u) => u.id === userId);
    if (me) setCurrentUser(me);

    // Shelf
    const shelfList: ShelfEntry[] = (shelfResult.data ?? []).map((e: Record<string, unknown>) => ({
      book: mapBook(e.book as Record<string, unknown>),
      shelf: e.shelf as ShelfType,
      addedAt: e.added_at as string,
      rating: (e.rating as number) ?? undefined,
      review: (e.review as string) ?? undefined,
      progress: (e.progress as number) ?? undefined,
    }));
    setShelf(shelfList);

    // Posts
    const postsList: Post[] = (postsResult.data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      userId: p.user_id as string,
      type: p.type as Post['type'],
      content: p.content as string,
      rating: (p.rating as number) ?? undefined,
      createdAt: p.created_at as string,
      book: p.book ? mapBook(p.book as Record<string, unknown>) : undefined,
      likes: ((p.post_likes as { user_id: string }[]) ?? []).map((l) => l.user_id),
      comments: ((p.comments as Record<string, unknown>[]) ?? []).map((c) => ({
        id: c.id as string,
        userId: c.user_id as string,
        content: c.content as string,
        createdAt: c.created_at as string,
        parentId: (c.parent_id as string) ?? undefined,
        reactions: ((c.comment_reactions as Record<string, unknown>[]) ?? []).map((r) => ({
          userId: r.user_id as string,
          emoji: r.emoji as string,
        })) as CommentReaction[],
      })),
    }));
    setPosts(postsList);

    // Journals
    const journalsList: BookJournal[] = (journalsResult.data ?? []).map((j: Record<string, unknown>) => ({
      id: j.id as string,
      userId: j.user_id as string,
      bookId: j.book_id as string,
      book: mapBook(j.book as Record<string, unknown>),
      title: (j.title as string) ?? '',
      content: j.content as string,
      lessons: (j.lessons as string[]) ?? [],
      isPublic: j.is_public as boolean,
      createdAt: j.created_at as string,
      updatedAt: j.updated_at as string,
    }));
    setJournals(journalsList);

    // Conversations
    const convsList: Conversation[] = (convsResult.data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      participantIds: [c.participant_1 as string, c.participant_2 as string] as [string, string],
      messages: ((c.messages as Record<string, unknown>[]) ?? [])
        .sort((a, b) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime())
        .map((m) => ({
          id: m.id as string,
          senderId: m.sender_id as string,
          content: m.content as string,
          createdAt: m.created_at as string,
        })),
    }));
    setConversations(convsList);

    // Notifications — gracefully handles if table doesn't exist yet
    const notifsList: Notification[] = (notificationsResult.data ?? []).map((n: Record<string, unknown>) => ({
      id: n.id as string,
      userId: n.user_id as string,
      actorId: n.actor_id as string,
      type: n.type as Notification['type'],
      postId: (n.post_id as string) ?? undefined,
      read: n.read as boolean,
      createdAt: n.created_at as string,
    }));
    setNotifications(notifsList);

    // Book lists — gracefully skip if table doesn't exist
    try {
      const { data: listsData } = await supabase
        .from('book_lists')
        .select('id, user_id, title, description, is_public, created_at, updated_at, book_list_items(book_id, book:books(*)), book_list_follows(user_id)')
        .or(`is_public.eq.true,user_id.eq.${userId}`);
      if (listsData) {
        const mappedLists: BookList[] = listsData.map((l: Record<string, unknown>) => ({
          id: l.id as string,
          userId: l.user_id as string,
          title: l.title as string,
          description: (l.description as string) ?? undefined,
          isPublic: l.is_public as boolean,
          books: ((l.book_list_items as Record<string, unknown>[]) ?? []).map((item) =>
            mapBook(item.book as Record<string, unknown>)
          ),
          followers: ((l.book_list_follows as { user_id: string }[]) ?? []).map((f) => f.user_id),
          createdAt: l.created_at as string,
          updatedAt: l.updated_at as string,
        }));
        setBookLists(mappedLists);
      }
    } catch { /* table not created yet */ }

    // Book groups — gracefully skip if tables don't exist
    try {
      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      const groupIds = (memberData ?? []).map((m: Record<string, unknown>) => m.group_id as string);
      if (groupIds.length > 0) {
        const { data: groupsData } = await supabase
          .from('book_groups')
          .select('id, name, description, admin_id, is_public, created_at, book:books(*), group_members(user_id), group_messages(id, sender_id, content, created_at)')
          .in('id', groupIds);
        if (groupsData) {
          const mappedGroups: BookGroup[] = groupsData.map((g: Record<string, unknown>) => ({
            id: g.id as string,
            name: g.name as string,
            description: (g.description as string) ?? undefined,
            book: g.book ? mapBook(g.book as Record<string, unknown>) : undefined,
            adminId: g.admin_id as string,
            isPublic: g.is_public as boolean,
            memberIds: ((g.group_members as { user_id: string }[]) ?? []).map((m) => m.user_id),
            messages: ((g.group_messages as Record<string, unknown>[]) ?? [])
              .sort((a, b) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime())
              .map((m) => ({
                id: m.id as string,
                senderId: m.sender_id as string,
                content: m.content as string,
                createdAt: m.created_at as string,
              })),
            createdAt: g.created_at as string,
          }));
          setGroups(mappedGroups);
        }
      }
    } catch { /* table not created yet */ }

    setLoading(false);
  }, [supabase]);

  // ── Auth state listener ───────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadData(session.user.id);
      } else {
        setCurrentUser(EMPTY_USER);
        setUsers([]);
        setShelf([]);
        setPosts([]);
        setJournals([]);
        setConversations([]);
        setNotifications([]);
        setBookLists([]);
        setGroups([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadData]);

  // ── Shelf mutations ────────────────────────────────────────

  const addToShelf = async (book: Book, shelfType: ShelfType) => {
    await upsertBook(book);
    await supabase.from('shelf_entries').upsert(
      { user_id: currentUser.id, book_id: book.id, shelf: shelfType, added_at: new Date().toISOString() },
      { onConflict: 'user_id,book_id' }
    );
    setShelf((prev) => {
      const existing = prev.find((e) => e.book.id === book.id);
      if (existing) return prev.map((e) => (e.book.id === book.id ? { ...e, shelf: shelfType } : e));
      return [...prev, { book, shelf: shelfType, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromShelf = async (bookId: string) => {
    await supabase.from('shelf_entries').delete().eq('user_id', currentUser.id).eq('book_id', bookId);
    setShelf((prev) => prev.filter((e) => e.book.id !== bookId));
  };

  const moveShelf = async (bookId: string, shelfType: ShelfType) => {
    await supabase.from('shelf_entries').update({ shelf: shelfType }).eq('user_id', currentUser.id).eq('book_id', bookId);
    setShelf((prev) => prev.map((e) => (e.book.id === bookId ? { ...e, shelf: shelfType } : e)));
  };

  const updateEntry = async (bookId: string, updates: Partial<Pick<ShelfEntry, 'rating' | 'review' | 'progress'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.review !== undefined) dbUpdates.review = updates.review;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    await supabase.from('shelf_entries').update(dbUpdates).eq('user_id', currentUser.id).eq('book_id', bookId);
    setShelf((prev) => prev.map((e) => (e.book.id === bookId ? { ...e, ...updates } : e)));
  };

  // ── Notification helper ────────────────────────────────────

  const fireNotification = async (actorId: string, userId: string, type: Notification['type'], postId?: string) => {
    if (actorId === userId) return; // never notify yourself
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        actor_id: actorId,
        type,
        post_id: postId ?? null,
        read: false,
      });
    } catch {
      // Ignore — notifications table may not exist yet
    }
  };

  const markNotificationRead = async (id: string) => {
    supabase.from('notifications').update({ read: true }).eq('id', id).then(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id).eq('read', false).then(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Post mutations ─────────────────────────────────────────

  const toggleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const liked = post.likes.includes(currentUser.id);
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUser.id });
      fireNotification(currentUser.id, post.userId, 'like', postId);
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId ? p : {
          ...p,
          likes: liked ? p.likes.filter((id) => id !== currentUser.id) : [...p.likes, currentUser.id],
        }
      )
    );
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUser.id, content, parent_id: parentId ?? null })
      .select('id, created_at')
      .single();
    if (data) {
      const comment: Comment = {
        id: data.id, userId: currentUser.id, content,
        createdAt: data.created_at, parentId, reactions: [],
      };
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
      const post = posts.find((p) => p.id === postId);
      if (post && !parentId) fireNotification(currentUser.id, post.userId, 'comment', postId);
    }
  };

  const toggleCommentReaction = async (postId: string, commentId: string, emoji: string) => {
    const post = posts.find((p) => p.id === postId);
    const comment = post?.comments.find((c) => c.id === commentId);
    if (!comment) return;
    const existing = comment.reactions.find((r) => r.userId === currentUser.id);
    if (existing) {
      await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', currentUser.id);
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p,
        comments: p.comments.map((c) => c.id !== commentId ? c : {
          ...c, reactions: c.reactions.filter((r) => r.userId !== currentUser.id),
        }),
      }));
    } else {
      await supabase.from('comment_reactions').upsert({ comment_id: commentId, user_id: currentUser.id, emoji });
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p,
        comments: p.comments.map((c) => c.id !== commentId ? c : {
          ...c, reactions: [...c.reactions, { userId: currentUser.id, emoji }],
        }),
      }));
    }
  };

  const addPost = async (post: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => {
    if (post.book) await upsertBook(post.book);
    const { data } = await supabase
      .from('posts')
      .insert({ user_id: currentUser.id, type: post.type, content: post.content, book_id: post.book?.id ?? null, rating: post.rating ?? null })
      .select('id, created_at')
      .single();
    if (data) {
      const newPost: Post = { ...post, id: data.id, userId: currentUser.id, createdAt: data.created_at, likes: [], comments: [] };
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  const updatePost = async (postId: string, content: string) => {
    await supabase.from('posts').update({ content }).eq('id', postId).eq('user_id', currentUser.id);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, content } : p));
  };

  const deletePost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId).eq('user_id', currentUser.id);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // ── Social mutations ───────────────────────────────────────

  const followUser = async (userId: string) => {
    await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: userId });
    fireNotification(currentUser.id, userId, 'follow');
    setCurrentUser((prev) => ({ ...prev, following: [...prev.following, userId] }));
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) return { ...u, following: [...u.following, userId] };
        if (u.id === userId) return { ...u, followers: [...u.followers, currentUser.id] };
        return u;
      })
    );
  };

  const unfollowUser = async (userId: string) => {
    await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
    setCurrentUser((prev) => ({ ...prev, following: prev.following.filter((id) => id !== userId) }));
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) return { ...u, following: u.following.filter((id) => id !== userId) };
        if (u.id === userId) return { ...u, followers: u.followers.filter((id) => id !== currentUser.id) };
        return u;
      })
    );
  };

  // ── Journal mutations ──────────────────────────────────────

  const addJournal = async (journal: Omit<BookJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await upsertBook(journal.book);
    const { data } = await supabase
      .from('book_journals')
      .insert({ user_id: currentUser.id, book_id: journal.bookId, title: journal.title, content: journal.content, lessons: journal.lessons, is_public: journal.isPublic })
      .select('id, created_at, updated_at')
      .single();
    if (data) {
      const newJournal: BookJournal = { ...journal, id: data.id, userId: currentUser.id, createdAt: data.created_at, updatedAt: data.updated_at };
      setJournals((prev) => [...prev, newJournal]);
    }
  };

  const updateJournal = async (id: string, updates: Partial<Pick<BookJournal, 'title' | 'content' | 'lessons' | 'isPublic'>>) => {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.lessons !== undefined) dbUpdates.lessons = updates.lessons;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
    await supabase.from('book_journals').update(dbUpdates).eq('id', id);
    setJournals((prev) => prev.map((j) => j.id === id ? { ...j, ...updates, updatedAt: dbUpdates.updated_at as string } : j));
  };

  const deleteJournal = async (id: string) => {
    await supabase.from('book_journals').delete().eq('id', id);
    setJournals((prev) => prev.filter((j) => j.id !== id));
  };

  // ── Messaging mutations ────────────────────────────────────

  const sendMessage = async (toUserId: string, content: string) => {
    // Canonical ordering: smaller UUID is always participant_1
    const [p1, p2] = [currentUser.id, toUserId].sort();

    const existing = conversations.find(
      (c) => c.participantIds.includes(currentUser.id) && c.participantIds.includes(toUserId)
    );

    let convId = existing?.id;
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ participant_1: p1, participant_2: p2 })
        .select('id')
        .single();
      convId = newConv?.id;
    }
    if (!convId) return;

    const { data: msg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, sender_id: currentUser.id, content })
      .select('id, created_at')
      .single();

    if (msg) {
      const message: Message = { id: msg.id, senderId: currentUser.id, content, createdAt: msg.created_at };
      setConversations((prev) => {
        if (existing) {
          return prev.map((c) => c.id === convId ? { ...c, messages: [...c.messages, message] } : c);
        }
        return [...prev, { id: convId!, participantIds: [p1, p2] as [string, string], messages: [message] }];
      });
    }
  };

  // ── Book list mutations ────────────────────────────────────

  const createList = async (title: string, description?: string, isPublic = true): Promise<string> => {
    const { data } = await supabase.from('book_lists')
      .insert({ user_id: currentUser.id, title, description: description ?? null, is_public: isPublic })
      .select('id, created_at, updated_at').single();
    if (data) {
      const newList: BookList = { id: data.id, userId: currentUser.id, title, description, books: [], isPublic, followers: [], createdAt: data.created_at, updatedAt: data.updated_at };
      setBookLists((prev) => [...prev, newList]);
      return data.id;
    }
    return '';
  };

  const deleteList = async (listId: string) => {
    await supabase.from('book_lists').delete().eq('id', listId).eq('user_id', currentUser.id);
    setBookLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const updateList = async (listId: string, updates: Partial<Pick<BookList, 'title' | 'description' | 'isPublic'>>) => {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
    await supabase.from('book_lists').update(dbUpdates).eq('id', listId).eq('user_id', currentUser.id);
    setBookLists((prev) => prev.map((l) => l.id === listId ? { ...l, ...updates, updatedAt: dbUpdates.updated_at as string } : l));
  };

  const addBookToList = async (listId: string, book: Book) => {
    await upsertBook(book);
    await supabase.from('book_list_items').upsert({ list_id: listId, book_id: book.id }, { onConflict: 'list_id,book_id' });
    setBookLists((prev) => prev.map((l) => l.id === listId && !l.books.find((b) => b.id === book.id)
      ? { ...l, books: [...l.books, book] } : l));
  };

  const removeBookFromList = async (listId: string, bookId: string) => {
    await supabase.from('book_list_items').delete().eq('list_id', listId).eq('book_id', bookId);
    setBookLists((prev) => prev.map((l) => l.id === listId ? { ...l, books: l.books.filter((b) => b.id !== bookId) } : l));
  };

  const followList = async (listId: string) => {
    await supabase.from('book_list_follows').upsert({ list_id: listId, user_id: currentUser.id }, { onConflict: 'list_id,user_id' });
    setBookLists((prev) => prev.map((l) => l.id === listId && !l.followers.includes(currentUser.id)
      ? { ...l, followers: [...l.followers, currentUser.id] } : l));
  };

  const unfollowList = async (listId: string) => {
    await supabase.from('book_list_follows').delete().eq('list_id', listId).eq('user_id', currentUser.id);
    setBookLists((prev) => prev.map((l) => l.id === listId ? { ...l, followers: l.followers.filter((id) => id !== currentUser.id) } : l));
  };

  // ── Book group mutations ───────────────────────────────────

  const createGroup = async (name: string, description?: string, book?: Book, isPublic = false): Promise<string> => {
    if (book) await upsertBook(book);
    const { data } = await supabase.from('book_groups')
      .insert({ name, description: description ?? null, book_id: book?.id ?? null, admin_id: currentUser.id, is_public: isPublic })
      .select('id, created_at').single();
    if (data) {
      // Auto-join as member
      await supabase.from('group_members').insert({ group_id: data.id, user_id: currentUser.id });
      const newGroup: BookGroup = { id: data.id, name, description, book, adminId: currentUser.id, memberIds: [currentUser.id], messages: [], isPublic, createdAt: data.created_at };
      setGroups((prev) => [...prev, newGroup]);
      return data.id;
    }
    return '';
  };

  const joinGroup = async (groupId: string) => {
    await supabase.from('group_members').upsert({ group_id: groupId, user_id: currentUser.id }, { onConflict: 'group_id,user_id' });
    setGroups((prev) => prev.map((g) => g.id === groupId && !g.memberIds.includes(currentUser.id)
      ? { ...g, memberIds: [...g.memberIds, currentUser.id] } : g));
  };

  const leaveGroup = async (groupId: string) => {
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', currentUser.id);
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== currentUser.id) } : g));
  };

  const sendGroupMessage = async (groupId: string, content: string) => {
    const { data } = await supabase.from('group_messages')
      .insert({ group_id: groupId, sender_id: currentUser.id, content })
      .select('id, created_at').single();
    if (data) {
      const msg: GroupMessage = { id: data.id, senderId: currentUser.id, content, createdAt: data.created_at };
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, messages: [...g.messages, msg] } : g));
    }
  };

  const inviteToGroup = async (groupId: string, userId: string) => {
    await supabase.from('group_members').upsert({ group_id: groupId, user_id: userId }, { onConflict: 'group_id,user_id' });
    setGroups((prev) => prev.map((g) => g.id === groupId && !g.memberIds.includes(userId)
      ? { ...g, memberIds: [...g.memberIds, userId] } : g));
  };

  // ── Read-only helpers ──────────────────────────────────────

  const getShelfEntry = (bookId: string) => shelf.find((e) => e.book.id === bookId);
  const isFollowing = (userId: string) => currentUser.following.includes(userId);
  const getUserById = (userId: string) => users.find((u) => u.id === userId);
  const getJournalForBook = (bookId: string) => journals.find((j) => j.userId === currentUser.id && j.bookId === bookId);
  const getConversation = (userId: string) =>
    conversations.find((c) => c.participantIds.includes(currentUser.id) && c.participantIds.includes(userId));

  const markConversationRead = useCallback((conversationId: string) => {
    setLastSeenMsgId((prev) => {
      // Find the last message in this conversation and store its ID
      const conv = conversations.find((c) => c.id === conversationId);
      const lastMsg = conv?.messages.at(-1);
      if (!lastMsg) return prev;
      const next = { ...prev, [conversationId]: lastMsg.id };
      try { localStorage.setItem('lastSeenMsgId', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [conversations]);

  const getUnreadCount = useCallback(() =>
    conversations.reduce((acc, c) => {
      const seenId = lastSeenMsgId[c.id];
      // Never opened → unread if there's any message from someone else
      if (!seenId) {
        const hasUnread = c.messages.some((m) => m.senderId !== currentUser.id);
        return acc + (hasUnread ? 1 : 0);
      }
      // Find where the last-seen message sits in the array
      const seenIdx = c.messages.findIndex((m) => m.id === seenId);
      // Any non-self message that arrives after that index is unread
      const hasUnread = c.messages
        .slice(seenIdx + 1)
        .some((m) => m.senderId !== currentUser.id);
      return acc + (hasUnread ? 1 : 0);
    }, 0),
  [conversations, lastSeenMsgId, currentUser.id]);

  return (
    <AppContext.Provider
      value={{
        loading,
        currentUser, users, shelf, posts, journals, conversations,
        notifications,
        unreadNotificationCount: notifications.filter((n) => !n.read).length,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
        addToShelf, removeFromShelf, moveShelf, updateEntry,
        toggleLike, addComment, toggleCommentReaction, addPost, updatePost, deletePost,
        followUser, unfollowUser,
        getShelfEntry, isFollowing, getUserById,
        addJournal, updateJournal, deleteJournal, getJournalForBook,
        sendMessage, getConversation, getUnreadCount, markConversationRead,
        bookLists, createList, deleteList, updateList, addBookToList, removeBookFromList, followList, unfollowList,
        groups, createGroup, joinGroup, leaveGroup, sendGroupMessage, inviteToGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
