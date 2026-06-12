import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject, paginate, searchFilter } from "@/services/mock/transport";
import { MOCK_ALBUMS } from "@/services/mock/albums";
import { MOCK_SCHOOLS } from "@/services/mock/seed-data";
import { addPhotosToAlbum, getAlbumPhotos, getSchoolFlaggedPhotos, resolveFlaggedPhoto } from "@/services/mock/photos";
import { routes } from "@/config/routes";
import type {
  Album,
  AlbumAccessRequest,
  CreateAlbumInput,
  FlaggedPhotoReport,
  PaginatedResponse,
  Photo,
  QueryParams,
  SplitAlbumGroupInput,
  SplitAlbumResult,
  UpdateAlbumInput,
  UploadPhotosInput,
} from "@/types";

const ENDPOINTS = {
  bySchool: (schoolId: string) => `/schools/${schoolId}/albums`,
  byId: (id: string) => `/albums/${id}`,
  verifyAccess: (id: string) => `/albums/${id}/verify-access`,
  photos: (id: string) => `/albums/${id}/photos`,
  split: (id: string) => `/albums/${id}/split`,
  stagingAlbum: (classId: string) => `/classes/${classId}/staging-album`,
} as const;

/** Mock-only: passwords for protected albums (a real backend never exposes this to the client). */
const MOCK_ALBUM_PASSWORDS: Record<string, string> = {};

