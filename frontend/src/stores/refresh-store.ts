import { create } from 'zustand';

interface RefreshState {
  version: number;
  refresh: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  version: 0,
  refresh: () => set((state) => ({ version: state.version + 1 })),
}));

export const refreshData = () => useRefreshStore.getState().refresh();
