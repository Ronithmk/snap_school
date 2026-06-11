import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Camera,
  GraduationCap,
  Images,
  LifeBuoy,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SchoolFinder } from "@/components/storefront/school-finder";
import { db } from "@/lib/db";
import { formatDbSchool } from "@/lib/format-school";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { School } from "@/types";

export const revalidate = 300;

const HIGHLIGHTS = [
  { icon: Sparkles, title: "One link per album", description: "Every class and event gets its own shareable, password-ready gallery." },
  { icon: Wallet, title: "Currency-aware checkout", description: "Country-specific pricing, tax, and live conversion built in from day one." },
  { icon: ShieldCheck, title: "Fully isolated tenants", description: "Each school's albums, carts, and orders stay completely separate." },
];

const NAV_PORTALS = [
  { label: "School Admin", href: routes.login(), icon: GraduationCap },
  { label: "Parent", href: routes.parentLogin(), icon: Users },
  { label: "Studio", href: routes.adminLogin(), icon: Camera },
] as const;

const MORE_FEATURES = [
  { icon: ShoppingBag, title: "Bulk & group ordering", description: "Schools can place institutional orders for prints and packages in a single checkout." },
  { icon: Users, title: "Secure parent portal", description: "Parents get their own account, order history, and access to only their own children's albums." },
  { icon: Package, title: "Watermarked previews", description: "Browse full galleries with watermarked previews — purchased photos unlock secure, watermark-free downloads." },
];

export default async function HomePage() {
  let schools: School[] = [];
  try {
    const [rawSchools, albumCounts] = await Promise.all([
      db.school.findMany({
        where: { status: "active" },
        orderBy: { name: "asc" },
        take: 6,
      }),
      db.album.groupBy({ by: ["schoolId"], _count: true }),
    ]);
    const albumMap = Object.fromEntries(albumCounts.map((a) => [a.schoolId, a._count]));
    schools = rawSchools.map((s) => formatDbSchool(s, { albumCount: albumMap[s.id] ?? 0 }));
  } catch {
    // DB not reachable at build time — ISR will populate on first request
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-60 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.75 0 0) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/4 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.65 0 0) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Navbar */}
      <header className="glass-navbar sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            {NAV_PORTALS.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className={cn(buttonVariants({ variant: "outline", size: "default" }))}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <ThemeToggle size="default" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy + search + AI highlights */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-up">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  School photo platform
                </span>
              </div>
              <h1 className="animate-fade-up delay-75 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-gradient">School photo galleries,</span>
                <br />
                ordered in minutes.
              </h1>
              <p className="animate-fade-up delay-150 mx-auto mt-5 text-balance text-lg text-muted-foreground lg:mx-0">
                Find your school&rsquo;s gallery, browse class and event albums, and order prints or
                digital downloads — each album has its own cart and checkout.
              </p>

              <div className="animate-fade-up delay-225 mx-auto mt-8 max-w-xl lg:mx-0">
                <SchoolFinder schools={schools} />
              </div>

              {/* AI feature highlights */}
              <div className="animate-fade-up delay-300 mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                  <Bot className="h-3.5 w-3.5" />
                  AI face matching
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart curation
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                  <Wand2 className="h-3.5 w-3.5" />
                  Memory books
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                  <Camera className="h-3.5 w-3.5" />
                  Live event uploads
                </span>
              </div>
            </div>

            {/* Right: AI-powered gallery preview */}
            <div className="animate-fade-up delay-150 relative hidden lg:block">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl"
              />
              <div className="glass relative mx-6 mb-10 mt-6 rounded-3xl border border-border p-5 shadow-[0_24px_70px_oklch(0_0_0/14%)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-foreground/5">
                      <Images className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Spring Field Day 2026</p>
                      <p className="text-xs text-muted-foreground">128 photos · 3 classes</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    <Bot className="h-3 w-3" />
                    AI sorted
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    "from-amber-100 to-orange-200",
                    "from-sky-100 to-blue-200",
                    "from-emerald-100 to-teal-200",
                    "from-rose-100 to-pink-200",
                    "from-violet-100 to-fuchsia-200",
                    "from-lime-100 to-green-200",
                  ].map((gradient, i) => (
                    <div
                      key={gradient}
                      className={cn(
                        "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ring-1 ring-black/5",
                        gradient,
                      )}
                    >
                      <Camera className="h-5 w-5 text-foreground/25" />
                      {i === 1 && (
                        <span className="absolute inset-2.5 rounded-lg border-2 border-white/90 shadow-[0_0_0_1px_oklch(0_0_0/10%)]" />
                      )}
                      {i === 4 && (
                        <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700 shadow-sm backdrop-blur-sm">
                          <Sparkles className="h-2.5 w-2.5" />
                          Best shot
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Floating face-tag chip */}
                <div className="glass absolute -bottom-6 -left-4 flex items-center gap-2 rounded-2xl border border-border bg-background/95 p-3 shadow-[0_8px_24px_oklch(0_0_0/14%)]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div className="pr-1">
                    <p className="text-xs font-semibold">Auto-tagged</p>
                    <p className="text-[11px] text-muted-foreground">Emma R. · 14 photos</p>
                  </div>
                </div>

                {/* Floating memory book chip */}
                <div className="glass absolute -bottom-6 -right-4 flex items-center gap-2 rounded-2xl border border-border bg-background/95 p-3 shadow-[0_8px_24px_oklch(0_0_0/14%)]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    <Wand2 className="h-4 w-4" />
                  </span>
                  <div className="pr-1">
                    <p className="text-xs font-semibold">Memory book ready</p>
                    <p className="text-[11px] text-muted-foreground">Download as PDF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border/50 bg-foreground/[0.015] backdrop-blur-sm">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className={cn(
                  "animate-fade-up space-y-3",
                  i === 0 && "delay-75",
                  i === 1 && "delay-150",
                  i === 2 && "delay-225",
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-foreground shadow-[0_1px_4px_oklch(0_0_0/8%)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* More for everyone */}
        <section className="border-y border-border/50 bg-foreground/[0.015] backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">More for everyone</h2>
              <p className="text-sm text-muted-foreground">Built for schools, families, and our studio team alike.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MORE_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="glass space-y-3 rounded-2xl border border-border p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
              <Link
                href={routes.support()}
                className="glass group flex flex-col justify-between space-y-3 rounded-2xl border border-border p-5 transition-all duration-200 hover:border-border/80 hover:shadow-[0_4px_20px_oklch(0_0_0/12%)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-foreground">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Need help?</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Get in touch with our support team for login, order, or refund issues.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  Contact support
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured schools */}
        {schools.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Featured schools</h2>
                <p className="text-sm text-muted-foreground">Jump straight to a gallery.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schools.map((school, i) => (
                <Link
                  key={school.id}
                  href={routes.storefront.school(school.slug)}
                  className={cn(
                    "glass animate-fade-up group flex items-center gap-4 rounded-2xl border border-border p-4 transition-all duration-200 hover:border-border/80 hover:shadow-[0_4px_20px_oklch(0_0_0/12%)]",
                    i === 0 && "delay-75",
                    i === 1 && "delay-150",
                    i === 2 && "delay-225",
                  )}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted">
                    {school.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold uppercase text-muted-foreground">
                        {school.name.slice(0, 2)}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{school.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{school.albumCount} albums</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border/50 bg-foreground/[0.015] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <Logo className="text-sm" />
          <div className="flex items-center gap-4">
            <Link href={routes.support()} className="hover:text-foreground hover:underline underline-offset-2">
              Support
            </Link>
            <p>&copy; {new Date().getFullYear()} SnapSchool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
