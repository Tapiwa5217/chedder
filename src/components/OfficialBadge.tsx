export default function OfficialBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span
      title="Official Chedder account"
      className={`inline-flex items-center justify-center ${dim} rounded-full bg-amber-400 flex-shrink-0`}
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="w-2.5 h-2.5"
        aria-hidden="true"
      >
        <path
          d="M2 6.5L4.5 9L10 3"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
