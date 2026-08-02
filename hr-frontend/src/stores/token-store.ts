import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type TokenStore = {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (accessToken: string | null, refreshToken: string | null) => void
  setToken: (token: string | null) => void
  clearToken: () => void
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setToken: (token) => set({ accessToken: token }),
      clearToken: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: 'token',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)