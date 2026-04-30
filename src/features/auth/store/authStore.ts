import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/app/config/api';

interface AuthStore {
  isAuthenticated: boolean;
  user: { id?: string; name: string; email: string; role: string } | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          set({ 
            isAuthenticated: true,
            user: res.data
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Credenciales incorrectas');
        }
      },
      register: async (name, email, password) => {
        try {
          const res = await api.post('/auth/register', { name, email, password });
          set({ 
            isAuthenticated: true,
            user: res.data
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Error al registrar usuario');
        }
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
