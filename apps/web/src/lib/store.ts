'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicUser } from '@careeros/shared';

interface AuthState {
  user: (PublicUser & { onboardingCompleted?: boolean }) | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: PublicUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: Partial<PublicUser & { onboardingCompleted?: boolean }>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'careeros-auth' },
  ),
);
