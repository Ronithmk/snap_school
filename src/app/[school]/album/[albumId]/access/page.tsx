"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlbum, useVerifyAlbumAccess } from "@/hooks/use-albums";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { grantAlbumAccess } from "@/lib/album-access";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

interface AlbumAccessPageProps {
  params: Promise<{ school: string; albumId: string }>;
}

export default function AlbumAccessPage({ params }: AlbumAccessPageProps) {
  const { school: schoolSlug, albumId } = use(params);
  const router = useRouter();
  const { data: school } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading } = useAlbum(albumId);
  const verifyAccess = useVerifyAlbumAccess();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    verifyAccess.mutate(
      { albumId, password },
      {
        onSuccess: ({ granted }) => {
          if (!granted) {
            setError("Incorrect password. Please try again.");
            return;
          }
          grantAlbumAccess(albumId);
          toast.success("Album unlocked");
          router.replace(routes.storefront.album(schoolSlug, albumId));
        },
        onError: (err) => {
          setError((err as unknown as ApiError).message ?? "Incorrect password. Please try again.");
        },
      },
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <CardTitle className="text-xl">This album is protected</CardTitle>
          {isLoading || !album ? (
            <Skeleton className="mx-auto h-4 w-48" />
          ) : (
            <CardDescription>
              Enter the password {school ? `provided by ${school.name}` : "shared with you"} to view “{album.title}”.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="album-password">Password</Label>
              <Input
                id="album-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter album password"
                autoFocus
                required
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <Button type="submit" className="w-full" disabled={verifyAccess.isPending || !password}>
              {verifyAccess.isPending ? "Checking…" : "Unlock album"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
