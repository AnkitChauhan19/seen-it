import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import type { Profile } from "@/types/database";

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isInitialized: false,
  isAuthenticated: false,
  setSession: (session) =>
    set({
      session,
      isAuthenticated: Boolean(session),
    }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));
