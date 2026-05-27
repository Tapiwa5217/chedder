import { Book, User, Post, ShelfEntry, BookJournal, Conversation } from './types';

export const mockBooks: Book[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. A proven framework for improving every day.',
    year: 2018,
    subjects: ['Self-Help', 'Psychology', 'Productivity'],
    pages: 320,
  },
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
    description: 'A brief history of humankind from the Stone Age to the twenty-first century.',
    year: 2011,
    subjects: ['History', 'Anthropology', 'Science'],
    pages: 443,
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg',
    description: 'Rules for focused success in a distracted world.',
    year: 2016,
    subjects: ['Productivity', 'Self-Help', 'Business'],
    pages: 296,
  },
  {
    id: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780399590504-M.jpg',
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and educates herself.',
    year: 2018,
    subjects: ['Memoir', 'Biography', 'Education'],
    pages: 334,
  },
  {
    id: 'thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg',
    description: 'Explores the two systems that drive the way we think and make choices.',
    year: 2011,
    subjects: ['Psychology', 'Behavioral Economics', 'Science'],
    pages: 499,
  },
  {
    id: 'alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg',
    description: 'A philosophical novel about a young shepherd who yearns to travel in search of a worldly treasure.',
    year: 1988,
    subjects: ['Fiction', 'Philosophy', 'Adventure'],
    pages: 208,
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
    description: 'A dystopian novel set in a totalitarian society where critical thought is oppressed.',
    year: 1949,
    subjects: ['Fiction', 'Dystopia', 'Classic'],
    pages: 328,
  },
  {
    id: 'mans-search-for-meaning',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780807014271-M.jpg',
    description: "Psychiatrist Viktor Frankl's memoir of his experiences in Nazi death camps and his psychotherapeutic method.",
    year: 1946,
    subjects: ['Psychology', 'Philosophy', 'Memoir'],
    pages: 165,
  },
  {
    id: 'almanack-naval',
    title: 'The Almanack of Naval Ravikant',
    author: 'Eric Jorgenson',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781544514321-M.jpg',
    description: 'A guide to wealth and happiness based on the collected wisdom of Naval Ravikant.',
    year: 2020,
    subjects: ['Business', 'Philosophy', 'Self-Help'],
    pages: 242,
  },
  {
    id: 'power-of-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781577314806-M.jpg',
    description: 'A guide to spiritual enlightenment exploring the concept of present-moment awareness.',
    year: 1997,
    subjects: ['Spirituality', 'Self-Help', 'Philosophy'],
    pages: 236,
  },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Tapiwa Musinga',
    username: 'tapiwam',
    bio: 'Building things & reading about them. CS student. Currently obsessed with philosophy and productivity.',
    avatar: 'TM',
    following: ['u2', 'u3', 'u4'],
    followers: ['u2', 'u5'],
  },
  {
    id: 'u2',
    name: 'Alice Chen',
    username: 'alicechen',
    bio: 'Software engineer by day, avid reader by night. Sci-fi, philosophy, and everything in between.',
    avatar: 'AC',
    following: ['u1', 'u3', 'u5'],
    followers: ['u1', 'u3', 'u4', 'u5'],
  },
  {
    id: 'u3',
    name: 'Marcus Webb',
    username: 'marcuswebb',
    bio: 'Entrepreneur. Building startups and reading biographies. Coffee enthusiast.',
    avatar: 'MW',
    following: ['u1', 'u2'],
    followers: ['u1', 'u2', 'u4'],
  },
  {
    id: 'u4',
    name: 'Sarah Kim',
    username: 'sarahkim',
    bio: 'Researcher & academic. History, science, and the occasional novel. Slow reader, deep thinker.',
    avatar: 'SK',
    following: ['u2', 'u5'],
    followers: ['u1', 'u2'],
  },
  {
    id: 'u5',
    name: 'David Park',
    username: 'davidpark',
    bio: 'Product designer. Reading makes me a better designer. Constantly inspired by the world of ideas.',
    avatar: 'DP',
    following: ['u1', 'u2', 'u3'],
    followers: ['u2', 'u3', 'u4'],
  },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    type: 'finished',
    content: 'Just finished Atomic Habits and it completely changed how I think about building habits. The idea that a 1% improvement each day compounds into massive results is so simple but so powerful. Starting to apply the habit stacking technique immediately.',
    book: mockBooks[0],
    createdAt: '2026-05-21T08:30:00Z',
    likes: ['u1', 'u3', 'u5'],
    comments: [
      { id: 'c1', userId: 'u1', content: 'This book is incredible! The identity-based habits concept really clicked for me.', createdAt: '2026-05-21T09:00:00Z', reactions: [] },
      { id: 'c2', userId: 'u3', content: 'Changed my whole approach to productivity. Highly recommend pairing it with Deep Work.', createdAt: '2026-05-21T09:30:00Z', reactions: [] },
    ],
    rating: 5,
  },
  {
    id: 'p2',
    userId: 'u3',
    type: 'quote',
    content: '"You do not rise to the level of your goals. You fall to the level of your systems." — Atomic Habits. This hit different at 2am when I was doom scrolling instead of sleeping.',
    book: mockBooks[0],
    createdAt: '2026-05-20T22:15:00Z',
    likes: ['u1', 'u2', 'u4'],
    comments: [],
  },
  {
    id: 'p3',
    userId: 'u2',
    type: 'started',
    content: 'Starting Sapiens today! Been wanting to read this for two years. Finally diving in.',
    book: mockBooks[1],
    createdAt: '2026-05-20T10:00:00Z',
    likes: ['u1', 'u5'],
    comments: [
      { id: 'c3', userId: 'u4', content: 'You are going to love it! The chapters on the cognitive revolution are mind-blowing.', createdAt: '2026-05-20T10:30:00Z', reactions: [] },
    ],
  },
  {
    id: 'p4',
    userId: 'u5',
    type: 'review',
    content: "Deep Work by Cal Newport is the most practical book I've read about focus. It reframed how I structure my entire work day. The concept of deep vs shallow work is something every knowledge worker needs to understand. 10/10 required reading.",
    book: mockBooks[2],
    createdAt: '2026-05-19T14:00:00Z',
    likes: ['u1', 'u2', 'u3', 'u4'],
    comments: [
      { id: 'c4', userId: 'u2', content: 'Agreed! I block off 4 hours every morning for deep work now.', createdAt: '2026-05-19T15:00:00Z', reactions: [] },
    ],
    rating: 5,
  },
  {
    id: 'p5',
    userId: 'u4',
    type: 'update',
    content: "60% through Educated. Cannot put it down. Tara Westover's story of self-determination against all odds is one of the most compelling memoirs I have ever read.",
    book: mockBooks[3],
    createdAt: '2026-05-19T09:00:00Z',
    likes: ['u2', 'u3'],
    comments: [],
  },
  {
    id: 'p6',
    userId: 'u3',
    type: 'finished',
    content: "Thinking, Fast and Slow is genuinely one of the most important books I've ever read. Kahneman dismantles everything you think you know about how you make decisions. The implications for business, relationships, and self-awareness are enormous.",
    book: mockBooks[4],
    createdAt: '2026-05-18T16:30:00Z',
    likes: ['u1', 'u2', 'u4', 'u5'],
    comments: [
      { id: 'c5', userId: 'u1', content: 'The anchoring effect chapter alone is worth the whole book.', createdAt: '2026-05-18T17:00:00Z', reactions: [] },
    ],
    rating: 5,
  },
];

