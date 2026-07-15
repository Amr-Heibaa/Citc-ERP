import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUserResponse } from '@/lib/api/generated/model'

type UserStore = {
  user: AuthUserResponse | null
  roles: string[]
  permissions: string[]
  setAuth: (user: AuthUserResponse | null, roles: string[], permissions: string[]) => void
  clearAuth: () => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      setAuth: (user, roles, permissions) => set({ user, roles, permissions }),
      clearAuth: () => set({ user: null, roles: [], permissions: [] }),
      hasRole: (role) => get().roles.includes(role),
      hasPermission: (permission) => get().permissions.includes(permission),
    }),
    { name: 'user', storage: createJSONStorage(() => sessionStorage) },
  ),
)