'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { UserProfile } from '@/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    favoriteArchetype: '',
    favoriteFormat: 'Standard',
    socialLinks: {
      twitter: '',
      youtube: '',
      twitch: '',
      discord: ''
    }
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get<UserProfile>('/api/profiles')
      setProfile(data)
      setFormData({
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        favoriteArchetype: data.favoriteArchetype,
        favoriteFormat: data.favoriteFormat,
        socialLinks: data.socialLinks
      })
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await apiClient.put('/api/profiles', formData)
      await fetchProfile()
      setEditing(false)
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        favoriteArchetype: profile.favoriteArchetype,
        favoriteFormat: profile.favoriteFormat,
        socialLinks: profile.socialLinks
      })
    }
    setEditing(false)
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
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Perfil não encontrado
        </h3>
        <p className="text-white/80">
          Crie seu perfil para começar a usar o sistema
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
              onClick={() => setEditing(!editing)}
              className="btn-primary"
            >
              {editing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="Cidade, País"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquétipo Favorito
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteArchetype}
                    onChange={(e) => setFormData({ ...formData, favoriteArchetype: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="Ex: Lugia VSTAR"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato Favorito
                </label>
                <select
                  value={formData.favoriteFormat}
                  onChange={(e) => setFormData({ ...formData, favoriteFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                >
                  <option value="Standard">Standard</option>
                  <option value="Expanded">Expanded</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="Channel Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitch
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitch}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { ...formData.socialLinks, twitch: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.discord}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { ...formData.socialLinks, discord: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    placeholder="username#1234"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="btn-primary"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.location && (
                  <span>📍 {profile.location}</span>
                )}
                {profile.favoriteArchetype && (
                  <span>🎴 {profile.favoriteArchetype}</span>
                )}
                <span>🏆 {profile.favoriteFormat}</span>
              </div>
              
              {Object.values(profile.socialLinks).some(link => link) && (
                <div className="mt-4 flex space-x-4">
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
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.followers}</div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{profile.stats.following}</div>
            <div className="text-sm text-gray-600">Seguindo</div>
          </div>
        </div>

        {/* Navegação */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Minhas Atividades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎴</div>
                <h3 className="font-medium text-gray-800">Meus Decks</h3>
                <p className="text-sm text-gray-600">Gerenciar meus decks</p>
              </div>
            </Link>
            
            <Link
              href="/public-decks"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🌐</div>
                <h3 className="font-medium text-gray-800">Decks Públicos</h3>
                <p className="text-sm text-gray-600">Explorar comunidade</p>
              </div>
            </Link>
            
            <Link
              href="/feed"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📰</div>
                <h3 className="font-medium text-gray-800">Feed Social</h3>
                <p className="text-sm text-gray-600">Ver atividades</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
