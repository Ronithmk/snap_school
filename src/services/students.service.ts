import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import { MOCK_STUDENTS } from "@/services/mock/seed-data";
import type { Album, CreateStudentInput, Photo, PriceList, Student, StudentLookupInput } from "@/types";

const ENDPOINTS = {
  list: "/students",
  byId: (id: string) => `/students/${id}`,
  album: (id: string) => `/students/${id}/album`,
  ensureForAlbum: (albumId: string) => `/albums/${albumId}/student`,
  lookup: "/students/lookup",
} as const;

export interface StudentAlbumResponse {
  student: Student;
  album: Album | null;
  photos: Photo[];
  priceList: PriceList | null;
}

let mockStudents = [...MOCK_STUDENTS];

/** Auto-generate a padded number for new students */
function nextNumber(schoolId: string): string {
  const existing = mockStudents.filter((s) => s.schoolId === schoolId);
  const max = existing.reduce((n, s) => Math.max(n, parseInt(s.number, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
}

/** Generate a random 8-char alphanumeric access code */
function genCode(): string {
  return Math.random().toString(36).toUpperCase().slice(2, 10);
}

/** Generate a 7-digit username */
function genUsername(): string {
  return String(Math.floor(1000000 + Math.random() * 8999999));
}

export const studentsService = {
  /** All students for a school, optionally filtered by classId. */
  async listBySchool(schoolId: string, classId?: string): Promise<Student[]> {
    if (env.useMockApi) {
      let result = mockStudents.filter((s) => s.schoolId === schoolId);
      if (classId) result = result.filter((s) => s.classId === classId);
      // Sort by class then number
      return mockDelay(result.sort((a, b) => a.classId.localeCompare(b.classId) || a.number.localeCompare(b.number)));
    }
    const { data } = await apiClient.get<Student[]>(ENDPOINTS.list, { params: { schoolId, classId } });
    return data;
  },

  async getById(id: string): Promise<Student | null> {
    if (env.useMockApi) return mockDelay(mockStudents.find((s) => s.id === id) ?? null);
    const { data } = await apiClient.get<Student>(ENDPOINTS.byId(id));
    return data;
  },

  async create(schoolId: string, input: CreateStudentInput): Promise<Student> {
    if (env.useMockApi) {
      const student: Student = {
        id: `stu_${Date.now()}`,
        schoolId,
        classId: input.classId,
        number: input.number ?? nextNumber(schoolId),
        name: input.name,
        username: genUsername(),
        accessCode: genCode(),
        coverPhotoUrl: input.coverPhotoUrl,
        createdAt: new Date().toISOString(),
      };
      mockStudents = [...mockStudents, student];
      return mockDelay(student);
    }
    const { data } = await apiClient.post<Student>(ENDPOINTS.list, { ...input, schoolId });
    return data;
  },

  async update(id: string, input: Partial<Pick<Student, "name" | "number" | "coverPhotoUrl" | "classId">>): Promise<Student> {
    if (env.useMockApi) {
      const existing = mockStudents.find((s) => s.id === id);
      if (!existing) throw new Error("Student not found");
      const updated = { ...existing, ...input };
      mockStudents = mockStudents.map((s) => (s.id === id ? updated : s));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<Student>(ENDPOINTS.byId(id), input);
    return data;
  },

  async remove(id: string): Promise<void> {
    if (env.useMockApi) {
      mockStudents = mockStudents.filter((s) => s.id !== id);
      return mockDelay(undefined);
    }
    await apiClient.delete(ENDPOINTS.byId(id));
  },

  /** Public: a student's album, photos, and resolved price list — powers the parent QR landing page. */
  async getAlbum(id: string): Promise<StudentAlbumResponse | null> {
    if (env.useMockApi) {
      const student = mockStudents.find((s) => s.id === id);
      if (!student) return mockDelay(null);
      return mockDelay({ student, album: null, photos: [], priceList: null });
    }
    const { data } = await apiClient.get<StudentAlbumResponse>(ENDPOINTS.album(id));
    return data;
  },

  /** Get-or-create the "kid" (Student) record for an album, treating each album as one student. */
  async ensureForAlbum(albumId: string): Promise<Student> {
    if (env.useMockApi) {
      const existing = mockStudents.find((s) => s.id === `stu_album_${albumId}`);
      if (existing) return mockDelay(existing);
      const student: Student = {
        id: `stu_album_${albumId}`,
        schoolId: "",
        classId: "",
        number: "",
        name: "Album",
        username: genUsername(),
        accessCode: genCode(),
        createdAt: new Date().toISOString(),
      };
      mockStudents = [...mockStudents, student];
      return mockDelay(student);
    }
    const { data } = await apiClient.post<Student>(ENDPOINTS.ensureForAlbum(albumId));
    return data;
  },

  /** Public: resolves a student's username + access code to a student id, scoped to a school — powers the storefront gallery gate. */
  async lookup(input: StudentLookupInput): Promise<{ studentId: string }> {
    if (env.useMockApi) {
      const student = mockStudents.find(
        (s) => s.username === input.username && s.accessCode === input.accessCode,
      );
      if (!student) throw new Error("We couldn't find a student with that username and access code.");
      return mockDelay({ studentId: student.id });
    }
    const { data } = await apiClient.post<{ studentId: string }>(ENDPOINTS.lookup, input);
    return data;
  },

  /** Regenerate access credentials for a student. */
  async regenerateCredentials(id: string): Promise<Student> {
    if (env.useMockApi) {
      const existing = mockStudents.find((s) => s.id === id);
      if (!existing) throw new Error("Student not found");
      const updated = { ...existing, username: genUsername(), accessCode: genCode() };
      mockStudents = mockStudents.map((s) => (s.id === id ? updated : s));
      return mockDelay(updated);
    }
    const { data } = await apiClient.post<Student>(`${ENDPOINTS.byId(id)}/regenerate-credentials`);
    return data;
  },
};
