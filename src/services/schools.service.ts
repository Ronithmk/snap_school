import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject, paginate, searchFilter } from "@/services/mock/transport";
import { MOCK_SCHOOLS } from "@/services/mock/seed-data";
import type {
  CreateSchoolInput,
  PaginatedResponse,
  QueryParams,
  School,
  UpdateSchoolInput,
} from "@/types";

const ENDPOINTS = {
  list: "/schools",
  bySlug: (slug: string) => `/schools/slug/${slug}`,
  byId: (id: string) => `/schools/${id}`,
} as const;

let mockSchools = [...MOCK_SCHOOLS];

export const schoolsService = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<School>> {
    if (env.useMockApi) {
      const filtered = searchFilter(mockSchools, params.search, ["name", "slug"]);
      return mockDelay(paginate(filtered, params));
    }
    const { data } = await apiClient.get<PaginatedResponse<School>>(ENDPOINTS.list, { params });
    return data;
  },

  async getBySlug(slug: string): Promise<School | null> {
    if (env.useMockApi) {
      return mockDelay(mockSchools.find((s) => s.slug === slug) ?? null);
    }
    const { data } = await apiClient.get<School>(ENDPOINTS.bySlug(slug));
    return data;
  },

  async getById(id: string): Promise<School | null> {
    if (env.useMockApi) {
      return mockDelay(mockSchools.find((s) => s.id === id) ?? null);
    }
    const { data } = await apiClient.get<School>(ENDPOINTS.byId(id));
    return data;
  },

  async create(input: CreateSchoolInput): Promise<School> {
    if (env.useMockApi) {
      if (mockSchools.some((s) => s.slug === input.slug)) {
        return mockReject("A school with this slug already exists.", 409, "slug_taken");
      }
      const now = new Date().toISOString();
      const school: School = {
        id: `sch_${Date.now()}`,
        status: "active",
        classCount: 0,
        albumCount: 0,
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      mockSchools = [school, ...mockSchools];
      return mockDelay(school);
    }
    const { data } = await apiClient.post<School>(ENDPOINTS.list, input);
    return data;
  },

  async update(id: string, input: UpdateSchoolInput): Promise<School> {
    if (env.useMockApi) {
      const existing = mockSchools.find((s) => s.id === id);
      if (!existing) return mockReject("School not found.", 404, "not_found");
      const updated: School = {
        ...existing,
        ...input,
        settings: { ...existing.settings, ...input.settings },
        updatedAt: new Date().toISOString(),
      };
      mockSchools = mockSchools.map((s) => (s.id === id ? updated : s));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<School>(ENDPOINTS.byId(id), input);
    return data;
  },

  async remove(id: string): Promise<void> {
    if (env.useMockApi) {
      mockSchools = mockSchools.filter((s) => s.id !== id);
      return mockDelay(undefined);
    }
    await apiClient.delete(ENDPOINTS.byId(id));
  },
};
