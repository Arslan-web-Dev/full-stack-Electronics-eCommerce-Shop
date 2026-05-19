import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
};

export type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
};

export type AuthActions = {
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
        });
      },

      setLoading: (loading) => set({ loading }),

      updateUser: (updatedUser) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...updatedUser,
            },
          };
        });
      },
    }),
    {
      name: "auth-storage", // persisted unique storage name
      storage: createJSONStorage(() => localStorage), // persist in localStorage for persistence across reloads
    }
  )
);
