import { NextRequest, NextResponse } from 'next/server'
import { 
  followUser, 
  unfollowUser, 
  isFollowing, 
  getFollowers, 
  getFollowing 
} from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { action, targetUserId } = body
      
      if (!action || !targetUserId) {
        return NextResponse.json(
          { error: 'Ação e ID do usuário são obrigatórios' },
          { status: 400 }
        )
      }
      
      if (userId === targetUserId) {
        return NextResponse.json(
          { error: 'Você não pode seguir a si mesmo' },
          { status: 400 }
        )
      }
      
      switch (action) {
        case 'follow':
          await followUser(userId, targetUserId)
          return NextResponse.json({ 
            message: 'Usuário seguido com sucesso'
          })
          
        case 'unfollow':
          await unfollowUser(userId, targetUserId)
          return NextResponse.json({ 
            message: 'Deixou de seguir o usuário'
          })
          
        case 'check':
          const following = await isFollowing(userId, targetUserId)
          return NextResponse.json({ following })
          
        default:
          return NextResponse.json(
            { error: 'Ação inválida' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('Erro ao processar follow:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type') // 'followers' ou 'following'
      const targetUserId = searchParams.get('userId') || userId
      
      if (type === 'followers') {
        const followers = await getFollowers(targetUserId)
        return NextResponse.json(followers)
      } else if (type === 'following') {
        const following = await getFollowing(targetUserId)
        return NextResponse.json(following)
      } else {
        return NextResponse.json(
          { error: 'Tipo deve ser "followers" ou "following"' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Erro ao buscar seguidores/seguindo:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
