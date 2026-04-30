import { create } from 'zustand';

interface GlobalState {
  currentCourseId: string | null;
  setCourseId: (id: string) => void;
  // Añadir más estados globales según sea necesario
}

export const useGlobalStore = create<GlobalState>((set) => ({
  currentCourseId: null,
  setCourseId: (id) => set({ currentCourseId: id }),
}));
