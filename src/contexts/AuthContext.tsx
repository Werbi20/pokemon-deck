'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from 'firebase/auth'
import { isFirebaseReady } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined || !isFirebaseReady) {
    // Fallback seguro quando Provider não está presente ou Firebase indisponível
    return {
      user: null,
      loading: false,
      signInWithGoogle: async () => {},
      logout: async () => {}
    }
  }
  return context
}
