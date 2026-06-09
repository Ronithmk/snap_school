import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/shared/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass animate-fade-up w-full max-w-sm rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
        <div className="mb-7 space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex justify-center">
            <Logo />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Set a new password</h1>
          <p className="text-xs text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href={routes.login()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
