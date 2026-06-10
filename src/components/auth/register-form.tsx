"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const register_ = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", schoolName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register_.mutateAsync(values);
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
