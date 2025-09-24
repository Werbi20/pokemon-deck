'use client'

import { useLocalAuth } from '@/hooks/useLocalAuth'
import { ReactNode } from 'react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useLocalAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-2">🔐</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Acesso restrito</h3>
          <p className="text-sm text-gray-600 mb-2">Você precisa fazer login para acessar esta página.</p>
          <div className="mt-4 space-y-2">
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Fazer Login
            </Link>
            <p className="text-xs text-gray-500">
              Não tem uma conta? <Link href="/login" className="text-blue-600 hover:underline">Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
