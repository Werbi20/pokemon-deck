import { NextRequest, NextResponse } from 'next/server'
import { getFeed } from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '20')
      
      const feed = await getFeed(userId, limit)
      
      return NextResponse.json(feed)
    } catch (error) {
      console.error('Erro ao buscar feed:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
