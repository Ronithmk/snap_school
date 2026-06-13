import Link from "next/link";
import { ArrowRight, Bot, Camera, PlayCircle, Sparkles, Tag, TrendingUp, Wand2, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const HERO_PILLS = [
  { icon: Bot, label: "AI face recognition" },
  { icon: Sparkles, label: "AI smart tagging" },
  { icon: Wand2, label: "AI memory books" },
  { icon: Zap, label: "Instant AI search" },
] as const;

/** Cinematic, full-bleed hero — bold headline over a deep navy/aurora canvas with a floating dashboard preview. */
export function HeroSection() {
  return (
    <section className="bg-hero relative isolate overflow-hidden pb-24 pt-36 text-hero-foreground sm:pb-32 sm:pt-44">
      {/* Layered gradient lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[image:var(--gradient-aurora)] opacity-30 blur-[120px]" />
        <div className="animate-float-slow absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-[#C99AB6]/25 blur-[100px]" />
        <div className="animate-float-delayed absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#5D6BB3]/30 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-up glass-hero inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-hero-foreground/85 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#E6CDD7]" />
            The AI operating system for school photography
          </span>

          <h1 className="animate-fade-up delay-75 mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            The modern operating system
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--hero-accent-gradient)" }}
            >
              for school photography
            </span>
          </h1>

          <p className="animate-fade-up delay-150 mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-hero-foreground/70">
            SnapSchool turns thousands of event photos into organized, face-matched, parent-ready
            galleries — automatically. Studios capture, AI does the sorting, families order in minutes.
          </p>

          <div className="animate-fade-up delay-225 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={routes.support()} className={cn(buttonVariants({ size: "lg" }), "animate-gradient-shift rounded-full bg-[image:var(--gradient-aurora)] px-7 shadow-[0_12px_40px_-8px_rgba(201,154,182,0.6)]")}>
              <Sparkles className="h-4.5 w-4.5" />
              Book a demo
            </Link>
            <Link
              href={routes.parentLogin()}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "glass-hero rounded-full px-7 text-hero-foreground hover:bg-hero-surface-2 hover:text-hero-foreground")}
            >
              <PlayCircle className="h-4.5 w-4.5" />
              Explore parent portal
            </Link>
          </div>

          <div className="animate-fade-up delay-300 mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
            {HERO_PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-hero-border bg-hero-surface-2 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/80 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-[#C99AB6]" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Floating cinematic dashboard preview */}
        <div className="animate-fade-up delay-375 relative mx-auto mt-20 max-w-4xl">
          {/* Ambient glow behind the panel */}
          <div aria-hidden className="absolute inset-x-10 -bottom-10 top-10 -z-10 rounded-[40px] bg-[image:var(--gradient-aurora)] opacity-25 blur-3xl" />

          <div className="glass-hero relative overflow-hidden rounded-[28px] p-3 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] sm:p-4">
            <div className="flex items-center justify-between rounded-2xl bg-hero-surface-1 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C99AB6]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#8B82B8]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5D6BB3]" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-hero-surface-2 px-3 py-1 text-[11px] font-medium text-hero-foreground/70">
                <Bot className="h-3 w-3 text-[#E6CDD7]" />
                AI pipeline live
              </span>
            </div>

            <div className="grid gap-3 p-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-hero-border bg-hero-surface-1 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-hero-foreground">Spring Field Day 2026</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#8B82B8]/25 px-2 py-0.5 text-[10px] font-semibold text-[#E6CDD7]">
                    1,284 photos · AI sorted
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {[
                    "from-[#5D6BB3]/50 to-[#8B82B8]/40",
                    "from-[#8B82B8]/50 to-[#C99AB6]/40",
                    "from-[#C99AB6]/50 to-[#E6CDD7]/40",
                    "from-[#E6CDD7]/40 to-[#F5F7FF]/30",
                    "from-[#5D6BB3]/40 to-[#C99AB6]/40",
                    "from-[#8B82B8]/40 to-[#5D6BB3]/40",
                    "from-[#C99AB6]/40 to-[#8B82B8]/40",
                    "from-[#E6CDD7]/30 to-[#C99AB6]/40",
                    "from-[#5D6BB3]/40 to-[#E6CDD7]/30",
                    "from-[#8B82B8]/50 to-[#F5F7FF]/30",
                    "from-[#C99AB6]/40 to-[#5D6BB3]/40",
                    "from-[#F5F7FF]/30 to-[#8B82B8]/40",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ring-1 ring-hero-border",
                        gradient,
                      )}
                    >
                      <Camera className="h-4 w-4 text-hero-foreground/40" />
                      {i === 2 && (
                        <span className="absolute inset-1 rounded-lg border-2 border-white/70" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-hero-border bg-hero-surface-1 p-4">
                  <p className="text-[11px] font-medium text-hero-foreground/55">Revenue today</p>
                  <p className="mt-1 text-2xl font-semibold text-hero-foreground">$4,820</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#9be8c2]">
                    <TrendingUp className="h-3 w-3" />
                    +18.2% vs last week
                  </p>
                </div>
                <div className="flex-1 rounded-2xl border border-hero-border bg-hero-surface-1 p-4">
                  <p className="text-[11px] font-medium text-hero-foreground/55">AI processing</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-hero-foreground/70">
                      <span>Face matching</span>
                      <span>96%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hero-surface-2">
                      <div className="h-full w-[96%] rounded-full bg-[image:var(--gradient-aurora)]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-hero-foreground/70">
                      <span>Album sorting</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hero-surface-2">
                      <div className="h-full w-full rounded-full bg-[image:var(--gradient-aurora)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating face-tag chip */}
          <div className="animate-float glass-hero absolute -left-4 top-1/3 hidden items-center gap-2 rounded-2xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] sm:-left-4 sm:flex lg:-left-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B82B8]/25 text-[#E6CDD7]">
              <Tag className="h-4 w-4" />
            </span>
            <div className="pr-1">
              <p className="text-xs font-semibold text-hero-foreground">Auto-tagged</p>
              <p className="text-[11px] text-hero-foreground/60">Emma R. · 14 photos</p>
            </div>
          </div>

          {/* Floating memory book chip */}
          <div className="animate-float-delayed glass-hero absolute -right-4 bottom-10 hidden items-center gap-2 rounded-2xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] sm:-right-4 sm:flex lg:-right-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C99AB6]/25 text-[#F5F7FF]">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="pr-1">
              <p className="text-xs font-semibold text-hero-foreground">Memory book ready</p>
              <p className="text-[11px] text-hero-foreground/60">Generated in 4.2s</p>
            </div>
          </div>

          {/* Floating "new order" chip */}
          <div className="animate-float-slow glass-hero absolute -bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-2xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] sm:flex">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5D6BB3]/30 text-[#F5F7FF]">
              <ArrowRight className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#9be8c2] ring-2 ring-hero-ring" />
            </span>
            <div className="pr-1">
              <p className="text-xs font-semibold text-hero-foreground">New order placed</p>
              <p className="text-[11px] text-hero-foreground/60">Riverside Elementary · 2m ago</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
