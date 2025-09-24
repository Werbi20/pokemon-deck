'use client'

import { useState, useEffect } from 'react'
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseReady } from '@/lib/firebase'
import { apiClient } from '@/lib/apiClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [profilePrefill, setProfilePrefill] = useState<{ username: string; displayName: string; email: string }>({ username: '', displayName: '', email: '' })

  useEffect(() => {
    // Se auth não estiver disponível (SSR ou ainda não inicializado), finalize carregamento
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          let existingProfile: any = null
          try {
            existingProfile = await apiClient.get('/api/profiles')
          } catch {}
          if (!existingProfile) {
            setNeedsProfileSetup(true)
            setProfilePrefill({
              username: (currentUser.displayName || '').toLowerCase().replace(/\s+/g, '') || `user${currentUser.uid.slice(0, 8)}`,
              displayName: currentUser.displayName || '',
              email: currentUser.email || ''
            })
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Erro ao carregar perfil do usuário:', e)
        }
      }
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      if (!isFirebaseReady || !auth || !googleProvider) {
        console.warn('Login desabilitado: Firebase não está configurado. Prosseguindo sem autenticação real.')
        return
      }
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const completeProfile = async (data: {
    username: string;
    displayName: string;
    email?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
    location?: string;
    favoriteArchetype?: string;
    favoriteFormat?: string;
    socialLinks?: { twitter?: string; youtube?: string; twitch?: string; discord?: string };
    privacy?: { showEmail?: boolean; showStats?: boolean; allowFollows?: boolean };
  }) => {
    if (!user) return
    try {
      setLoading(true)
      await apiClient.post('/api/profiles', {
        username: data.username,
        displayName: data.displayName,
        email: data.email || profilePrefill.email,
        bio: data.bio,
        avatar: data.avatar,
        banner: data.banner,
        location: data.location,
        favoriteArchetype: data.favoriteArchetype,
        favoriteFormat: data.favoriteFormat,
        socialLinks: data.socialLinks,
        privacy: data.privacy,
      })
      setNeedsProfileSetup(false)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      if (auth) {
        await signOut(auth)
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    needsProfileSetup,
    profilePrefill,
    completeProfile
  }
}
