// stores/auth-store.ts
import { create } from 'zustand';
import React from 'react';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  email_verified?: boolean;
}

interface AuthState {
  // État
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  role: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,
      role: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Dans votre auth-store.ts
login: async ({ username, password }) => {
  set({ isLoading: true, error: null });
  try {
    // 1. Obtenir le token JWT
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/jwt/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.detail || 'Identifiants incorrects');
    }

    const { access: token, refresh } = await tokenResponse.json();
    
    // 2. Récupérer les infos utilisateur
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Échec de la récupération des informations utilisateur');
    }

    const user = await userResponse.json();

    // 3. Mettre à jour l'état
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });

    // Optionnel: Stocker le refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh', refresh);
    }

    return user;
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Échec de la connexion',
      isLoading: false
    });
    throw error;
   }
  },

      register: async ({ username, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, })
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = Object.entries(errorData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('\n');
            throw new Error(errorMessage || "Échec de l'inscription");
          }

          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Échec de l'inscription",
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      initializeAuth: async () => {
        const { token, user } = get();
        set({
          isHydrated: true,
          isAuthenticated: !!token && !!user
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
      skipHydration: true,
    }
  )
);

// Hook pour l'initialisation côté client
export const useAuthInitialization = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  
  React.useEffect(() => {
    if (!isHydrated) {
      initializeAuth();
    }
  }, [initializeAuth, isHydrated]);
  
  return {
    isHydrated,
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
    isLoading: useAuthStore((state) => state.isLoading)
  };
};