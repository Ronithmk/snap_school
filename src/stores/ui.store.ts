import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, type Locale } from "@/config/i18n";

export type Theme = "light" | "dark" | "system";

interface UiState {
  theme: Theme;
  locale: Locale;
  dashboardSidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleDashboardSidebar: () => void;
  setDashboardSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      locale: DEFAULT_LOCALE,
      dashboardSidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleDashboardSidebar: () => set((s) => ({ dashboardSidebarOpen: !s.dashboardSidebarOpen })),
      setDashboardSidebarOpen: (open) => set({ dashboardSidebarOpen: open }),
    }),
    { name: "snapschool.ui" },
  ),
);