export const mockShelf: ShelfEntry[] = [
  {
    book: mockBooks[2],
    shelf: 'read',
    addedAt: '2026-04-15T12:00:00Z',
    rating: 5,
    review:
      "One of the most impactful books I've read on productivity. The framework for deep vs shallow work completely changed how I approach my day.",
  },
  {
    book: mockBooks[0],
    shelf: 'reading',
    addedAt: '2026-05-10T09:00:00Z',
    progress: 65,
  },
  {
    book: mockBooks[1],
    shelf: 'wishlist',
    addedAt: '2026-05-18T14:00:00Z',
  },
  {
    book: mockBooks[7],
    shelf: 'read',
    addedAt: '2026-03-20T10:00:00Z',
    rating: 5,
    review:
      "Profound and deeply moving. Frankl's logotherapy framework gave me a new lens for understanding suffering and meaning.",
  },
  {
    book: mockBooks[8],
    shelf: 'wishlist',
    addedAt: '2026-05-20T11:00:00Z',
  },
];

export const mockJournals: BookJournal[] = [
  {
    id: 'j1',
    userId: 'u1',
    bookId: 'deep-work',
    book: mockBooks[2],
    title: 'Deep Work — How It Changed My Productivity',
    content: `This is one of the most actionable books I've ever read. Newport's central argument — that the ability to perform deep work is becoming increasingly rare and increasingly valuable — has completely reframed how I think about my career.

The concept of "deep work" vs "shallow work" is deceptively simple but the implications are profound. I've started treating my ability to focus as a skill I need to actively train, not something that just happens.

The most practical change: I now block 3-4 hours every morning for deep work before even checking my phone or email. The results have been genuinely transformative.`,
    lessons: [
      'Deep work is a skill — practice it like a muscle, it atrophies without use',
      'Schedule distraction, not focus (reverse the default assumption)',
      'Embrace boredom — concentration requires tolerance for discomfort',
      'End each workday with a shutdown ritual to protect rest time',
      'Social media is a slot machine for attention — use it with intention or not at all',
    ],
    isPublic: true,
    createdAt: '2026-04-22T10:00:00Z',
    updatedAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 'j2',
    userId: 'u1',
    bookId: 'mans-search-for-meaning',
    book: mockBooks[7],
    title: "Frankl on Finding Meaning",
    content: `Reading this in a single sitting. Frankl's ability to find meaning in the most extreme suffering imaginable is both humbling and instructive. The core insight — that we cannot avoid suffering, but we can choose how we respond to it — is something I keep returning to.

Logotherapy shifts the question from "What do I expect from life?" to "What does life expect from me?" That reframing is profound.`,
    lessons: [
      'Meaning can be found even in unavoidable suffering',
      'Freedom lies in the space between stimulus and response',
      'We cannot control what happens to us, only our attitude toward it',
    ],
    isPublic: false,
    createdAt: '2026-03-22T14:00:00Z',
    updatedAt: '2026-03-22T14:00:00Z',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participantIds: ['u1', 'u2'],
    messages: [
      { id: 'm1', senderId: 'u2', content: 'Hey! Just finished Atomic Habits — have you read it?', createdAt: '2026-05-21T07:00:00Z' },
      { id: 'm2', senderId: 'u1', content: 'Currently reading it! The habit stacking concept is mind-blowing. Which part hit hardest for you?', createdAt: '2026-05-21T07:05:00Z' },
      { id: 'm3', senderId: 'u2', content: '"Every action is a vote for the type of person you wish to become." That line lives rent-free in my head now 🔥', createdAt: '2026-05-21T07:10:00Z' },
      { id: 'm4', senderId: 'u1', content: "That's the identity chapter. Starting a reading log tonight because of it!", createdAt: '2026-05-21T07:15:00Z' },
    ],
  },
  {
    id: 'conv2',
    participantIds: ['u1', 'u3'],
    messages: [
      { id: 'm5', senderId: 'u3', content: "What's next on your list after Deep Work? That review you posted was 🔥", createdAt: '2026-05-20T14:00:00Z' },
      { id: 'm6', senderId: 'u1', content: 'Thinking Sapiens or The Almanack of Naval. You?', createdAt: '2026-05-20T14:30:00Z' },
      { id: 'm7', senderId: 'u3', content: "Do Sapiens first, trust me. It's life-changing. Naval can wait.", createdAt: '2026-05-20T15:00:00Z' },
    ],
  },
  {
    id: 'conv3',
    participantIds: ['u1', 'u4'],
    messages: [
      { id: 'm8', senderId: 'u4', content: 'Your journal entry on Deep Work was so well written. Do you share them publicly?', createdAt: '2026-05-19T10:00:00Z' },
      { id: 'm9', senderId: 'u1', content: 'Thanks Sarah! Some are public, some I keep private. Good motivation to write more though 😄', createdAt: '2026-05-19T10:20:00Z' },
    ],
  },
];
