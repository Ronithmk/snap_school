import {
  Copy,
  Eye,
  FolderTree,
  ImagePlus,
  Layers,
  Search,
  Sparkles,
  Tags,
  ThumbsUp,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Eye,
    title: "AI face recognition",
    description: "Every student is matched across thousands of photos automatically — no manual tagging required.",
    span: "lg:col-span-2 lg:row-span-2",
    accent: "from-[#5D6BB3] to-[#8B82B8]",
  },
  {
    icon: FolderTree,
    title: "AI album organization",
    description: "Photos are sorted into class, event, and student albums the moment they're uploaded.",
    span: "lg:col-span-1",
    accent: "from-[#8B82B8] to-[#C99AB6]",
  },
  {
    icon: Tags,
    title: "AI smart tagging",
    description: "Activities, outfits, and locations are tagged for instant filtering and search.",
    span: "lg:col-span-1",
    accent: "from-[#C99AB6] to-[#E6CDD7]",
  },
  {
    icon: Wand2,
    title: "AI memory book generation",
    description: "Auto-curated yearbooks and memory books generated from a child's best shots — ready to print or gift.",
    span: "lg:col-span-2",
    accent: "from-[#C99AB6] to-[#5D6BB3]",
  },
  {
    icon: Sparkles,
    title: "AI photo enhancement",
    description: "Color, exposure, and sharpness corrected automatically on every image.",
    span: "lg:col-span-1",
    accent: "from-[#5D6BB3] to-[#E6CDD7]",
  },
  {
    icon: Copy,
    title: "AI duplicate filtering",
    description: "Near-identical burst shots are detected and the best frame is kept.",
    span: "lg:col-span-1",
    accent: "from-[#8B82B8] to-[#5D6BB3]",
  },
  {
    icon: Layers,
    title: "AI bulk sorting",
    description: "Tens of thousands of files sorted by class, student, and event in minutes, not days.",
    span: "lg:col-span-1",
    accent: "from-[#E6CDD7] to-[#8B82B8]",
  },
  {
    icon: ThumbsUp,
    title: "AI parent recommendations",
    description: "Each gallery highlights the shots parents are most likely to love and order.",
    span: "lg:col-span-1",
    accent: "from-[#C99AB6] to-[#8B82B8]",
  },
  {
    icon: Search,
    title: "AI-powered instant search",
    description: "Search any gallery by child, activity, or moment — results in milliseconds.",
    span: "lg:col-span-1",
    accent: "from-[#5D6BB3] to-[#C99AB6]",
  },
] as const;

/** Bento-grid AI features showcase with layered gradients and hover glow. */
export function FeaturesGridSection() {
  return (
    <section id="ai-features" className="bg-gradient-luxury relative overflow-hidden py-24 sm:py-32">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <ImagePlus className="h-3.5 w-3.5 text-[#8B82B8]" />
            AI features
          </span>
          <h2 className="animate-fade-up delay-75 mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            AI built into every step
          </h2>
          <p className="animate-fade-up delay-150 mx-auto mt-4 max-w-xl text-balance text-lg text-muted-foreground">
            Nine AI systems work together behind the scenes so your team — and every
            family — gets a flawless gallery experience.
          </p>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-4 lg:grid-rows-3">
          {FEATURES.map(({ icon: Icon, title, description, span, accent }, i) => (
            <div
              key={title}
              className={cn(
                "animate-fade-up glass-premium group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6",
                span,
                i % 4 === 0 && "delay-75",
                i % 4 === 1 && "delay-150",
                i % 4 === 2 && "delay-225",
                i % 4 === 3 && "delay-300",
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40",
                  accent,
                )}
              />
              <span className={cn("relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-glow transition-transform duration-300 group-hover:scale-110", accent)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="relative">
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
