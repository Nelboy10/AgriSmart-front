// src/components/auth/AuthInitializer.tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])
  return null
}