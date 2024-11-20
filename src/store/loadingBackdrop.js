import { create } from "zustand";

export const useLoadingBackdrop = create((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
