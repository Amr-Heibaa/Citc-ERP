import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  userId?: number;
  username: string;
  email?: string | null;
  displayName?: string | null;
};

type UserStore = {
  user: AuthUser | null;
  roles: string[];
  permissions: string[];
  setAuth: (
    user: AuthUser | null,
    roles: string[],
    permissions: string[],
  ) => void;
  clearAuth: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],

      setAuth: (user, roles, permissions) =>
        set({ user, roles, permissions }),

      clearAuth: () =>
        set({
          user: null,
          roles: [],
          permissions: [],
        }),

      hasRole: (role) => get().roles.includes(role),

      hasPermission: (permission) =>
        get().permissions.includes(permission),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);