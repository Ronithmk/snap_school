import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/shared/logo";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass animate-fade-up w-full max-w-sm rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
        <div className="mb-7 space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex justify-center">
            <Logo />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Create your account</h1>
          <p className="text-xs text-muted-foreground">
            Set up your school photography workspace in seconds.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href={routes.login()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
