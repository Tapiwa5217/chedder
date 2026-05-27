'use client';

import { useEffect, useRef } from 'react';

const EMOJIS = [
  '😂','😍','🔥','❤️','👍','🙌','😭','😊','🎉','💯',
  '📚','✨','💪','👀','😮','🤔','💬','😅','🥲','😤',
  '🤩','💀','😎','🙏','👏','💡','🎯','😢','😡','🤯',
];

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  /** Position above the trigger (default) or below */
  position?: 'above' | 'below';
};

export default function EmojiPicker({ onSelect, onClose, position = 'above' }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute ${position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-30 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2.5 w-52`}
    >
      <div className="grid grid-cols-6 gap-0.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
