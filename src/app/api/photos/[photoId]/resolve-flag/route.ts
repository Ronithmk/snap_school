import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { photoId } = await params;
  const body = await req.json();
  const { action } = body;

  if (action !== "remove" && action !== "approve") {
    return err("action must be 'remove' or 'approve'.", 400);
  }

  const photo = await db.photo.findUnique({ where: { id: photoId } });
  if (!photo) return err("Photo not found.", 404);

  if (action === "remove") {
    await db.photo.delete({ where: { id: photoId } });
    await db.album.update({
      where: { id: photo.albumId },
      data: {
        photoCount: { decrement: 1 },
        flaggedCount: { decrement: 1 },
      },
    });
    return ok({ success: true });
  }

  // action === "approve"
  await db.photo.update({
    where: { id: photoId },
    data: { faceValidationStatus: "matched" },
  });
  await db.album.update({
    where: { id: photo.albumId },
    data: { flaggedCount: { decrement: 1 } },
  });

  return ok({ success: true });
}
