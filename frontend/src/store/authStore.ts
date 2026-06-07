import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  role: 'Administrador' | 'Vendedor';
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'Administrador',
    }),
    {
      name: 'auth-storage',
    }
  )
);
