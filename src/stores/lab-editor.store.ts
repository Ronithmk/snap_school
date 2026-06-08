import { create } from "zustand";
import type { ID, LabElement, LabPage } from "@/types";

function cloneElement(element: LabElement, idSuffix: string): LabElement {
  return { ...element, id: `${element.id}_${idSuffix}`, x: element.x + 0.5, y: element.y + 0.5 };
}

function nextZIndex(elements: LabElement[]): number {
  return elements.reduce((max, el) => Math.max(max, el.zIndex), 0) + 1;
}

interface LabEditorState {
  productId: ID | null;
  pages: LabPage[];
  activePageId: ID | null;
  selectedElementId: ID | null;
  zoom: number;
  snapToGrid: boolean;
  showRulers: boolean;
  showMargins: boolean;
  isDirty: boolean;

  load: (productId: ID, pages: LabPage[]) => void;
  markSaved: () => void;
  setZoom: (zoom: number) => void;
  toggleSnapToGrid: () => void;
  toggleRulers: () => void;
  toggleMargins: () => void;

  setActivePage: (pageId: ID) => void;
  addPage: (page: LabPage) => void;
  duplicatePage: (pageId: ID) => void;
  removePage: (pageId: ID) => void;
  renamePage: (pageId: ID, name: string) => void;
  setPageBackground: (pageId: ID, patch: Partial<Pick<LabPage, "backgroundColor" | "backgroundImageUrl">>) => void;

  selectElement: (elementId: ID | null) => void;
  addElement: (pageId: ID, element: LabElement) => void;
  updateElement: (pageId: ID, elementId: ID, patch: Partial<LabElement>) => void;
  removeElement: (pageId: ID, elementId: ID) => void;
  duplicateElement: (pageId: ID, elementId: ID) => void;
  toggleElementLock: (pageId: ID, elementId: ID) => void;
  bringForward: (pageId: ID, elementId: ID) => void;
  sendBackward: (pageId: ID, elementId: ID) => void;
}

function mapPage(pages: LabPage[], pageId: ID, fn: (page: LabPage) => LabPage): LabPage[] {
  return pages.map((page) => (page.id === pageId ? fn(page) : page));
}

function mapElements(page: LabPage, elementId: ID, fn: (element: LabElement) => LabElement): LabPage {
  return { ...page, elements: page.elements.map((el) => (el.id === elementId ? fn(el) : el)) };
}

export const useLabEditorStore = create<LabEditorState>()((set) => ({
  productId: null,
  pages: [],
  activePageId: null,
  selectedElementId: null,
  zoom: 1,
  snapToGrid: true,
  showRulers: true,
  showMargins: true,
  isDirty: false,

  load: (productId, pages) =>
    set({
      productId,
      pages,
      activePageId: pages[0]?.id ?? null,
      selectedElementId: null,
      zoom: 1,
      isDirty: false,
    }),
  markSaved: () => set({ isDirty: false }),
  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.25, zoom)) }),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleMargins: () => set((s) => ({ showMargins: !s.showMargins })),

  setActivePage: (pageId) => set({ activePageId: pageId, selectedElementId: null }),
  addPage: (page) => set((s) => ({ pages: [...s.pages, page], activePageId: page.id, isDirty: true })),
  duplicatePage: (pageId) =>
    set((s) => {
      const source = s.pages.find((p) => p.id === pageId);
      if (!source) return s;
      const suffix = `${Date.now()}`;
      const copy: LabPage = {
        ...source,
        id: `${source.id}_${suffix}`,
        name: `${source.name} (copy)`,
        elements: source.elements.map((el) => ({ ...el, id: `${el.id}_${suffix}` })),
      };
      const index = s.pages.findIndex((p) => p.id === pageId);
      const pages = [...s.pages.slice(0, index + 1), copy, ...s.pages.slice(index + 1)];
      return { pages, activePageId: copy.id, isDirty: true };
    }),
  removePage: (pageId) =>
    set((s) => {
      if (s.pages.length <= 1) return s;
      const pages = s.pages.filter((p) => p.id !== pageId);
      const activePageId = s.activePageId === pageId ? (pages[0]?.id ?? null) : s.activePageId;
      return { pages, activePageId, selectedElementId: null, isDirty: true };
    }),
  renamePage: (pageId, name) => set((s) => ({ pages: mapPage(s.pages, pageId, (page) => ({ ...page, name })), isDirty: true })),
  setPageBackground: (pageId, patch) =>
    set((s) => ({ pages: mapPage(s.pages, pageId, (page) => ({ ...page, ...patch })), isDirty: true })),

  selectElement: (elementId) => set({ selectedElementId: elementId }),
  addElement: (pageId, element) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => ({ ...page, elements: [...page.elements, { ...element, zIndex: nextZIndex(page.elements) }] })),
      selectedElementId: element.id,
      isDirty: true,
    })),
  updateElement: (pageId, elementId, patch) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => mapElements(page, elementId, (el) => ({ ...el, ...patch } as LabElement))),
      isDirty: true,
    })),
  removeElement: (pageId, elementId) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => ({ ...page, elements: page.elements.filter((el) => el.id !== elementId) })),
      selectedElementId: s.selectedElementId === elementId ? null : s.selectedElementId,
      isDirty: true,
    })),
  duplicateElement: (pageId, elementId) =>
    set((s) => {
      const page = s.pages.find((p) => p.id === pageId);
      const source = page?.elements.find((el) => el.id === elementId);
      if (!page || !source) return s;
      const copy = cloneElement(source, `${Date.now()}`);
      copy.zIndex = nextZIndex(page.elements);
      return {
        pages: mapPage(s.pages, pageId, (p) => ({ ...p, elements: [...p.elements, copy] })),
        selectedElementId: copy.id,
        isDirty: true,
      };
    }),
  toggleElementLock: (pageId, elementId) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => mapElements(page, elementId, (el) => ({ ...el, locked: !el.locked }))),
      isDirty: true,
    })),
  bringForward: (pageId, elementId) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => mapElements(page, elementId, (el) => ({ ...el, zIndex: el.zIndex + 1 }))),
      isDirty: true,
    })),
  sendBackward: (pageId, elementId) =>
    set((s) => ({
      pages: mapPage(s.pages, pageId, (page) => mapElements(page, elementId, (el) => ({ ...el, zIndex: Math.max(0, el.zIndex - 1) }))),
      isDirty: true,
    })),
}));

export function selectActivePage(state: LabEditorState): LabPage | null {
  return state.pages.find((p) => p.id === state.activePageId) ?? null;
}

export function selectSelectedElement(state: LabEditorState): LabElement | null {
  const page = selectActivePage(state);
  if (!page) return null;
  return page.elements.find((el) => el.id === state.selectedElementId) ?? null;
}
