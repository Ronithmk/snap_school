import type { FaceValidationStatus, Photo } from "@/types";
import { MOCK_ALBUMS } from "./albums";

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

const PHOTO_CACHE = new Map<string, Photo[]>();

export function getAlbumPhotos(albumId: string): Photo[] {
  const cached = PHOTO_CACHE.get(albumId);
  if (cached) return cached;
  // MOCK_ALBUMS is now empty by default — new albums start with no photos
  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  const count = album?.photoCount ?? 0;
  const photos: Photo[] = Array.from({ length: count }, (_, i) => ({
    id: `pho_${albumId}-${i}`,
    albumId,
    previewUrl: "",
    hdUrl: "",
    thumbnailUrl: "",
    width: 0,
    height: 0,
    fileName: `IMG_${1000 + i}.jpg`,
    tags: [],
    isFavorite: false,
    faceValidationStatus: "pending" as FaceValidationStatus,
    createdAt: new Date().toISOString(),
  }));
  PHOTO_CACHE.set(albumId, photos);
  return photos;
}

function runMockFaceValidation(albumId: string, fileName: string): FaceValidationStatus {
  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  if (!album?.studentId) return "skipped";
  const r = seededRandom(`fv-${albumId}-${fileName}`);
  return r < 0.15 ? "flagged" : "matched";
}

export function addPhotosToAlbum(
  albumId: string,
  files: File[],
): { photos: Photo[]; flaggedCount: number } {
  const existing = getAlbumPhotos(albumId);
  const created: Photo[] = files.map((file) => {
    const objectUrl = typeof URL !== "undefined" ? URL.createObjectURL(file) : "";
    return {
      id: `pho_${albumId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      albumId,
      previewUrl: objectUrl,
      hdUrl: objectUrl,
      thumbnailUrl: objectUrl,
      width: 0,
      height: 0,
      fileName: file.name,
      tags: [],
      isFavorite: false,
      faceValidationStatus: runMockFaceValidation(albumId, file.name),
      createdAt: new Date().toISOString(),
    };
  });

  PHOTO_CACHE.set(albumId, [...created, ...existing]);
  const flaggedCount = created.filter((p) => p.faceValidationStatus === "flagged").length;
  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  if (album) {
    album.photoCount += created.length;
    album.flaggedCount += flaggedCount;
    album.updatedAt = new Date().toISOString();
  }
  return { photos: created, flaggedCount };
}

export function resolveFlaggedPhoto(photoId: string, action: "remove" | "approve"): { ok: boolean } {
  for (const [albumId, photos] of PHOTO_CACHE.entries()) {
    const idx = photos.findIndex((p) => p.id === photoId);
    if (idx === -1) continue;
    const album = MOCK_ALBUMS.find((a) => a.id === albumId);
    if (action === "remove") {
      PHOTO_CACHE.set(albumId, photos.filter((p) => p.id !== photoId));
      if (album) {
        album.photoCount = Math.max(0, album.photoCount - 1);
        album.flaggedCount = Math.max(0, album.flaggedCount - 1);
        album.updatedAt = new Date().toISOString();
      }
    } else {
      photos[idx] = { ...photos[idx], faceValidationStatus: "matched" };
      if (album) {
        album.flaggedCount = Math.max(0, album.flaggedCount - 1);
        album.updatedAt = new Date().toISOString();
      }
    }
    return { ok: true };
  }
  return { ok: false };
}

export function getSchoolFlaggedPhotos(schoolId: string): Array<{ photo: Photo; albumId: string }> {
  const schoolAlbumIds = new Set(
    MOCK_ALBUMS.filter((a) => a.schoolId === schoolId && a.flaggedCount > 0).map((a) => a.id),
  );
  const results: Array<{ photo: Photo; albumId: string }> = [];
  for (const albumId of schoolAlbumIds) {
    for (const photo of getAlbumPhotos(albumId)) {
      if (photo.faceValidationStatus === "flagged") results.push({ photo, albumId });
    }
  }
  return results;
}
