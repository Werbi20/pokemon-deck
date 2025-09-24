import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authMiddleware'
import { getUserCollections, createUserCollection } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  console.log('GET /api/collections - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('GET /api/collections - userId:', userId)
    const cols = await getUserCollections(userId)
    console.log('GET /api/collections - coleções:', cols)
    return NextResponse.json(cols)
  } catch (e) {
    console.error('Erro em GET /api/collections:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/collections - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('POST /api/collections - userId:', userId)
    let body: any = {}
    try { 
      body = await req.json() 
      console.log('POST /api/collections - body:', body)
    } catch (e) {
      console.log('POST /api/collections - erro ao fazer parse do body:', e)
    }
    const name: string = (body?.name || 'Minha Coleção').toString().slice(0, 80)
    const isPublic: boolean = Boolean(body?.isPublic)
    console.log('POST /api/collections - criando coleção:', { name, isPublic })
    const id = await createUserCollection(userId, name, isPublic)
    console.log('POST /api/collections - coleção criada com id:', id)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    console.error('Erro em POST /api/collections:', e)
    return NextResponse.json({ error: 'Falha ao criar coleção' }, { status: 500 })
  }
}


