import { NextRequest, NextResponse } from 'next/server'
import { resetMockData } from '@/lib/mockData'
import { withAuth } from '@/lib/authMiddleware'

// Permite resetar dados mock no modo demo
export async function POST(request: NextRequest) {
  return withAuth(request, async (_req, userId) => {
    try {
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        return NextResponse.json({ error: 'Demo mode desabilitado' }, { status: 403 })
      }
      resetMockData()
      return NextResponse.json({ message: 'Dados demo resetados', userId })
    } catch (e) {
      console.error('Erro ao resetar demo:', e)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  })
}
