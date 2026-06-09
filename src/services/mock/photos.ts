import type { FaceValidationStatus, Photo, PhotoTag } from "@/types";
import { MOCK_ALBUMS } from "./albums";

const TAG_POOL: PhotoTag[] = [
  { id: "tag_portrait", label: "Portrait" },
  { id: "tag_group", label: "Group" },
  { id: "tag_candid", label: "Candid" },
  { id: "tag_action", label: "Action" },
  { id: "tag_award", label: "Award" },
  { id: "tag_indoor", label: "Indoor" },
  { id: "tag_outdoor", label: "Outdoor" },
];

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function photoSeed(albumId: string, index: number) {
  return `${albumId}-${index}`;
}

function seedFaceStatus(albumId: string, index: number): FaceValidationStatus {
  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  if (!album?.studentId) return "skipped";
  if (album.flaggedCount > 0 && index < album.flaggedCount) return "flagged";
  return "matched";
}

function buildPhoto(albumId: string, index: number): Photo {
  const seed = photoSeed(albumId, index);
  const rand = seededRandom(seed);
  const tagCount = 1 + Math.floor(rand * 2);
  const tags = Array.from({ length: tagCount }, (_, i) => TAG_POOL[Math.floor((rand * 10 + i * 3) % TAG_POOL.length)]);
  return {
    id: `pho_${seed}`,
    albumId,
    previewUrl: `https://picsum.photos/seed/${seed}/640/427`,
    hdUrl: `https://picsum.photos/seed/${seed}/1600/1067`,
    thumbnailUrl: `https://picsum.photos/seed/${seed}/320/213`,
    width: 1600,
    height: 1067,
    fileName: `IMG_${1000 + index}.jpg`,
    tags,
    isFavorite: false,
    faceValidationStatus: seedFaceStatus(albumId, index),
    createdAt: "2026-05-01T00:00:00.000Z",
  };
}

const PHOTO_CACHE = new Map<string, Photo[]>();

export function getAlbumPhotos(albumId: string): Photo[] {
  const cached = PHOTO_CACHE.get(albumId);
  if (cached) return cached;
  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  const count = album?.photoCount ?? 0;
  const photos = Array.from({ length: count }, (_, i) => buildPhoto(albumId, i));
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
  files: { name: string }[],
): { photos: Photo[]; flaggedCount: number } {
  const existing = getAlbumPhotos(albumId);
  const created: Photo[] = files.map((file, i) => {
    const seed = `${albumId}-upload-${Date.now()}-${i}`;
    return {
      id: `pho_${seed}`,
      albumId,
      previewUrl: `https://picsum.photos/seed/${seed}/640/427`,
      hdUrl: `https://picsum.photos/seed/${seed}/1600/1067`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/320/213`,
      width: 1600,
      height: 1067,
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
      if (album) { album.photoCount = Math.max(0, album.photoCount - 1); album.flaggedCount = Math.max(0, album.flaggedCount - 1); album.updatedAt = new Date().toISOString(); }
    } else {
      photos[idx] = { ...photos[idx], faceValidationStatus: "matched" };
      if (album) { album.flaggedCount = Math.max(0, album.flaggedCount - 1); album.updatedAt = new Date().toISOString(); }
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

export function getPhotoById(photoId: string): Photo | undefined {
  for (const album of MOCK_ALBUMS) {
    const found = getAlbumPhotos(album.id).find((p) => p.id === photoId);
    if (found) return found;
  }
  return undefined;
}
