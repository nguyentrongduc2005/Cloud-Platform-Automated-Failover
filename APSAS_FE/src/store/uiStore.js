import { create } from "zustand";

export const useUI = create((set) => ({
  sidebarOpen: false,               
  openSidebar:  () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
