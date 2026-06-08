import type { Album } from "@/types";
import { routes } from "@/config/routes";

const now = "2026-05-01T00:00:00.000Z";

function cover(seed: string) {
  return `https://picsum.photos/seed/${seed}/640/480`;
}

interface AlbumSeed {
  id: string;
  schoolId: string;
  schoolSlug: string;
  classId: string | null;
  title: string;
  slug: string;
  description: string;
  visibility: Album["visibility"];
  passwordProtected: boolean;
  photoCount: number;
  eventDate: string;
}

const ALBUM_SEEDS: AlbumSeed[] = [
  { id: "alb_riv_5a_class", schoolId: "sch_riverside", schoolSlug: "riverside-elementary", classId: "cls_riv_5a", title: "Grade 5A — Class Photos", slug: "grade-5a-class-photos", description: "Individual and group portraits for Grade 5A.", visibility: "public", passwordProtected: false, photoCount: 42, eventDate: "2026-03-12T00:00:00.000Z" },
  { id: "alb_riv_5a_trip", schoolId: "sch_riverside", schoolSlug: "riverside-elementary", classId: "cls_riv_5a", title: "Grade 5A — Field Trip", slug: "grade-5a-field-trip", description: "Science museum field trip highlights.", visibility: "unlisted", passwordProtected: false, photoCount: 30, eventDate: "2026-04-02T00:00:00.000Z" },
  { id: "alb_riv_5b_class", schoolId: "sch_riverside", schoolSlug: "riverside-elementary", classId: "cls_riv_5b", title: "Grade 5B — Class Photos", slug: "grade-5b-class-photos", description: "Individual and group portraits for Grade 5B.", visibility: "public", passwordProtected: false, photoCount: 38, eventDate: "2026-03-12T00:00:00.000Z" },
  { id: "alb_riv_sports_track", schoolId: "sch_riverside", schoolSlug: "riverside-elementary", classId: "cls_riv_sports", title: "Sports Day — Track Events", slug: "sports-day-track", description: "Running, relay, and field events.", visibility: "public", passwordProtected: true, photoCount: 56, eventDate: "2026-04-18T00:00:00.000Z" },
  { id: "alb_riv_sports_team", schoolId: "sch_riverside", schoolSlug: "riverside-elementary", classId: "cls_riv_sports", title: "Sports Day — Team Photos", slug: "sports-day-teams", description: "House team group shots and medal ceremony.", visibility: "public", passwordProtected: false, photoCount: 24, eventDate: "2026-04-18T00:00:00.000Z" },

  { id: "alb_oak_seniors_portraits", schoolId: "sch_oakwood", schoolSlug: "oakwood-high", classId: "cls_oak_seniors", title: "Senior Portraits 2026", slug: "senior-portraits-2026", description: "Cap-and-gown senior portrait sessions.", visibility: "public", passwordProtected: true, photoCount: 64, eventDate: "2026-02-20T00:00:00.000Z" },
  { id: "alb_oak_seniors_grad", schoolId: "sch_oakwood", schoolSlug: "oakwood-high", classId: "cls_oak_seniors", title: "Graduation Ceremony", slug: "graduation-ceremony", description: "Full ceremony coverage and candid shots.", visibility: "public", passwordProtected: false, photoCount: 80, eventDate: "2026-06-15T00:00:00.000Z" },
  { id: "alb_oak_drama_dress", schoolId: "sch_oakwood", schoolSlug: "oakwood-high", classId: "cls_oak_drama", title: "Drama — Dress Rehearsal", slug: "drama-dress-rehearsal", description: "Behind-the-scenes dress rehearsal gallery.", visibility: "unlisted", passwordProtected: false, photoCount: 20, eventDate: "2026-05-08T00:00:00.000Z" },
  { id: "alb_oak_drama_night", schoolId: "sch_oakwood", schoolSlug: "oakwood-high", classId: "cls_oak_drama", title: "Drama — Opening Night", slug: "drama-opening-night", description: "Opening night performance and curtain call.", visibility: "public", passwordProtected: true, photoCount: 46, eventDate: "2026-05-09T00:00:00.000Z" },

  { id: "alb_sun_2a_class", schoolId: "sch_sunrise", schoolSlug: "sunrise-academy", classId: "cls_sun_2a", title: "Class 2A Portraits", slug: "class-2a-portraits", description: "Individual portraits for Class 2A.", visibility: "public", passwordProtected: false, photoCount: 26, eventDate: "2026-01-22T00:00:00.000Z" },
  { id: "alb_sun_annual_day", schoolId: "sch_sunrise", schoolSlug: "sunrise-academy", classId: "cls_sun_annual", title: "Annual Day Celebrations", slug: "annual-day-2026", description: "Performances, awards, and family day highlights.", visibility: "public", passwordProtected: false, photoCount: 70, eventDate: "2026-02-14T00:00:00.000Z" },
];

export const MOCK_ALBUMS: Album[] = ALBUM_SEEDS.map((seed) => ({
  id: seed.id,
  schoolId: seed.schoolId,
  classId: seed.classId,
  title: seed.title,
  slug: seed.slug,
  description: seed.description,
  coverImageUrl: cover(seed.id),
  visibility: seed.visibility,
  passwordProtected: seed.passwordProtected,
  shareUrl: routes.storefront.album(seed.schoolSlug, seed.id),
  pricing: { priceListId: null, currencyCode: "" },
  photoCount: seed.photoCount,
  eventDate: seed.eventDate,
  createdAt: now,
  updatedAt: now,
}));
