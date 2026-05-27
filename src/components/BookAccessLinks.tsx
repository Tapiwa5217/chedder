import { Book } from '@/lib/types';
import { ShoppingCart, Smartphone, Headphones, BookOpen, ExternalLink, type LucideIcon } from 'lucide-react';

type Platform = {
  name: string;
  Icon: LucideIcon;
  label: string;
  color: string;
  getUrl: (book: Book) => string;
};

const PLATFORMS: Platform[] = [
  {
    name: 'amazon',
    Icon: ShoppingCart,
    label: 'Buy on Amazon',
    color: 'bg-amber-500 hover:bg-amber-400',
    getUrl: (b) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(`${b.title} ${b.author}`)}`,
  },
  {
    name: 'kindle',
    Icon: Smartphone,
    label: 'Kindle Edition',
    color: 'bg-sky-600 hover:bg-sky-500',
    getUrl: (b) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(`${b.title} ${b.author}`)}&i=digital-text`,
  },
  {
    name: 'audible',
    Icon: Headphones,
    label: 'Audible Audiobook',
    color: 'bg-orange-500 hover:bg-orange-400',
    getUrl: (b) =>
      `https://www.audible.com/search?keywords=${encodeURIComponent(`${b.title} ${b.author}`)}`,
  },
  {
    name: 'googleplay',
    Icon: BookOpen,
    label: 'Google Play Books',
    color: 'bg-emerald-600 hover:bg-emerald-500',
    getUrl: (b) =>
      `https://play.google.com/store/search?q=${encodeURIComponent(b.title)}&c=books`,
  },
  {
    name: 'openlibrary',
    Icon: BookOpen,
    label: 'Open Library (Free)',
    color: 'bg-amber-500 hover:bg-amber-500',
    getUrl: (b) =>
      `https://openlibrary.org/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}`,
  },
];

export default function BookAccessLinks({ book }: { book: Book }) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Get this Book</h3>
      <div className="space-y-2">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.getUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 ${p.color} text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors group`}
          >
            <p.Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{p.label}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
        Progress sync with Kindle & Audible coming soon.
      </p>
    </div>
  );
}
