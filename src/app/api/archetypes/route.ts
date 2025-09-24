import { NextRequest, NextResponse } from 'next/server'
import { getArchetypes, updateArchetypeStats } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const archetypes = await getArchetypes()
    return NextResponse.json(archetypes)
  } catch (error) {
    console.error('Erro ao buscar arquétipos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await req.json()
    const { archetypeId, stats } = body
    
    if (!archetypeId || !stats) {
      return NextResponse.json(
        { error: 'ID do arquétipo e estatísticas são obrigatórios' },
        { status: 400 }
      )
    }
    
    await updateArchetypeStats(archetypeId, stats)
    
    return NextResponse.json({ 
      message: 'Estatísticas do arquétipo atualizadas com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar arquétipo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
