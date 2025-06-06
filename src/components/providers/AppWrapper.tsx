// components/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { useAuthInitialization } from '@/stores/auth-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const { isHydrated } = useAuthInitialization();

  if (!isHydrated) {
    return null; // Ou un écran de chargement
  }

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}