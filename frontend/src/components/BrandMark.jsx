export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="bm-a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="bm-b" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <path d="M8 12 L28 12 L36 22 L16 22 Z" fill="url(#bm-a)" />
      <path d="M12 26 L32 26 L40 36 L20 36 Z" fill="url(#bm-b)" />
    </svg>
  );
}
