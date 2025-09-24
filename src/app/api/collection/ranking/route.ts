import { NextRequest, NextResponse } from 'next/server'
import { 
  getCollectionRankings, 
  getUserCollectionRank,
  getCollectionValueHistory 
} from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Buscar ranking específico do usuário
      const userRank = await getUserCollectionRank(userId)
      const valueHistory = await getCollectionValueHistory(userId, 30)
      
      return NextResponse.json({
        userRank,
        valueHistory
      })
    } else {
      // Buscar ranking geral
      const rankings = await getCollectionRankings(limit)
      
      return NextResponse.json(rankings)
    }
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
