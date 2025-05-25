import { create } from 'zustand';

interface LoadingStore {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoading = create<LoadingStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));