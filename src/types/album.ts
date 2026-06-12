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
  /** Price list assigned to this class — all albums in this class inherit it. */
  priceListId?: ID | null;
  /** The "Photo intake" staging album for this class, if one has been set up. */
  stagingAlbumId?: ID | null;
  createdAt: ISODateString;
}

export interface CreateClassInput {
  name: string;
  slug: string;
  grouping?: string;
  studentCount?: number;
  priceListId?: ID | null;
}

export type UpdateClassInput = Partial<CreateClassInput>;

export type AlbumVisibility = "public" | "unlisted" | "private";

export interface AlbumPricing {
  /** References a PriceList by id; null = inherit school default pricing. */
  priceListId: ID | null;
  currencyCode: string;
}

/**
 * Face-recognition validation status for an individual photo.
 *
 * - pending   : uploaded but not yet processed by AI
 * - matched   : AI confirmed the face belongs to this album's student — SAFE to show
 * - flagged   : AI detected a face that does NOT match the album's student — BLOCKED from storefront
 * - skipped   : album has no studentId (event/group album) — validation is not applicable
 */
export type FaceValidationStatus = "pending" | "matched" | "flagged" | "skipped";

export interface Album {
  id: ID;
  schoolId: ID;
  classId: ID | null;
  /**
   * The single student this album belongs to.
   * NULL for event / group albums where 1-kid enforcement does not apply.
   * When set, EVERY photo in this album must belong to this student only.
   */
  studentId: ID | null;
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
  /** How many photos in this album are currently flagged as face mismatches. */
  flaggedCount: number;
  /** True for the auto-created "Photo intake" album that holds unsorted uploads for a class. */
  isStaging: boolean;
  eventDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateAlbumInput {
  title: string;
  slug: string;
  classId: ID | null;
  /** Bind this album to exactly one student. Leave null for event/group albums. */
  studentId?: ID | null;
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
  /** Result of the AI face-recognition check against the album's student reference photo. */
  faceValidationStatus: FaceValidationStatus;
  /** Photo group/category (e.g. "pose1", "group") — used to filter relevant products in the storefront. */
  category?: string | null;
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

/** One group of photos to split out of a staging album into its own album. */
export interface SplitAlbumGroupInput {
  title: string;
  photoIds: ID[];
  coverPhotoId?: ID;
  studentId?: ID | null;
}

export interface SplitAlbumInput {
  albumId: ID;
  groups: SplitAlbumGroupInput[];
}

export interface SplitAlbumResult {
  albums: Album[];
}

/** Summary of a flagged photo, used on the admin review page. */
export interface FlaggedPhotoReport {
  photo: Photo;
  album: Album;
  /** Reason string returned by the AI engine. */
  reason: string;
}
