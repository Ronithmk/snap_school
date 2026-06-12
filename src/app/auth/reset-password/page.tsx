import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong password for your account."
      footer={
        <p>
          <Link href={routes.login()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
