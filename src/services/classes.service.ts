import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject } from "@/services/mock/transport";
import { MOCK_CLASSES } from "@/services/mock/seed-data";
import type { CreateClassInput, SchoolClass, UpdateClassInput } from "@/types";

const ENDPOINTS = {
  bySchool: (schoolId: string) => `/schools/${schoolId}/classes`,
  byId: (id: string) => `/classes/${id}`,
} as const;

let mockClasses = [...MOCK_CLASSES];

export const classesService = {
  async listBySchool(schoolId: string): Promise<SchoolClass[]> {
    if (env.useMockApi) {
      return mockDelay(mockClasses.filter((c) => c.schoolId === schoolId));
    }
    const { data } = await apiClient.get<SchoolClass[]>(ENDPOINTS.bySchool(schoolId));
    return data;
  },

  async getById(classId: string): Promise<SchoolClass | null> {
    if (env.useMockApi) {
      return mockDelay(mockClasses.find((c) => c.id === classId) ?? null);
    }
    const { data } = await apiClient.get<SchoolClass>(ENDPOINTS.byId(classId));
    return data;
  },

  async getBySlug(schoolId: string, slug: string): Promise<SchoolClass | null> {
    if (env.useMockApi) {
      return mockDelay(mockClasses.find((c) => c.schoolId === schoolId && c.slug === slug) ?? null);
    }
    const { data } = await apiClient.get<SchoolClass>(`${ENDPOINTS.bySchool(schoolId)}/slug/${slug}`);
    return data;
  },

  async create(schoolId: string, input: CreateClassInput): Promise<SchoolClass> {
    if (env.useMockApi) {
      if (mockClasses.some((c) => c.schoolId === schoolId && c.slug === input.slug)) {
        return mockReject("A class with this slug already exists for this school.", 409, "slug_taken");
      }
      const schoolClass: SchoolClass = {
        id: `cls_${Date.now()}`,
        schoolId,
        albumCount: 0,
        createdAt: new Date().toISOString(),
        ...input,
      };
      mockClasses = [schoolClass, ...mockClasses];
      return mockDelay(schoolClass);
    }
    const { data } = await apiClient.post<SchoolClass>(ENDPOINTS.bySchool(schoolId), input);
    return data;
  },

  async update(classId: string, input: UpdateClassInput): Promise<SchoolClass> {
    if (env.useMockApi) {
      const existing = mockClasses.find((c) => c.id === classId);
      if (!existing) return mockReject("Class not found.", 404, "not_found");
      const updated: SchoolClass = { ...existing, ...input };
      mockClasses = mockClasses.map((c) => (c.id === classId ? updated : c));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<SchoolClass>(ENDPOINTS.byId(classId), input);
    return data;
  },

  async remove(classId: string): Promise<void> {
    if (env.useMockApi) {
      mockClasses = mockClasses.filter((c) => c.id !== classId);
      return mockDelay(undefined);
    }
    await apiClient.delete(ENDPOINTS.byId(classId));
  },
};
