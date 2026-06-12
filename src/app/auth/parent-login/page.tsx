import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ParentLoginForm } from "@/components/auth/parent-login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Parent sign in" };

export default function ParentLoginPage() {
  return (
    <AuthShell
      title="Parent & guardian sign in"
      description="View your child's photos, place orders, and track deliveries."
    >
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <ParentLoginForm />
      </Suspense>
    </AuthShell>
  );
}
