import { create } from 'zustand'

type UiStore = {
  sidebarOpen: boolean
  notificationCount: number
  setSidebarOpen: (open: boolean) => void
  decrementNotifications: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: false,
  notificationCount: 3,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  decrementNotifications: () =>
    set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),
}))