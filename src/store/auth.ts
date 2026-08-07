/**
 * Auth state (Zustand) — foundation. Holds the single 7-day token (PLAN §3),
 * persisted to AsyncStorage. The real login wires to the API/mock service layer
 * later; for now `signIn` accepts a token and the login gate reacts to it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { setMockRole } from '@/api/service';
import type { UserRole } from '@/api/types';

const TOKEN_KEY = 'civiq.token';
const ROLE_KEY = 'civiq.role';

type AuthState = {
  token: string | null;
  /** From AuthResponse.user.role — decides which app shell mounts. */
  role: UserRole | null;
  /** True once the persisted token has been read at least once. */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  role: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const [token, role] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ROLE_KEY),
      ]);
      if (role) setMockRole(role as UserRole);
      set({ token, role: role as UserRole | null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  signIn: async (token: string, role: UserRole = 'CITIZEN') => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [ROLE_KEY, role],
    ]);
    setMockRole(role);
    set({ token, role });
  },
  signOut: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
    set({ token: null, role: null });
  },
}));
