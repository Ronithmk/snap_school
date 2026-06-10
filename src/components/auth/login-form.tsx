"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { label: "Platform Admin", email: "admin@snapschool.app" },
  { label: "School Admin", email: "school@snapschool.app" },
];

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "" } });

  async function loginAsDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setValue("email", account.email, { shouldValidate: true });
    setServerError(null);
    try {
      await login.mutateAsync({ email: account.email });
      toast.success("Welcome back!");
      router.push(searchParams.get("from") ?? routes.dashboard.root());
    } catch (err) {
      setServerError((err as ApiError).message ?? t("auth.invalidCredentials"));
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    try {
      await login.mutateAsync(parsed.data);
      toast.success("Welcome back!");
      router.push(searchParams.get("from") ?? routes.dashboard.root());
    } catch (err) {
      const apiError = err as ApiError;
      setServerError(apiError.message ?? t("auth.invalidCredentials"));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@school.edu" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      {serverError ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t("auth.submit")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={routes.register()} className="font-medium text-foreground underline-offset-2 hover:underline">
          Create account
        </Link>
      </p>

      <div className="rounded-xl border border-dashed border-border/60 bg-foreground/[0.02] p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Try a demo account</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => loginAsDemo(account)}
              disabled={login.isPending}
              className="rounded-lg border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium transition-colors hover:bg-foreground/8 disabled:opacity-50"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
