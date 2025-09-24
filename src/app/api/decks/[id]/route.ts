import { NextRequest, NextResponse } from 'next/server'
import { getDeck, updateDeck, deleteDeck } from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const deck = await getDeck(params.id, userId)

      if (!deck) {
        return NextResponse.json(
          { error: 'Deck não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json(deck)
    } catch (error) {
      console.error('Erro ao buscar deck:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { name, description, format, cards } = body

      await updateDeck(params.id, userId, {
        name,
        description,
        format,
        cards: (cards || []).map((c: any) => ({
          id: c.id || '',
          name: c.name,
          imageUrl: c.imageUrl || '',
          code: c.code || '',
          setCode: c.setCode,
          quantity: c.quantity || 1
        }))
      })

      return NextResponse.json({ message: 'Deck atualizado com sucesso' })
    } catch (error) {
      console.error('Erro ao atualizar deck:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      // segurança básica: garante que o deck pertence ao usuário
      const deck = await getDeck(params.id, userId)
      if (!deck) {
        return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 })
      }
      await deleteDeck(params.id, userId)
      return NextResponse.json({ message: 'Deck deletado com sucesso' })
    } catch (error) {
      console.error('Erro ao deletar deck:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
