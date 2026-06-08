import Link from "next/link";
import { ImageIcon, Lock, Users } from "lucide-react";
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
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="space-y-2 p-5">
          <p className="font-semibold tracking-tight transition-colors group-hover:text-primary">{schoolClass.name}</p>
          {schoolClass.grouping ? <p className="text-sm text-muted-foreground">{schoolClass.grouping}</p> : null}
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              {schoolClass.albumCount} {schoolClass.albumCount === 1 ? "album" : "albums"}
            </span>
            {schoolClass.studentCount ? (
              <span className="inline-flex items-center gap-1.5">
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
      <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.coverImageUrl}
            alt={album.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {album.passwordProtected ? (
            <Badge variant="neutral" className="absolute right-2.5 top-2.5 gap-1 bg-background/80 backdrop-blur">
              <Lock className="h-3 w-3" />
              Protected
            </Badge>
          ) : null}
        </div>
        <div className="space-y-1 p-4">
          <p className="truncate font-medium tracking-tight transition-colors group-hover:text-primary">{album.title}</p>
          <p className="text-xs text-muted-foreground">
            {album.photoCount} photos
            {album.eventDate ? ` · ${new Date(album.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}
          </p>
        </div>
      </Card>
    </Link>
  );
}
