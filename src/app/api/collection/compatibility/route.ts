import { NextRequest, NextResponse } from 'next/server'
import { getAvailableCardsForDeck } from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { deckCards } = body

      const compatibility = await getAvailableCardsForDeck(userId, deckCards)
      return NextResponse.json(compatibility)
    } catch (error) {
      console.error('Erro ao verificar compatibilidade:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
