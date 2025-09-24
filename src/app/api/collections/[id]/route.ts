import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authMiddleware'
import { getCollectionCards, addCardToUserCollection, updateCollectionCardInUserCollection } from '@/lib/mockData'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/collections/[id] - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('GET /api/collections/[id] - userId:', userId, 'collectionId:', params.id)
    const cards = await getCollectionCards(userId, params.id)
    console.log('GET /api/collections/[id] - cards:', cards)
    return NextResponse.json(cards)
  } catch (e) {
    console.error('Erro em GET /api/collections/[id]:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('POST /api/collections/[id] - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('POST /api/collections/[id] - userId:', userId, 'collectionId:', params.id)
    const body = await req.json()
    console.log('POST /api/collections/[id] - body:', body)
    const id = await addCardToUserCollection(userId, params.id, body)
    console.log('POST /api/collections/[id] - card adicionada com id:', id)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    console.error('Erro em POST /api/collections/[id]:', e)
    return NextResponse.json({ error: 'Falha ao adicionar carta' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('PUT /api/collections/[id] - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('PUT /api/collections/[id] - userId:', userId, 'collectionId:', params.id)
    const body = await req.json()
    const { cardId, quantity } = body
    console.log('PUT /api/collections/[id] - atualizando card:', { cardId, quantity })
    await updateCollectionCardInUserCollection(userId, params.id, cardId, quantity)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Erro em PUT /api/collections/[id]:', e)
    return NextResponse.json({ error: 'Falha ao atualizar carta' }, { status: 500 })
  }
}


