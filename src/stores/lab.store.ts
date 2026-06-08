import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ID } from "@/types";

interface LabState {
  /** School currently scoping the Lab views — set by the school switcher (platform_admin) or auto-derived (school_admin). */
  activeSchoolId: ID | null;
  setActiveSchoolId: (schoolId: ID | null) => void;
}

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      activeSchoolId: null,
      setActiveSchoolId: (schoolId) => set({ activeSchoolId: schoolId }),
    }),
    { name: "snapschool.lab" },
  ),
);
