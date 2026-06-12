import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to your account"
      description="School admin sign in."
      footer={
        <p>
          Platform admin?{" "}
          <Link href={routes.adminLogin()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in here
          </Link>
        </p>
      }
    >
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
