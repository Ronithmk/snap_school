import { Camera, ImageIcon, Sparkles } from "lucide-react";

export function AuthIllustration() {
  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-gradient-to-br from-amber-200 via-orange-300 to-rose-400 p-10 text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-48 w-48 rounded-full bg-yellow-100/60 blur-2xl" />

      {/* Mountain silhouettes */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 180 L80 90 L150 160 L230 60 L320 150 L400 100 L400 300 L0 300 Z" fill="oklch(0.4 0.08 35 / 35%)" />
        <path d="M0 220 L100 140 L190 210 L260 130 L400 200 L400 300 L0 300 Z" fill="oklch(0.28 0.07 35 / 45%)" />
      </svg>

      {/* Floating photo cards */}
      <div className="pointer-events-none absolute right-12 top-16 flex h-24 w-20 -rotate-6 items-center justify-center rounded-xl bg-white/90 shadow-xl">
        <ImageIcon className="h-8 w-8 text-orange-400" />
      </div>
      <div className="pointer-events-none absolute right-32 top-44 flex h-20 w-16 rotate-3 items-center justify-center rounded-xl bg-white/85 shadow-lg">
        <Camera className="h-6 w-6 text-rose-400" />
      </div>

      {/* Copy */}
      <div className="relative z-10 max-w-sm space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          SnapSchool
        </span>
        <h2 className="text-3xl font-bold leading-tight tracking-tight">
          Every school memory, beautifully delivered.
        </h2>
        <p className="text-sm text-white/85">
          Browse galleries, order prints, and track deliveries — all in one place for your school community.
        </p>
      </div>
    </div>
  );
}
