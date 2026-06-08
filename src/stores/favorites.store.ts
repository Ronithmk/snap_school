import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favoritesByAlbum: Record<string, string[]>;
  isFavorite: (albumId: string, photoId: string) => boolean;
  toggleFavorite: (albumId: string, photoId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoritesByAlbum: {},

      isFavorite: (albumId, photoId) => (get().favoritesByAlbum[albumId] ?? []).includes(photoId),

      toggleFavorite: (albumId, photoId) =>
        set((state) => {
          const current = state.favoritesByAlbum[albumId] ?? [];
          const next = current.includes(photoId)
            ? current.filter((id) => id !== photoId)
            : [...current, photoId];
          return { favoritesByAlbum: { ...state.favoritesByAlbum, [albumId]: next } };
        }),
    }),
    { name: "snapschool.favorites" },
  ),
);
