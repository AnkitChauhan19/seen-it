import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  signInDev: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signInDev: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
}));
