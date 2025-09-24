'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { Activity, UserProfile } from '@/types'

export default function FeedPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const data = await apiClient.get<Activity[]>('/api/feed')
      setActivities(data)
      
      // Buscar perfis dos usuários
      const userIds = [...new Set(data.map(activity => activity.userId))]
      const profilesMap = new Map<string, UserProfile>()
      
      for (const userId of userIds) {
        try {
          const profile = await apiClient.get<UserProfile>(`/api/profiles?userId=${userId}`)
          profilesMap.set(userId, profile)
        } catch (error) {
          console.error(`Erro ao buscar perfil do usuário ${userId}:`, error)
        }
      }
      
      setProfiles(profilesMap)
    } catch (error) {
      console.error('Erro ao carregar feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deck_created': return '🎴'
      case 'deck_public': return '🌐'
      case 'match_played': return '⚔️'
      case 'achievement_unlocked': return '🏆'
      case 'followed_user': return '👥'
      default: return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deck_created': return 'bg-blue-100 text-blue-800'
      case 'deck_public': return 'bg-green-100 text-green-800'
      case 'match_played': return 'bg-red-100 text-red-800'
      case 'achievement_unlocked': return 'bg-yellow-100 text-yellow-800'
      case 'followed_user': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'agora mesmo'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} dia${days > 1 ? 's' : ''} atrás`
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Feed Social
          </h1>
          <p className="text-white/80">
            Acompanhe as atividades da comunidade
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhuma atividade ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Comece seguindo outros usuários para ver suas atividades aqui
            </p>
            <a
              href="/public-decks"
              className="btn-primary"
            >
              Explorar Comunidade
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const profile = profiles.get(activity.userId)
              return (
                <div key={activity.id} className="bg-white rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-gray-500">👤</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-800">
                          {profile?.displayName || 'Usuário'}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)} {activity.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">
                        {activity.description}
                      </p>
                      
                      {activity.data && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          {activity.type === 'deck_created' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Deck:</span>
                              <span className="font-medium text-gray-800">
                                {activity.data.deckName}
                              </span>
                            </div>
                          )}
                          
                          {activity.type === 'deck_public' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Deck público:</span>
                              <span className="font-medium text-gray-800">
                                {activity.data.deckName}
                              </span>
                            </div>
                          )}
                          
                          {activity.type === 'match_played' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Resultado:</span>
                              <span className={`font-medium ${activity.data.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                                {activity.data.result === 'win' ? 'Vitória' : 'Derrota'}
                              </span>
                              <span className="text-sm text-gray-600">com</span>
                              <span className="font-medium text-gray-800">
                                {activity.data.deckName}
                              </span>
                            </div>
                          )}
                          
                          {activity.type === 'followed_user' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Agora seguindo:</span>
                              <span className="font-medium text-gray-800">
                                {activity.data.followingName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
