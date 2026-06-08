import type { ID, ISODateString } from "./common";

export interface SchoolClass {
  id: ID;
  schoolId: ID;
  name: string;
  slug: string;
  /** e.g. "Grade 5", "Year 2026" — used for student grouping context. */
  grouping?: string;
  albumCount: number;
  studentCount?: number;
  createdAt: ISODateString;
}

export interface CreateClassInput {
  name: string;
  slug: string;
  grouping?: string;
  studentCount?: number;
}

export type UpdateClassInput = Partial<CreateClassInput>;

export type AlbumVisibility = "public" | "unlisted" | "private";

export interface AlbumPricing {
  /** References a PriceList by id; null = inherit school default pricing. */
  priceListId: ID | null;
  currencyCode: string;
}

export interface Album {
  id: ID;
  schoolId: ID;
  classId: ID | null;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl: string;
  visibility: AlbumVisibility;
  passwordProtected: boolean;
  /** Public shareable path, e.g. "/riverside-elementary/album/spring-recital-2026" */
  shareUrl: string;
  pricing: AlbumPricing;
  photoCount: number;
  eventDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateAlbumInput {
  title: string;
  slug: string;
  classId: ID | null;
  description?: string;
  visibility: AlbumVisibility;
  password?: string;
  priceListId?: ID | null;
  eventDate?: ISODateString;
}

export type UpdateAlbumInput = Partial<CreateAlbumInput>;

export interface PhotoTag {
  id: ID;
  label: string;
}

export interface Photo {
  id: ID;
  albumId: ID;
  /** Low-res, watermarked preview shown before purchase. */
  previewUrl: string;
  /** High-resolution asset, only resolvable after purchase (mock returns a locked placeholder). */
  hdUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileName: string;
  tags: PhotoTag[];
  isFavorite?: boolean;
  createdAt: ISODateString;
}

export interface AlbumAccessRequest {
  albumId: ID;
  password: string;
}

export interface UploadPhotosInput {
  albumId: ID;
  files: File[];
}
