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
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function ParentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
      toast.success("Welcome back!");
      router.push(searchParams.get("from") ?? routes.parent.root());
    } catch (err) {
      setServerError((err as ApiError).message ?? "Invalid email or password.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="parent-email">Email</Label>
        <Input id="parent-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="parent-password">Password</Label>
          <Link href={routes.forgotPassword()} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="parent-password"
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
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={routes.parentRegister()} className="font-medium text-foreground underline-offset-2 hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
