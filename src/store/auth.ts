/**
 * Auth state (Zustand) — foundation. Holds the single 7-day token (PLAN §3),
 * persisted to AsyncStorage. The real login wires to the API/mock service layer
 * later; for now `signIn` accepts a token and the login gate reacts to it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const TOKEN_KEY = 'civiq.token';

type AuthState = {
  token: string | null;
  /** True once the persisted token has been read at least once. */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      set({ token, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  signIn: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },
  signOut: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));
