import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ParentRegisterForm } from "@/components/auth/parent-register-form";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Create parent account" };

export default function ParentRegisterPage() {
  return (
    <AuthShell
      title="Create your parent account"
      description="Link your child's album to get started."
      footer={
        <p>
          Already have an account?{" "}
          <Link href={routes.parentLogin()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <ParentRegisterForm />
    </AuthShell>
  );
}
