import type { Photo, PhotoTag } from "@/types";
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

/** Deterministic pseudo-random in [0, 1) so mock data is stable across renders/SSR. */
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

function buildPhoto(albumId: string, index: number): Photo {
  const seed = photoSeed(albumId, index);
  const rand = seededRandom(seed);
  const width = 1600;
  const height = 1067;
  const tagCount = 1 + Math.floor(rand * 2);
  const tags = Array.from({ length: tagCount }, (_, i) => TAG_POOL[Math.floor((rand * 10 + i * 3) % TAG_POOL.length)]);

  return {
    id: `pho_${seed}`,
    albumId,
    previewUrl: `https://picsum.photos/seed/${seed}/640/427`,
    hdUrl: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    thumbnailUrl: `https://picsum.photos/seed/${seed}/320/213`,
    width,
    height,
    fileName: `IMG_${1000 + index}.jpg`,
    tags,
    isFavorite: false,
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

/** Mock-only: turns freshly "uploaded" files into Photo records and prepends them to the album's gallery. */
export function addPhotosToAlbum(albumId: string, files: { name: string }[]): Photo[] {
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
      createdAt: new Date().toISOString(),
    };
  });
  PHOTO_CACHE.set(albumId, [...created, ...existing]);

  const album = MOCK_ALBUMS.find((a) => a.id === albumId);
  if (album) {
    album.photoCount += created.length;
    album.updatedAt = new Date().toISOString();
  }
  return created;
}

export function getPhotoById(photoId: string): Photo | undefined {
  for (const album of MOCK_ALBUMS) {
    const found = getAlbumPhotos(album.id).find((p) => p.id === photoId);
    if (found) return found;
  }
  return undefined;
}
