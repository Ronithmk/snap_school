import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SchoolFinder } from "@/components/storefront/school-finder";
import { schoolsService } from "@/services";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const HIGHLIGHTS = [
  { icon: Sparkles, title: "One link per album", description: "Every class and event gets its own shareable, password-ready gallery." },
  { icon: Wallet, title: "Currency-aware checkout", description: "Country-specific pricing, tax, and live conversion built in from day one." },
  { icon: ShieldCheck, title: "Fully isolated tenants", description: "Each school's albums, carts, and orders stay completely separate." },
];

export default async function HomePage() {
  const { data: schools } = await schoolsService.list({ pageSize: 6 });

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={routes.login()} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Admin sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              School photo galleries, ordered in minutes.
            </h1>
            <p className="mt-4 text-balance text-lg text-muted-foreground">
              Find your school&rsquo;s gallery, browse class and event albums, and order prints or
              digital downloads — each album has its own cart and checkout.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <SchoolFinder schools={schools} />
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-foreground shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Featured schools</h2>
              <p className="text-sm text-muted-foreground">Jump straight to a gallery.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Link key={school.id} href={routes.storefront.school(school.slug)} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={school.logoUrl} alt="" className="h-full w-full object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{school.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{school.albumCount} albums</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <Logo className="text-sm" />
          <p>&copy; {new Date().getFullYear()} SnapSchool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
