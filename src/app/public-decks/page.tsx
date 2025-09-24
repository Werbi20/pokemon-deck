'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { PublicDeck, Archetype } from '@/types'

export default function PublicDecksPage() {
  const [publicDecks, setPublicDecks] = useState<PublicDeck[]>([])
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    archetype: '',
    format: '',
    orderBy: 'createdAt' as 'views' | 'likes' | 'copies' | 'createdAt'
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [decksResponse, archetypesResponse] = await Promise.all([
        apiClient.get<PublicDeck[]>('/api/public-decks'),
        apiClient.get<Archetype[]>('/api/archetypes')
      ])
      
      setPublicDecks(decksResponse)
      setArchetypes(archetypesResponse)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyDeck = async (publicDeckId: string) => {
    try {
      const response = await apiClient.post(`/api/public-decks/${publicDeckId}`, {
        action: 'copy'
      })
      
      alert('Deck copiado com sucesso!')
      // Atualizar lista para refletir o novo número de cópias
      fetchData()
    } catch (error) {
      console.error('Erro ao copiar deck:', error)
      alert('Erro ao copiar deck')
    }
  }

  const handleLikeDeck = async (publicDeckId: string) => {
    try {
      await apiClient.post(`/api/public-decks/${publicDeckId}`, {
        action: 'like'
      })
      
      // Atualizar lista para refletir o novo número de likes
      fetchData()
    } catch (error) {
      console.error('Erro ao curtir deck:', error)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'bg-red-100 text-red-800'
      case 'A': return 'bg-orange-100 text-orange-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-green-100 text-green-800'
      case 'D': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Decks Públicos
          </h1>
          <p className="text-white/80">
            Explore decks compartilhados pela comunidade
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquétipo
              </label>
              <select
                value={filters.archetype}
                onChange={(e) => setFilters({ ...filters, archetype: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="">Todos os arquétipos</option>
                {archetypes.map((archetype) => (
                  <option key={archetype.id} value={archetype.name}>
                    {archetype.name} ({archetype.tier})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="">Todos os formatos</option>
                <option value="Standard">Standard</option>
                <option value="Expanded">Expanded</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.orderBy}
                onChange={(e) => setFilters({ ...filters, orderBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="createdAt">Mais recentes</option>
                <option value="views">Mais visualizados</option>
                <option value="likes">Mais curtidos</option>
                <option value="copies">Mais copiados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Decks Públicos */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Decks da Comunidade ({publicDecks.length})
          </h2>
          
          {publicDecks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum deck público encontrado
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicDecks.map((deck) => (
                <div key={deck.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 truncate">{deck.name}</h3>
                    {deck.archetype && (
                      <span className={`px-2 py-1 text-xs rounded ${getTierColor(
                        archetypes.find(a => a.name === deck.archetype)?.tier || 'D'
                      )}`}>
                        {deck.archetype}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {deck.description || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{deck.format}</span>
                    <span>{deck.cards.reduce((sum, card) => sum + card.quantity, 0)} cartas</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex space-x-4">
                      <span>👁️ {deck.views}</span>
                      <span>❤️ {deck.likes}</span>
                      <span>📋 {deck.copies}</span>
                    </div>
                    <span>{new Date(deck.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {deck.tags && deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {deck.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/public-decks/${deck.shareToken}`}
                      className="flex-1 btn-primary text-center text-sm py-1"
                    >
                      Ver Deck
                    </Link>
                    <button
                      onClick={() => handleCopyDeck(deck.id)}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      📋 Copiar
                    </button>
                    <button
                      onClick={() => handleLikeDeck(deck.id)}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
