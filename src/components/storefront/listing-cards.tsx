import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import type { Album, School, SchoolClass } from "@/types";

interface ClassCardProps {
  school: School;
  schoolClass: SchoolClass;
}

export function ClassCard({ school, schoolClass }: ClassCardProps) {
  return (
    <Link href={routes.storefront.class(school.slug, schoolClass.slug)}>
      <Card className="group relative h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold tracking-tight transition-colors group-hover:text-primary">{schoolClass.name}</p>
            <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground/40 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
          </div>
          {schoolClass.grouping ? <p className="text-sm text-muted-foreground">{schoolClass.grouping}</p> : null}
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {schoolClass.albumCount} {schoolClass.albumCount === 1 ? "album" : "albums"}
            </span>
            {schoolClass.studentCount ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                <Users className="h-3.5 w-3.5" />
                {schoolClass.studentCount} students
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface AlbumCardProps {
  school: School;
  album: Album;
}

export function AlbumCard({ school, album }: AlbumCardProps) {
  return (
    <Link href={routes.storefront.album(school.slug, album.id)}>
      <Card className="group h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {album.coverImageUrl ? (
            <Image
              src={album.coverImageUrl}
              alt={album.title}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity group-hover:opacity-100" />
          {album.passwordProtected ? (
            <Badge variant="neutral" className="absolute right-2.5 top-2.5 gap-1 bg-background/80 backdrop-blur">
              <Lock className="h-3 w-3" />
              Protected
            </Badge>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-3">
            <p className="truncate text-sm font-semibold tracking-tight text-white drop-shadow">{album.title}</p>
            <p className="flex items-center gap-1 text-xs text-white/80">
              <ImageIcon className="h-3 w-3" />
              {album.photoCount} photos
              {album.eventDate ? ` · ${new Date(album.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View album
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Card>
    </Link>
  );
}
