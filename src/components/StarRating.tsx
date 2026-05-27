'use client';

import { Star } from 'lucide-react';

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
};

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  return (
    <div className={`flex ${size === 'sm' ? 'gap-0.5' : 'gap-1'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'} ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:text-amber-400'
          }`}
        >
          <Star
            className={size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'}
            fill={star <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}
