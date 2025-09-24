import { NextRequest, NextResponse } from 'next/server'
import { getPublicDecks, makeDeckPublic } from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      archetype: searchParams.get('archetype') || undefined,
      format: searchParams.get('format') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      orderBy: (searchParams.get('orderBy') as 'views' | 'likes' | 'copies' | 'createdAt') || 'createdAt'
    }
    const q = searchParams.get('q')?.toLowerCase().trim()
    
    let publicDecks = await getPublicDecks(filters)
    if (q) {
      publicDecks = publicDecks.filter(d => d.name.toLowerCase().includes(q))
    }
    return NextResponse.json(publicDecks)
  } catch (error) {
    console.error('Erro ao buscar decks públicos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { deckId, tags, archetype } = body
      
      if (!deckId) {
        return NextResponse.json(
          { error: 'ID do deck é obrigatório' },
          { status: 400 }
        )
      }
      
      const publicDeckId = await makeDeckPublic(userId, deckId, tags || [], archetype)
      
      return NextResponse.json({ 
        publicDeckId,
        message: 'Deck tornado público com sucesso'
      }, { status: 201 })
    } catch (error) {
      console.error('Erro ao tornar deck público:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
