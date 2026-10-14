/** PKeStore "pk" monogram — logo icon (cPanel-style app icon). */
export function PkMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id="pk-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16856f" />
          <stop offset="1" stopColor="#0a4a42" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill="url(#pk-mark-bg)" />
      <g transform="translate(-10 6)">
        <g fill="none" stroke="#fff" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="226" cy="252" r="74" />
          <path d="M152 252 V400" />
          <path d="M300 104 V326" />
          <path d="M338 270 L396 326" />
        </g>
        <path d="M300 262 L392 188" fill="none" stroke="#f5b53a" strokeWidth="48" strokeLinecap="round" />
      </g>
    </svg>
  );
}
