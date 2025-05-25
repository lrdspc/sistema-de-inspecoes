import { create } from 'zustand'; 
import { persist } from 'zustand/middleware'; 

// Mock user for demo purposes
const DEMO_USER = {
  id: '1',
  email: 'tecnico@exemplo.com',
  nome: 'Técnico Demo',
  cargo: 'Técnico',
  unidadeRegional: 'PR',
  fotoUrl: undefined,
  mfaHabilitado: false
}

interface AuthUser {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  unidadeRegional: string;
  fotoUrl?: string;
  mfaHabilitado: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          // Demo login - only allow demo user
          if (email === 'tecnico@exemplo.com' && password === '123456') {
            set({ 
              user: DEMO_USER,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error('Credenciais inválidas');
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          set({ user: null, isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          await new Promise(resolve => setTimeout(resolve, 500));
          // For demo, check if we have a persisted user
          const user = localStorage.getItem('auth-storage');
          if (user) {
            set({ user: DEMO_USER, isLoading: false, error: null });
          } else {
            set({ user: null, isLoading: false, error: null });
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);