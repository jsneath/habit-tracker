import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAnonymous: (isAnonymous: boolean) => void;
  setLoading: (loading: boolean) => void;
  markOnboardingSeen: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAnonymous: true,
      isLoading: true,
      hasSeenOnboarding: false,

      setUser: (user) =>
        set({
          user,
          isAnonymous: !user,
          isLoading: false,
        }),

      setAnonymous: (isAnonymous) => set({ isAnonymous }),

      setLoading: (isLoading) => set({ isLoading }),

      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),

      clearUser: () =>
        set({
          user: null,
          isAnonymous: true,
        }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);
