'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { Deck } from '@/types'

interface DeckCompatibility {
  deck: Deck
  canBuild: boolean
  missingCards: Array<{
    name: string
    needed: number
    available: number
  }>
}

export default function CollectionDecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [compatibleDecks, setCompatibleDecks] = useState<DeckCompatibility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const data = await apiClient.get<Deck[]>('/api/decks')
      setDecks(data)
      
      // Verificar compatibilidade de cada deck
      const compatibilityPromises = data.map(async (deck) => {
        try {
          const compatibility = await apiClient.post('/api/collection/compatibility', {
            deckCards: deck.cards
          })
          return {
            deck,
            ...compatibility
          }
        } catch (error) {
          console.error(`Erro ao verificar compatibilidade do deck ${deck.name}:`, error)
          return {
            deck,
            canBuild: false,
            missingCards: []
          }
        }
      })
      
      const results = await Promise.all(compatibilityPromises)
      setCompatibleDecks(results)
    } catch (error) {
      console.error('Erro ao carregar decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildableDecks = compatibleDecks.filter(d => d.canBuild)
  const partiallyBuildableDecks = compatibleDecks.filter(d => !d.canBuild && d.missingCards.length > 0)

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
            Decks da Minha Coleção
          </h1>
          <p className="text-white/80">
            Veja quais decks você pode montar com suas cartas físicas
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{decks.length}</div>
            <div className="text-sm text-gray-600">Total de Decks</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{buildableDecks.length}</div>
            <div className="text-sm text-gray-600">Decks Completos</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{partiallyBuildableDecks.length}</div>
            <div className="text-sm text-gray-600">Decks Parciais</div>
          </div>
        </div>

        {/* Decks Completos */}
        {buildableDecks.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ✅ Decks que Você Pode Montar Completamente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildableDecks.map(({ deck }) => (
                <div key={deck.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-gray-800 mb-2">{deck.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{deck.format}</p>
                  <div className="text-sm text-gray-600 mb-3">
                    {deck.cards.reduce((sum, card) => sum + card.quantity, 0)} cartas
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={`/decks/${deck.id}`}
                      className="flex-1 btn-primary text-center text-sm py-1"
                    >
                      Ver Deck
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decks Parciais */}
        {partiallyBuildableDecks.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⚠️ Decks que Precisam de Mais Cartas
            </h2>
            <div className="space-y-4">
              {partiallyBuildableDecks.map(({ deck, missingCards }) => (
                <div key={deck.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{deck.name}</h3>
                      <p className="text-sm text-gray-600">{deck.format}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-yellow-600 font-medium">
                        Faltam {missingCards.length} tipos de cartas
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cartas em falta:</h4>
                    <div className="space-y-1">
                      {missingCards.slice(0, 3).map((card, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {card.name}: precisa de {card.needed}, tem {card.available}
                        </div>
                      ))}
                      {missingCards.length > 3 && (
                        <div className="text-sm text-gray-500">
                          ... e mais {missingCards.length - 3} cartas
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a
                      href={`/decks/${deck.id}`}
                      className="flex-1 btn-secondary text-center text-sm py-1"
                    >
                      Ver Deck
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nenhum deck */}
        {buildableDecks.length === 0 && partiallyBuildableDecks.length === 0 && (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum deck encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie alguns decks e adicione cartas à sua coleção para ver a compatibilidade
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/decks/new" className="btn-primary">
                Criar Deck
              </a>
              <a href="/collection/add" className="btn-secondary">
                Adicionar Cartas
              </a>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
