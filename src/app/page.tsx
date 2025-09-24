'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    </ProtectedRoute>
  )
}
