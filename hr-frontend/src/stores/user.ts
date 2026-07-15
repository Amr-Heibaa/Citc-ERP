import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AuthUser = {
  id: number
  username: string
  fullName: string
  role: string
}

type UserStore = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)