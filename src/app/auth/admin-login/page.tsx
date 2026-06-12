import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Platform admin sign in" };

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Platform admin sign in"
      description="Restricted access for SnapSchool platform administrators."
      footer={
        <p>
          School admin?{" "}
          <Link href={routes.login()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in here
          </Link>
        </p>
      }
    >
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <AdminLoginForm />
      </Suspense>
    </AuthShell>
  );
}
