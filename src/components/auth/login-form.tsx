"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { label: "Platform Admin", email: "admin@snapschool.app", password: "demo1234" },
  { label: "School Admin", email: "school@snapschool.app", password: "demo1234" },
];

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  async function loginAsDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    setServerError(null);
    try {
      await login.mutateAsync({ email: account.email, password: account.password });
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Link href={routes.forgotPassword()} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
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

      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Try a demo account</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => loginAsDemo(account)}
              disabled={login.isPending}
              className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
