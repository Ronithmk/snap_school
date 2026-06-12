import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { BackButton } from "@/components/auth/back-button";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import { routes } from "@/config/routes";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="relative flex w-full flex-col px-6 py-6 sm:px-10 lg:w-1/2 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <BackButton />
          <Link href={routes.home()} className="inline-flex">
            <Logo />
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="animate-fade-up w-full max-w-sm space-y-7">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>

        {footer ? <div className="pb-2 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>

      <div className="relative hidden flex-1 lg:block">
        <AuthIllustration />
      </div>
    </div>
  );
}
