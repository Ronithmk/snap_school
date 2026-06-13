import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "2.4M+", label: "Photos processed by AI" },
  { value: "180+", label: "Schools & studios onboard" },
  { value: "98%", label: "Parent satisfaction" },
  { value: "<60s", label: "Average checkout time" },
] as const;

const TESTIMONIALS = [
  {
    quote: "SnapSchool's AI sorting cut our post-event workload from three days to under an hour. Parents see their galleries the same evening now.",
    name: "Priya Nair",
    role: "Founder, Lakeside Photography Studio",
  },
  {
    quote: "The face-matching is uncannily accurate, even in big group shots. Our front office stopped getting 'where's my child's photo' emails entirely.",
    name: "Marcus Webb",
    role: "Operations Director, Riverside Schools Group",
  },
  {
    quote: "It feels like a premium retail app, not a school photo portal. Our order volume nearly doubled the first term we switched.",
    name: "Elena Castillo",
    role: "Studio Manager, Castillo Creative",
  },
] as const;

/** Social proof — stats band + large premium testimonials on a deep navy canvas. */
export function SocialProofSection() {
  return (
    <section className="bg-hero relative overflow-hidden py-24 text-hero-foreground sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[image:var(--gradient-aurora)] opacity-20 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 border-b border-hero-border pb-16 sm:grid-cols-4">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={cn(
                "animate-fade-up text-center sm:text-left",
                i === 0 && "delay-75",
                i === 1 && "delay-150",
                i === 2 && "delay-225",
                i === 3 && "delay-300",
              )}
            >
              <p
                className="bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
                style={{ backgroundImage: "var(--hero-accent-gradient)" }}
              >
                {value}
              </p>
              <p className="mt-2 text-sm text-hero-foreground/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 text-center">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-hero-border-strong bg-hero-surface-2 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/80 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 text-[#E6CDD7]" />
            Trusted by studios & schools
          </span>
          <h2 className="animate-fade-up delay-75 mx-auto mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Loved by the teams running it
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <div
              key={name}
              className={cn(
                "animate-fade-up glass-hero relative flex flex-col gap-5 rounded-3xl p-7",
                i === 0 && "delay-150",
                i === 1 && "delay-225",
                i === 2 && "delay-300",
              )}
            >
              <Quote className="h-7 w-7 text-[#C99AB6]/70" />
              <p className="flex-1 text-balance text-sm leading-relaxed text-hero-foreground/80">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-hero-border pt-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  {name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-hero-foreground">{name}</p>
                  <p className="text-xs text-hero-foreground/55">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
