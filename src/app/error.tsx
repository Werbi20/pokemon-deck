'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Log para inspeção
    // eslint-disable-next-line no-console
    console.error('Global error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-5xl mb-2">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ocorreu um erro</h2>
        <p className="text-sm text-gray-600 mb-4">Tente novamente. Se persistir, recarregue a página.</p>
        <button onClick={() => reset()} className="btn-primary">Tentar novamente</button>
      </div>
    </div>
  )
}


