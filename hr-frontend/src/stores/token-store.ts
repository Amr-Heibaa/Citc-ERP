import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type TokenStore = {
  accessToken: string | null
  setToken: (token: string | null) => void
  clearToken: () => void
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setToken: (token) => set({ accessToken: token }),
      clearToken: () => set({ accessToken: null }),
    }),
    {
      name: 'token',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)