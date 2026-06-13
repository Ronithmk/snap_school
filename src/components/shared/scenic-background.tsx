/**
 * Decorative sunset mountain/sea horizon, rendered in the luxury palette.
 * Sits absolutely behind page content — fades out toward the bottom so it
 * never competes with foreground text or cards.
 */
export function ScenicBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden opacity-25 dark:opacity-15">
      <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMin slice" className="h-full w-full">
        <defs>
          <linearGradient id="scenic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D6BB3" />
            <stop offset="45%" stopColor="#8B82B8" />
            <stop offset="75%" stopColor="#C99AB6" />
            <stop offset="100%" stopColor="#E6CDD7" />
          </linearGradient>
          <radialGradient id="scenic-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5F7FF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#E6CDD7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E6CDD7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="scenic-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5F7FF" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="scenic-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C99AB6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8B82B8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="480" fill="url(#scenic-sky)" />

        {/* Sun glow */}
        <circle cx="1080" cy="190" r="220" fill="url(#scenic-sun)" />

        {/* Far mountains */}
        <path d="M0 320 L180 230 L360 320 L520 220 L720 320 L900 240 L1100 320 L1280 250 L1440 320 L1440 480 L0 480 Z" fill="#5D6BB3" opacity="0.35" />

        {/* Mid mountains */}
        <path d="M0 360 L220 270 L420 360 L640 260 L860 360 L1080 280 L1300 360 L1440 320 L1440 480 L0 480 Z" fill="#8B82B8" opacity="0.45" />

        {/* Near ridge */}
        <path d="M0 400 L260 340 L500 400 L760 330 L1020 400 L1280 350 L1440 400 L1440 480 L0 480 Z" fill="#C99AB6" opacity="0.4" />

        {/* Sea / reflection */}
        <rect x="0" y="400" width="1440" height="80" fill="url(#scenic-sea)" />

        {/* Fade to page background */}
        <rect width="1440" height="480" fill="url(#scenic-fade)" />
      </svg>
    </div>
  );
}
