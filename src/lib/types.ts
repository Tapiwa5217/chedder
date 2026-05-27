export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  year?: number;
  subjects?: string[];
  pages?: number;
};

export type ShelfType = 'wishlist' | 'reading' | 'read';

export type ShelfEntry = {
  book: Book;
  shelf: ShelfType;
  addedAt: string;
  rating?: number;
  review?: string;
  progress?: number;
};

export type User = {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  avatarUrl?: string;
  coverUrl?: string;
  journalPublicDefault?: boolean;
  following: string[];
  followers: string[];
};

export type PostType = 'review' | 'quote' | 'update' | 'finished' | 'started';

export type CommentReaction = {
  userId: string;
  emoji: string;
};

export type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  parentId?: string;
  reactions: CommentReaction[];
};

export type Post = {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  book?: Book;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  rating?: number;
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  participantIds: [string, string];
  messages: Message[];
};

export type BookJournal = {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  title: string;
  content: string;
  lessons: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = 'like' | 'comment' | 'follow';

export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  read: boolean;
  createdAt: string;
};

// ── Book lists / playlists ─────────────────────────────────

export type BookList = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  books: Book[];
  isPublic: boolean;
  followers: string[]; // user IDs following this list
  createdAt: string;
  updatedAt: string;
};

// ── Book groups ────────────────────────────────────────────

export type GroupMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type BookGroup = {
  id: string;
  name: string;
  description?: string;
  book?: Book;
  adminId: string;
  memberIds: string[];
  messages: GroupMessage[];
  isPublic: boolean;
  createdAt: string;
};
