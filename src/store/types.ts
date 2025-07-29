// Store type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AppStore {
  // State
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}