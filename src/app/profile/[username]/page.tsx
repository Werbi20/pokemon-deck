'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { UserProfile } from '@/types'

export default function UserProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([])
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  useEffect(() => {
    if (params.username) {
      fetchProfile(params.username as string)
    }
  }, [params.username])

  const fetchProfile = async (username: string) => {
    try {
      const data = await apiClient.get<UserProfile>(`/api/profiles/${username}`)
      setProfile(data)
      
      // Verificar se está seguindo
      const followStatus = await apiClient.post('/api/follow', {
        action: 'check',
        targetUserId: data.userId
      })
      setFollowing(followStatus.following)
      
      // Buscar seguidores e seguindo
      const [followersData, followingData] = await Promise.all([
        apiClient.get<UserProfile[]>(`/api/follow?type=followers&userId=${data.userId}`),
        apiClient.get<UserProfile[]>(`/api/follow?type=following&userId=${data.userId}`)
      ])
      
      setFollowers(followersData)
      setFollowingUsers(followingData)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile) return
    
    try {
      const action = following ? 'unfollow' : 'follow'
      await apiClient.post('/api/follow', {
        action,
        targetUserId: profile.userId
      })
      
      setFollowing(!following)
      
      // Atualizar contadores
      if (following) {
        setFollowers(prev => prev.filter(f => f.userId !== profile.userId))
      } else {
        // Adicionar o usuário atual aos seguidores (simulação)
        // Em um caso real, você buscaria o perfil do usuário atual
      }
      
      alert(following ? 'Deixou de seguir o usuário' : 'Agora você está seguindo este usuário')
    } catch (error) {
      console.error('Erro ao seguir/parar de seguir:', error)
      alert('Erro ao processar ação')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Perfil não encontrado
        </h3>
        <p className="text-white/80">
          O usuário que você está procurando não existe
        </p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header do Perfil */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">👤</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.displayName}
                </h1>
                <p className="text-gray-600">@{profile.username}</p>
                <p className="text-sm text-gray-500">
                  Membro desde {new Date(profile.joinDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-md font-medium ${
                following 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-pokemon-blue text-white hover:bg-pokemon-blue-dark'
              }`}
            >
              {following ? 'Seguindo' : 'Seguir'}
            </button>
          </div>

          {profile.bio && (
            <p className="text-gray-700 mb-4">{profile.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {profile.location && (
              <span>📍 {profile.location}</span>
            )}
            {profile.favoriteArchetype && (
              <span>🎴 {profile.favoriteArchetype}</span>
            )}
            <span>🏆 {profile.favoriteFormat}</span>
          </div>
          
          {Object.values(profile.socialLinks).some(link => link) && (
            <div className="flex space-x-4">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Twitter
                </a>
              )}
              {profile.socialLinks.youtube && (
                <a
                  href={`https://youtube.com/@${profile.socialLinks.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-600"
                >
                  YouTube
                </a>
              )}
              {profile.socialLinks.twitch && (
                <a
                  href={`https://twitch.tv/${profile.socialLinks.twitch}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:text-purple-600"
                >
                  Twitch
                </a>
              )}
              {profile.socialLinks.discord && (
                <span className="text-indigo-500">
                  Discord: {profile.socialLinks.discord}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.totalDecks}</div>
            <div className="text-sm text-gray-600">Decks</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{profile.stats.publicDecks}</div>
            <div className="text-sm text-gray-600">Públicos</div>
          </div>
          <div 
            className="bg-white rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => setShowFollowers(true)}
          >
            <div className="text-2xl font-bold text-purple-600">{profile.stats.followers}</div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          <div 
            className="bg-white rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => setShowFollowing(true)}
          >
            <div className="text-2xl font-bold text-orange-600">{profile.stats.following}</div>
            <div className="text-sm text-gray-600">Seguindo</div>
          </div>
        </div>

        {/* Conquistas */}
        {profile.achievements.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Conquistas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm font-medium text-gray-800">{achievement}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Seguidores */}
        {showFollowers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Seguidores ({followers.length})
                </h3>
                <button
                  onClick={() => setShowFollowers(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={follower.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">👤</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{follower.displayName}</h4>
                      <p className="text-sm text-gray-600">@{follower.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Seguindo */}
        {showFollowing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Seguindo ({followingUsers.length})
                </h3>
                <button
                  onClick={() => setShowFollowing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {followingUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">👤</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{user.displayName}</h4>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
