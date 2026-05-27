const COLORS = [
  'bg-amber-500',
  'bg-amber-400',
  'bg-yellow-500',
  'bg-amber-600',
  'bg-yellow-400',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
];

function getColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

type AvatarProps = {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  colorSeed?: string;
  avatarUrl?: string;
  /** Override the size class entirely — useful when the Avatar sits inside
   *  a custom-sized container (e.g. "w-full h-full"). */
  className?: string;
};

const SIZE = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function Avatar({ initials, size = 'md', colorSeed, avatarUrl, className }: AvatarProps) {
  const sizeClass = className ?? SIZE[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={initials}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  const color = getColor(colorSeed ?? initials);
  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
