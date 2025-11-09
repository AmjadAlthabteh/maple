export function MapleLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* M Letter with modern design */}
      <path
        d="M20 75V35L35 55L50 35L65 55L80 35V75H70V50L50 70L30 50V75H20Z"
        fill="currentColor"
        className="text-blue-600"
      />
      {/* Accent dot */}
      <circle cx="50" cy="25" r="5" fill="currentColor" className="text-blue-400" />
    </svg>
  );
}

export function MapleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center font-bold text-blue-600 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg`}>
      M
    </div>
  );
}
