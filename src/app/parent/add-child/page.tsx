"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinkChild } from "@/hooks/use-parent";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

const schema = z.object({
  username: z.string().min(1, "Your child's username is required"),
  accessCode: z.string().min(1, "Your child's access code is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AddChildPage() {
  const router = useRouter();
  const linkChild = useLinkChild();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { username: "", accessCode: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await linkChild.mutateAsync(values);
      toast.success("Child linked to your account!");
      router.push(routes.parent.root());
    } catch (err) {
      setServerError((err as ApiError).message ?? "Couldn't link this child. Please check the details and try again.");
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader title="Add another child" description="Link a sibling's album using the username and access code from their school." />

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-username">Child&apos;s username</Label>
              <Input id="add-username" autoComplete="off" placeholder="e.g. jsmith2031" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-access-code">Access code</Label>
              <Input id="add-access-code" autoComplete="off" placeholder="e.g. AB12CD" {...register("accessCode")} />
              {errors.accessCode && <p className="text-xs text-destructive">{errors.accessCode.message}</p>}
            </div>

            {serverError && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={linkChild.isPending}>
              {linkChild.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link child
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
