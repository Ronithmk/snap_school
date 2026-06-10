import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Logo } from "@/components/shared/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Platform admin sign in" };

export default function AdminLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass animate-fade-up w-full max-w-sm rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
        <div className="mb-7 space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex justify-center">
            <Logo />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Platform admin sign in</h1>
          <p className="text-xs text-muted-foreground">
            Restricted access for SnapSchool platform administrators.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
          <AdminLoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          School admin?{" "}
          <Link href={routes.login()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
