"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, LifeBuoy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSubmitSupportTicket } from "@/hooks/use-support";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Please describe your issue in at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SupportPage() {
  const submitTicket = useSubmitSupportTicket();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: "", email: "", subject: "", message: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await submitTicket.mutateAsync(values);
      toast.success("Message sent! Our team will get back to you soon.");
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError((err as ApiError).message ?? "Couldn't send your message. Please try again.");
    }
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="glass-navbar sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={routes.home()}>
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={routes.home()} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="glass animate-fade-up rounded-2xl border border-border p-8 shadow-[0_8px_40px_oklch(0_0_0/18%)]">
          <div className="mb-6 space-y-2 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-foreground">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-semibold tracking-tight">Need help?</h1>
            <p className="text-sm text-muted-foreground">
              Send us a message about login issues, orders, refunds, or anything else — we&apos;ll get back to you by email.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-foreground/[0.02] p-6 text-center">
              <p className="text-sm font-medium">Thanks for reaching out!</p>
              <p className="mt-1 text-sm text-muted-foreground">We&apos;ve received your message and will respond as soon as we can.</p>
              <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="support-name">Your name</Label>
                <Input id="support-name" autoComplete="name" placeholder="Jane Smith" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-email">Email</Label>
                <Input id="support-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" placeholder="e.g. Can't access my order" {...register("subject")} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-message">Message</Label>
                <Textarea id="support-message" rows={5} placeholder="Tell us what's going on…" {...register("message")} />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>

              {serverError && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitTicket.isPending}>
                {submitTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send message
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
