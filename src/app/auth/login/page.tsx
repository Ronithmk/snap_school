import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass animate-fade-up w-full max-w-sm rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
        <div className="mb-7 space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex justify-center">
            <Logo />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Sign in to your account</h1>
          <p className="text-xs text-muted-foreground">
            Platform admins and school admins use the same form — access is role-based.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
