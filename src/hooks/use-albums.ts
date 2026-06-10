"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { albumsService, classesService } from "@/services";
import { ALBUM_PAGE_SIZE, PHOTO_GRID_PAGE_SIZE } from "@/config/constants";
import type {
  AlbumAccessRequest,
  CreateAlbumInput,
  CreateClassInput,
  UpdateAlbumInput,
  UpdateClassInput,
  UploadPhotosInput,
} from "@/types";

export function useSchoolClasses(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => classesService.listBySchool(schoolId!),
    enabled: !!schoolId,
  });
}

export function useClass(classId: string | undefined) {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: () => classesService.getById(classId!),
    enabled: !!classId,
  });
}

export function useClassBySlug(schoolId: string | undefined, slug: string) {
  return useQuery({
    queryKey: ["class", "slug", schoolId, slug],
    queryFn: () => classesService.getBySlug(schoolId!, slug),
    enabled: !!schoolId,
  });
}

export function useCreateClass(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => classesService.create(schoolId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes", schoolId] }),
  });
}

export function useUpdateClass(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClassInput }) => classesService.update(id, input),
    onSuccess: (schoolClass) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["class", schoolClass.id] });
    },
  });
}

export function useDeleteClass(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes", schoolId] }),
  });
}

export function useSchoolAlbums(schoolId: string | undefined, opts: { classId?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ["albums", schoolId, opts],
    queryFn: () => albumsService.listBySchool(schoolId!, { ...opts, pageSize: ALBUM_PAGE_SIZE }),
    enabled: !!schoolId,
  });
}

export function useAlbum(albumId: string | undefined) {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => albumsService.getById(albumId!),
    enabled: !!albumId,
  });
}

export function useVerifyAlbumAccess() {
  return useMutation({
    mutationFn: (request: AlbumAccessRequest) => albumsService.verifyAccess(request),
  });
}

export function useCreateAlbum(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAlbumInput) => albumsService.create(schoolId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
    },
  });
}

export function useUpdateAlbum(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAlbumInput }) => albumsService.update(id, input),
    onSuccess: (album) => {
      queryClient.invalidateQueries({ queryKey: ["albums", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["album", album.id] });
    },
  });
}

export function useDeleteAlbum(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => albumsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
    },
  });
}

/** A single photo by id — used by the per-photo storefront page. */
export function usePhoto(photoId: string | undefined) {
  return useQuery({
    queryKey: ["photo", photoId],
    queryFn: () => albumsService.getPhoto(photoId!),
    enabled: !!photoId,
  });
}

/** Powers infinite-scroll photo grids inside an album gallery. */
export function useAlbumPhotos(albumId: string | undefined, search?: string) {
  return useInfiniteQuery({
    queryKey: ["album-photos", albumId, search],
    queryFn: ({ pageParam }) =>
      albumsService.listPhotos(albumId!, { page: pageParam, pageSize: PHOTO_GRID_PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined),
    enabled: !!albumId,
  });
}

export function useUploadPhotos(albumId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadPhotosInput) => albumsService.uploadPhotos(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album-photos", albumId] });
      queryClient.invalidateQueries({ queryKey: ["album", albumId] });
      queryClient.invalidateQueries({ queryKey: ["flagged-photos"] });
    },
  });
}

export function useFlaggedPhotos(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["flagged-photos", schoolId],
    queryFn: () => albumsService.getFlaggedPhotos(schoolId!),
    enabled: !!schoolId,
  });
}

export function useUpdatePhotoCategory(albumId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, category }: { photoId: string; category: string | null }) =>
      albumsService.updatePhotoCategory(photoId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album-photos", albumId] });
    },
  });
}

export function useResolveFlag(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, action }: { photoId: string; action: "remove" | "approve" }) =>
      albumsService.resolveFlag(photoId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-photos", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["album-photos"] });
      queryClient.invalidateQueries({ queryKey: ["albums", schoolId] });
    },
  });
}
