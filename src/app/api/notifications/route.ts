import { NextRequest, NextResponse } from 'next/server'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/firestore'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '20')
      
      const notifications = await getNotifications(userId, limit)
      
      return NextResponse.json(notifications)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { action, notificationId } = body
      
      switch (action) {
        case 'mark_read':
          if (!notificationId) {
            return NextResponse.json(
              { error: 'ID da notificação é obrigatório' },
              { status: 400 }
            )
          }
          await markNotificationAsRead(notificationId)
          return NextResponse.json({ 
            message: 'Notificação marcada como lida'
          })
          
        case 'mark_all_read':
          await markAllNotificationsAsRead(userId)
          return NextResponse.json({ 
            message: 'Todas as notificações marcadas como lidas'
          })
          
        default:
          return NextResponse.json(
            { error: 'Ação inválida' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('Erro ao processar notificação:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