export const albumsService = {
  async listBySchool(schoolId: string, params: QueryParams & { classId?: string } = {}): Promise<PaginatedResponse<Album>> {
    if (env.useMockApi) {
      let items = MOCK_ALBUMS.filter((a) => a.schoolId === schoolId);
      if (params.classId) items = items.filter((a) => a.classId === params.classId);
      items = searchFilter(items, params.search, ["title", "slug"]);
      return mockDelay(paginate(items, params));
    }
    const { data } = await apiClient.get<PaginatedResponse<Album>>(ENDPOINTS.bySchool(schoolId), { params });
    return data;
  },

  async getById(albumId: string): Promise<Album | null> {
    if (env.useMockApi) {
      return mockDelay(MOCK_ALBUMS.find((a) => a.id === albumId) ?? null);
    }
    const { data } = await apiClient.get<Album>(ENDPOINTS.byId(albumId));
    return data;
  },

  /** Returns true once a valid password unlocks the album for this browser session. */
  async verifyAccess({ albumId, password }: AlbumAccessRequest): Promise<{ granted: boolean }> {
    if (env.useMockApi) {
      const expected = MOCK_ALBUM_PASSWORDS[albumId];
      if (!expected) return mockDelay({ granted: true });
      if (password !== expected) return mockReject("Incorrect password.", 401, "invalid_password");
      return mockDelay({ granted: true });
    }
    const { data } = await apiClient.post<{ granted: boolean }>(ENDPOINTS.verifyAccess(albumId), { password });
    return data;
  },

  async listPhotos(albumId: string, params: QueryParams = {}): Promise<PaginatedResponse<Photo>> {
    if (env.useMockApi) {
      const all = getAlbumPhotos(albumId);
      const filtered = searchFilter(all, params.search, ["fileName"]);
      return mockDelay(paginate(filtered, { pageSize: 24, ...params }));
    }
    const { data } = await apiClient.get<PaginatedResponse<Photo>>(ENDPOINTS.photos(albumId), { params });
    return data;
  },

  /** Public: a single photo by id (used by the per-photo storefront page). */
  async getPhoto(photoId: string): Promise<Photo | null> {
    if (env.useMockApi) return mockDelay(null);
    const { data } = await apiClient.get<Photo>(`/photos/${photoId}`);
    return data;
  },

  async create(schoolId: string, input: CreateAlbumInput): Promise<Album> {
    if (env.useMockApi) {
      if (MOCK_ALBUMS.some((a) => a.schoolId === schoolId && a.slug === input.slug)) {
        return mockReject("An album with this slug already exists for this school.", 409, "slug_taken");
      }
      const school = MOCK_SCHOOLS.find((s) => s.id === schoolId);
      const id = `alb_${Date.now()}`;
      const now = new Date().toISOString();
      const { password, priceListId, studentId: inputStudentId, ...rest } = input;
      const album: Album = {
        id,
        schoolId,
        coverImageUrl: "",
        shareUrl: school ? routes.storefront.album(school.slug, id) : `/albums/${id}`,
        pricing: { priceListId: priceListId ?? null, currencyCode: school?.settings.currencyCode ?? "" },
        photoCount: 0,
        flaggedCount: 0,
        isStaging: false,
        studentId: inputStudentId ?? null,
        passwordProtected: !!password,
        createdAt: now,
        updatedAt: now,
        ...rest,
      };
      if (password) MOCK_ALBUM_PASSWORDS[id] = password;
      MOCK_ALBUMS.unshift(album);
      return mockDelay(album);
    }
    const { data } = await apiClient.post<Album>(ENDPOINTS.bySchool(schoolId), input);
    return data;
  },

  async update(albumId: string, input: UpdateAlbumInput): Promise<Album> {
    if (env.useMockApi) {
      const existing = MOCK_ALBUMS.find((a) => a.id === albumId);
      if (!existing) return mockReject("Album not found.", 404, "not_found");
      const { password, priceListId, ...rest } = input;
      Object.assign(existing, rest, {
        passwordProtected: password !== undefined ? !!password : existing.passwordProtected,
        pricing: priceListId !== undefined ? { ...existing.pricing, priceListId } : existing.pricing,
        updatedAt: new Date().toISOString(),
      });
      if (password) MOCK_ALBUM_PASSWORDS[albumId] = password;
      else if (password === "") delete MOCK_ALBUM_PASSWORDS[albumId];
      return mockDelay(existing);
    }
    const { data } = await apiClient.patch<Album>(ENDPOINTS.byId(albumId), input);
    return data;
  },

  async remove(albumId: string): Promise<void> {
    if (env.useMockApi) {
      const index = MOCK_ALBUMS.findIndex((a) => a.id === albumId);
      if (index !== -1) MOCK_ALBUMS.splice(index, 1);
      delete MOCK_ALBUM_PASSWORDS[albumId];
      return mockDelay(undefined);
    }
    await apiClient.delete(ENDPOINTS.byId(albumId));
  },

  async uploadPhotos({ albumId, files }: UploadPhotosInput): Promise<{ photos: Photo[]; flaggedCount: number }> {
    if (env.useMockApi) {
      const result = addPhotosToAlbum(albumId, files);
      return mockDelay(result, 700);
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await apiClient.post<{ photos: Photo[]; flaggedCount: number }>(ENDPOINTS.photos(albumId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getFlaggedPhotos(schoolId: string): Promise<FlaggedPhotoReport[]> {
    if (env.useMockApi) {
      const items = getSchoolFlaggedPhotos(schoolId);
      const reports: FlaggedPhotoReport[] = items.map(({ photo, albumId }) => {
        const album = MOCK_ALBUMS.find((a) => a.id === albumId)!;
        return { photo, album, reason: "Face does not match album student reference." };
      });
      return mockDelay(reports);
    }
    const { data } = await apiClient.get<FlaggedPhotoReport[]>(`/schools/${schoolId}/flagged-photos`);
    return data;
  },

  async resolveFlag(photoId: string, action: "remove" | "approve"): Promise<void> {
    if (env.useMockApi) {
      resolveFlaggedPhoto(photoId, action);
      return mockDelay(undefined, 300);
    }
    await apiClient.post(`/photos/${photoId}/resolve-flag`, { action });
  },

  /** Sets the product category for a photo, used to filter relevant items on the parent storefront. */
  async updatePhotoCategory(photoId: string, category: string | null): Promise<Photo> {
    if (env.useMockApi) {
      return mockDelay({ id: photoId, category } as unknown as Photo, 200);
    }
    const { data } = await apiClient.patch<Photo>(`/photos/${photoId}`, { category });
    return data;
  },

  /** Splits a staging album's photos into new per-group albums. */
  async splitAlbum(albumId: string, groups: SplitAlbumGroupInput[]): Promise<SplitAlbumResult> {
    if (env.useMockApi) {
      return mockDelay({ albums: [] }, 300);
    }
    const { data } = await apiClient.post<SplitAlbumResult>(ENDPOINTS.split(albumId), { groups });
    return data;
  },

  /** Get-or-create the "Photo intake" staging album for a class. */
  async ensureStagingAlbum(classId: string): Promise<{ id: string }> {
    if (env.useMockApi) {
      return mockDelay({ id: `alb_staging_${classId}` }, 200);
    }
    const { data } = await apiClient.post<{ id: string }>(ENDPOINTS.stagingAlbum(classId));
    return data;
  },
};
