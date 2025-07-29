import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppStore, User } from './types';

// Initial state
const initialState = {
  user: null,
  theme: 'light' as const,
  loading: false,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
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
      }),
      {
        name: 'app-store', // localStorage key
        partialize: (state) => ({
          // Only persist theme and user, not loading state
          theme: state.theme,
          user: state.user,
        }),
      }
    ),
    {
      name: 'AppStore', // DevTools name
    }
  )
);