import { Clock, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const POINTS = [
  {
    icon: Lock,
    title: "Encrypted storage",
    description: "Every photo is encrypted at rest and in transit, and tenants are fully isolated from one another.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Galleries are only visible to verified parents and staff — no public links, no search-engine indexing.",
  },
  {
    icon: Trash2,
    title: "Automatic deletion",
    description: "Original photos and personal data are automatically purged a set number of days after the order window closes — no manual cleanup needed.",
  },
] as const;

/** Trust strip — security, privacy, and automatic data-retention messaging. */
export function SecuritySection() {
  return (
    <section className="bg-gradient-luxury relative overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-[#5D6BB3]" />
            Security & privacy
          </span>
          <h2 className="animate-fade-up delay-75 mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Every photo, kept secure — then cleaned up automatically
          </h2>
          <p className="animate-fade-up delay-150 mx-auto mt-4 max-w-xl text-balance text-lg text-muted-foreground">
            Families&rsquo; photos and personal data are encrypted, never public, and
            automatically deleted from our servers a set number of days after each order window closes.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={cn(
                "animate-fade-up glass-premium rounded-3xl p-6",
                i === 0 && "delay-75",
                i === 1 && "delay-150",
                i === 2 && "delay-225",
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-glow">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-up delay-300 mx-auto mt-8 flex max-w-fit items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5 text-[#8B82B8]" />
          Default retention: photos &amp; data are auto-deleted 90 days after the ordering window closes
        </div>
      </div>
    </section>
  );
}
