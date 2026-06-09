import { Meilisearch } from "meilisearch";

export const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "",
});

export const INDEXES = {
  students: "students",
  albums: "albums",
  photos: "photos",
} as const;

export async function indexStudent(student: {
  id: string; name: string; schoolId: string; classId?: string | null; number?: string | null;
}) {
  if (!process.env.MEILISEARCH_HOST) return;
  await meili.index(INDEXES.students).addDocuments([student]);
}

export async function indexAlbum(album: {
  id: string; title: string; schoolId: string; classId?: string | null; studentId?: string | null; slug: string;
}) {
  if (!process.env.MEILISEARCH_HOST) return;
  await meili.index(INDEXES.albums).addDocuments([album]);
}

export async function deleteStudentIndex(id: string) {
  if (!process.env.MEILISEARCH_HOST) return;
  await meili.index(INDEXES.students).deleteDocument(id);
}

export async function deleteAlbumIndex(id: string) {
  if (!process.env.MEILISEARCH_HOST) return;
  await meili.index(INDEXES.albums).deleteDocument(id);
}
