// components/AuthProvider.tsx
'use client'

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth, refreshAuth, token } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    
    // Vérifier l'authentification toutes les 5 minutes
    const interval = setInterval(() => {
      if (token) {
        refreshAuth();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [initializeAuth, refreshAuth, token]);

  return <>{children}</>;
}