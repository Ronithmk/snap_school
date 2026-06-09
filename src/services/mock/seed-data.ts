import type { AuthUser, PriceList, School, SchoolClass, Student } from "@/types";

export const MOCK_SCHOOLS: School[] = [];

export const MOCK_CLASSES: SchoolClass[] = [];

export const MOCK_PRICE_LISTS: PriceList[] = [];

export const MOCK_STUDENTS: Student[] = [];

export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: "usr_platform_admin",
    name: "Platform Admin",
    email: "admin@snapschool.app",
    password: "demo1234",
    role: "platform_admin",
    avatarUrl: undefined,
  },
  {
    id: "usr_school_admin",
    name: "School Admin",
    email: "school@snapschool.app",
    password: "demo1234",
    role: "school_admin",
    schoolIds: [],
    avatarUrl: undefined,
  },
];
