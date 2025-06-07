// stores/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React from 'react';

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

interface ContentStore {
  shouldRefresh: boolean;
  contents: any[];
  setShouldRefresh: (value: boolean) => void;
  addContent: (content: any) => void;
  resetContents: () => void;
}

interface AuthState {
  // État
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  

  // Actions
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  initializeAuth: () => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      initialized: false,
      error: null,

      // Actions
      login: async ({ username, password }) => {
        set({ loading: true, error: null });
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
            refreshToken: refresh,
            isAuthenticated: true,
            loading: false,
            initialized: true,
            error: null
          });

          return user;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Échec de la connexion',
            loading: false,
            initialized: true
          });
          throw error;
        }
      },

      register: async ({ username, email, password }) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = Object.entries(errorData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('\n');
            throw new Error(errorMessage || "Échec de l'inscription");
          }

          set({ loading: false, initialized: true, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Échec de l'inscription",
            loading: false,
            initialized: true
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          initialized: true,
          error: null
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/jwt/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
          });

          if (!res.ok) throw new Error('Refresh failed');

          const { access } = await res.json();
          set({ token: access });
          return true;
        } catch (error) {
          console.error('Refresh error:', error);
          return false;
        }
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const user = await res.json();
            set({ user, isAuthenticated: true });
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          throw error;
        }
      },

      initializeAuth: () => {
        const { token, user } = get();
        set({
          isAuthenticated: !!token && !!user,
          initialized: true,
          loading: false,
          error: null
        });
      },

      setUser: (user: User) => set({ user }),

      setError: (error: string | null) => set({ error }),
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
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        initialized: state.initialized,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Hook pour l'initialisation et le rafraîchissement automatique
export const useAuthInitialization = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);

  React.useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }

    // Si on a un token mais que l'initialisation est faite, on vérifie l'utilisateur
    if (initialized && token) {
      fetchUser().catch(() => refreshAuth());
    }

    // Rafraîchir le token périodiquement (toutes les 10 minutes)
    const interval = setInterval(() => {
      if (token) {
        refreshAuth();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [initializeAuth, refreshAuth, fetchUser, token, initialized]);
};

export const useContentStore = create<ContentStore>((set) => ({
  shouldRefresh: false,
  contents: [],
  setShouldRefresh: (value) => set({ shouldRefresh: value }),
  addContent: (content) => set((state) => ({ contents: [content, ...state.contents] })),
  resetContents: () => set({ contents: [] }),
}));