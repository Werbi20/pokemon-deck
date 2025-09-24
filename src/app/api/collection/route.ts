import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authMiddleware'

// Fallback para mockData quando Firestore não está disponível
async function getCollectionWithFallback(userId: string) {
  try {
    const { getCollection } = await import('@/lib/firestore')
    return await getCollection(userId)
  } catch (error) {
    console.log('Firestore não disponível, usando mockData')
    // Para mockData, retornar array vazio por enquanto
    // As cartas serão adicionadas quando o usuário criar uma coleção
    return []
  }
}

async function addCardToCollectionWithFallback(userId: string, cardData: any) {
  try {
    const { addCardToCollection } = await import('@/lib/firestore')
    return await addCardToCollection(userId, cardData)
  } catch (error) {
    console.log('Firestore não disponível, usando mockData')
    const { addCardToUserCollection } = await import('@/lib/mockData')
    return await addCardToUserCollection(userId, 'default-collection', cardData)
  }
}

async function updateCardInCollectionWithFallback(cardId: string, userId: string, quantity: number) {
  try {
    const { updateCardInCollection } = await import('@/lib/firestore')
    return await updateCardInCollection(cardId, userId, quantity)
  } catch (error) {
    console.log('Firestore não disponível, usando mockData')
    const { updateCollectionCardInUserCollection } = await import('@/lib/mockData')
    return await updateCollectionCardInUserCollection(userId, 'default-collection', cardId, quantity)
  }
}

export async function GET(request: NextRequest) {
  console.log('GET /api/collection - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('GET /api/collection - userId:', userId)
    const collection = await getCollectionWithFallback(userId)
    console.log('GET /api/collection - collection:', collection)
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Erro ao buscar coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/collection - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('POST /api/collection - userId:', userId)
    const body = await request.json()
    const { name, imageUrl, code, quantity, set, rarity, types } = body
    console.log('POST /api/collection - body:', body)

    const cardId = await addCardToCollectionWithFallback(userId, {
      name,
      imageUrl,
      code,
      quantity,
      set,
      rarity,
      types
    })

    console.log('POST /api/collection - card adicionada com id:', cardId)
    return NextResponse.json({ id: cardId }, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar carta à coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/collection - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('PUT /api/collection - userId:', userId)
    const body = await req.json()
    const { cardId, quantity } = body
    console.log('PUT /api/collection - body:', body)

    await updateCardInCollectionWithFallback(cardId, userId, quantity)
    return NextResponse.json({ message: 'Carta atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar carta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
