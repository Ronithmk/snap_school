"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParentRegister } from "@/hooks/use-parent";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    username: z.string().min(1, "Your child's username is required"),
    accessCode: z.string().min(1, "Your child's access code is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ParentRegisterForm() {
  const router = useRouter();
  const parentRegister = useParentRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", username: "", accessCode: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await parentRegister.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username,
        accessCode: values.accessCode,
      });
      toast.success("Account created! Please sign in to continue.");
      router.push(routes.parentLogin());
    } catch (err) {
      const msg = (err as ApiError).message ?? "Couldn't create your account. Please try again.";
      setServerError(msg);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="parent-reg-name">Your name</Label>
        <Input id="parent-reg-name" autoComplete="name" placeholder="Jane Smith" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-reg-email">Email</Label>
        <Input id="parent-reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-reg-password">Password</Label>
        <div className="relative">
          <Input
            id="parent-reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
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
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-reg-confirm">Confirm password</Label>
        <Input id="parent-reg-confirm" type="password" autoComplete="new-password" placeholder="Repeat your password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <div className="rounded-xl border border-dashed border-border/60 bg-foreground/[0.02] p-3 space-y-3">
        <p className="text-xs text-muted-foreground">
          Enter the username and access code your child&apos;s school gave you to link your account to your
          child&apos;s photo album.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="parent-reg-username">Child&apos;s username</Label>
          <Input id="parent-reg-username" autoComplete="off" placeholder="e.g. jsmith2031" {...register("username")} />
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parent-reg-access-code">Access code</Label>
          <Input id="parent-reg-access-code" autoComplete="off" placeholder="e.g. AB12CD" {...register("accessCode")} />
          {errors.accessCode && <p className="text-xs text-destructive">{errors.accessCode.message}</p>}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={parentRegister.isPending}>
        {parentRegister.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
