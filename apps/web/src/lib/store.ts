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

interface AiModelState {
  /** null = follow the server default (env AI_PROVIDER). */
  provider: string | null;
  model: string | null;
  setModel: (provider: string, model: string) => void;
  reset: () => void;
}

/** User-selected AI provider/model for chat (model switcher). */
export const useAiModel = create<AiModelState>()(
  persist(
    (set) => ({
      provider: null,
      model: null,
      setModel: (provider, model) => set({ provider, model }),
      reset: () => set({ provider: null, model: null }),
    }),
    { name: 'careeros-ai-model' },
  ),
);
