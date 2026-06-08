import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Link href={routes.home()} className="inline-flex">
            <Logo />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground">
            Platform admins and school admins use the same form — access is role-based.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
