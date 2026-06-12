import { db } from "@/lib/db";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Returns a slug for the school that doesn't collide with an existing album. */
export async function uniqueAlbumSlug(schoolId: string, base: string) {
  const baseSlug = slugify(base) || "album";
  let slug = baseSlug;
  let suffix = 2;
  while (await db.album.findFirst({ where: { schoolId, slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/** Creates the "Photo intake" staging album for a class, if one doesn't already exist. */
export async function ensureStagingAlbum(classId: string) {
  const existing = await db.album.findFirst({ where: { classId, isStaging: true } });
  if (existing) return existing;

  const schoolClass = await db.schoolClass.findUnique({ where: { id: classId } });
  if (!schoolClass) return null;

  const school = await db.school.findUnique({ where: { id: schoolClass.schoolId } });
  if (!school) return null;

  const slug = await uniqueAlbumSlug(schoolClass.schoolId, `${schoolClass.slug}-intake`);

  const album = await db.album.create({
    data: {
      schoolId: schoolClass.schoolId,
      classId,
      title: "Photo intake",
      slug,
      visibility: "private",
      isStaging: true,
      shareUrl: "",
      photoCount: 0,
      flaggedCount: 0,
    },
  });

  return db.album.update({
    where: { id: album.id },
    data: { shareUrl: `/${school.slug}/album/${album.id}` },
  });
}
