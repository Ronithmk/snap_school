import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ParentLoginForm } from "@/components/auth/parent-login-form";
import { Logo } from "@/components/shared/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Parent sign in" };

export default function ParentLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass animate-fade-up w-full max-w-sm rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
        <div className="mb-7 space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex justify-center">
            <Logo />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Parent &amp; guardian sign in</h1>
          <p className="text-xs text-muted-foreground">
            View your child&apos;s photos, place orders, and track deliveries.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <ParentLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
