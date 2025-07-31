import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppStore, User } from './types';

// Initial state
const initialState = {
  user: null,
  theme: 'light' as const,
  loading: false,
};

// Conditionally apply devtools middleware only in non-test environments
const isTestEnvironment = 
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ||
  typeof globalThis !== 'undefined' && (globalThis as any).__vitest__;

const storeImplementation = (set: any, get: any) => ({
  // State
  ...initialState,

  // Actions
  setUser: (user: User | null) => {
    set({ user }, false, 'setUser');
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme }, false, 'toggleTheme');
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme }, false, 'setTheme');
  },

  setLoading: (loading: boolean) => {
    set({ loading }, false, 'setLoading');
  },

  reset: () => {
    set(initialState, false, 'reset');
  },
});

export const useAppStore = create<AppStore>()(
  isTestEnvironment
    ? persist(storeImplementation, {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
        }),
      })
    : devtools(
        persist(storeImplementation, {
          name: 'app-store',
          partialize: (state) => ({
            theme: state.theme,
            user: state.user,
          }),
        }),
        {
          name: 'AppStore',
        }
      )
);