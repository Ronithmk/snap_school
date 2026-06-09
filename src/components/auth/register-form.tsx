"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types";

// ── Password rules ─────────────────────────────────────────────────

const PASSWORD_RULES = [
  { id: "length",    label: "At least 8 characters",    test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number",    label: "One number (0–9)",           test: (v: string) => /[0-9]/.test(v) },
  { id: "special",   label: "One special character (!@#…)", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
] as const;

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters required")
  .refine((v) => /[A-Z]/.test(v), { message: "Must contain an uppercase letter" })
  .refine((v) => /[0-9]/.test(v), { message: "Must contain a number" })
  .refine((v) => /[^a-zA-Z0-9]/.test(v), { message: "Must contain a special character" });

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    schoolName: z.string().min(2, "School name must be at least 2 characters"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

// ── Password strength bar ──────────────────────────────────────────

function strengthScore(password: string): number {
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}

function StrengthBar({ password }: { password: string }) {
  const score = strengthScore(password);
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              n <= score ? colors[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium w-12 text-right transition-colors", score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-600" : "text-red-600")}>
        {labels[score]}
      </span>
    </div>
  );
}

function PasswordCriteria({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={cn("flex items-center gap-1.5 text-xs transition-colors", ok ? "text-emerald-600" : "text-muted-foreground")}>
            {ok ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

// ── Form ───────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const register_ = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", schoolName: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register_.mutateAsync({
        name: values.name,
        email: values.email,
        schoolName: values.schoolName,
        password: values.password,
      });
      toast.success("Account created! Welcome to SnapSchool.");
      router.push(routes.dashboard.root());
    } catch (err) {
      const msg = (err as ApiError).message ?? "Couldn't create your account. Please try again.";
      setServerError(msg);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Full name */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-name">Full name</Label>
        <Input id="reg-name" autoComplete="name" placeholder="Alex Johnson" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" autoComplete="email" placeholder="you@school.edu" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {/* School name */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-school">School name</Label>
        <Input id="reg-school" placeholder="Riverside Elementary" {...register("schoolName")} />
        {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <StrengthBar password={passwordValue} />
        <PasswordCriteria password={passwordValue} />
        {errors.password && !passwordValue && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <div className="relative">
          <Input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide" : "Show"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={register_.isPending}>
        {register_.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to our{" "}
        <span className="cursor-pointer underline-offset-2 hover:underline">Terms of Service</span>
        {" "}and{" "}
        <span className="cursor-pointer underline-offset-2 hover:underline">Privacy Policy</span>.
      </p>
    </form>
  );
}
