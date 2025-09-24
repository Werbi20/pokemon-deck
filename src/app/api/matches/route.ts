import { NextRequest, NextResponse } from 'next/server'
import { listAllMatches, addMatchToDeck, getDeckById } from '@/lib/deckRepo'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const matches = await listAllMatches()
      return NextResponse.json(matches)
    } catch (error) {
      console.error('Erro ao buscar partidas:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { deckId, result, notes, eventType, opponentDeck, endedByTime, date } = body

      // Verificar se o deck existe e pertence ao usuário
      const deck = await getDeckById(deckId)
      if (!deck) {
        return NextResponse.json(
          { error: 'Deck não encontrado' },
          { status: 404 }
        )
      }

      // Criar a partida
      const matchId = await addMatchToDeck(deckId, {
        deckId,
        result,
        notes,
        eventType,
        opponentDeck,
        endedByTime,
        date: date ? new Date(date) : undefined,
      })

      return NextResponse.json({ id: matchId }, { status: 201 })
    } catch (error) {
      console.error('Erro ao criar partida:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
