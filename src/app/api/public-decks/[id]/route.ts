import { NextRequest, NextResponse } from 'next/server'
import { getPublicDeckByToken, copyPublicDeck, likePublicDeck } from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicDeck = await getPublicDeckByToken(params.id)
    
    if (!publicDeck) {
      return NextResponse.json(
        { error: 'Deck público não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(publicDeck)
  } catch (error) {
    console.error('Erro ao buscar deck público:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { action } = body
      
      switch (action) {
        case 'copy':
          const newDeckId = await copyPublicDeck(userId, params.id)
          return NextResponse.json({ 
            newDeckId,
            message: 'Deck copiado com sucesso'
          })
          
        case 'like':
          await likePublicDeck(params.id, userId)
          return NextResponse.json({ 
            message: 'Like atualizado com sucesso'
          })
          
        default:
          return NextResponse.json(
            { error: 'Ação inválida' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
