import { create } from 'zustand';

interface SidebarState {
  expanded: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  expanded: true,
  toggle: () => set((state) => ({ expanded: !state.expanded })),
}));
