'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import DeckAnalysisComponent from '@/components/DeckAnalysis'
import DeckCompatibility from '@/components/DeckCompatibility'
import { apiClient } from '@/lib/apiClient'
import { PublicDeck } from '@/lib/firestore'
import { validateDeckFormat, exportDeckToTCGLive, exportDeckToText } from '@/lib/deckUtils'
import { analyzeDeck } from '@/lib/deckAnalysis'

export default function PublicDeckViewPage() {
  const params = useParams()
  const [publicDeck, setPublicDeck] = useState<PublicDeck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'text'>('json')

  useEffect(() => {
    if (params.token) {
      fetchPublicDeck(params.token as string)
    }
  }, [params.token])

  const fetchPublicDeck = async (token: string) => {
    try {
      const data = await apiClient.get<PublicDeck>(`/api/public-decks/${token}`)
      setPublicDeck(data)
    } catch (error) {
      console.error('Erro ao carregar deck público:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyDeck = async () => {
    if (!publicDeck) return
    
    try {
      const response = await apiClient.post(`/api/public-decks/${publicDeck.id}`, {
        action: 'copy'
      })
      
      alert('Deck copiado com sucesso!')
    } catch (error) {
      console.error('Erro ao copiar deck:', error)
      alert('Erro ao copiar deck')
    }
  }

  const handleLikeDeck = async () => {
    if (!publicDeck) return
    
    try {
      await apiClient.post(`/api/public-decks/${publicDeck.id}`, {
        action: 'like'
      })
      
      // Atualizar o deck para refletir o novo número de likes
      fetchPublicDeck(params.token as string)
    } catch (error) {
      console.error('Erro ao curtir deck:', error)
    }
  }

  const handleExport = () => {
    if (!publicDeck) return
    
    let content = ''
    let filename = ''
    
    if (exportFormat === 'json') {
      content = exportDeckToTCGLive(publicDeck)
      filename = `${publicDeck.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    } else {
      content = exportDeckToText(publicDeck)
      filename = `${publicDeck.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setShowExportModal(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    )
  }

  if (!publicDeck) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Deck não encontrado
        </h3>
        <p className="text-white/80">
          O deck público que você está procurando não existe ou foi removido
        </p>
      </div>
    )
  }

  const totalCards = publicDeck.cards.reduce((sum, card) => sum + card.quantity, 0)
  const validation = validateDeckFormat(publicDeck)

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header do Deck */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{publicDeck.name}</h1>
                {!validation.isValid && (
                  <span className="text-red-500 text-lg" title="Deck inválido">
                    ⚠️
                  </span>
                )}
                {publicDeck.archetype && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {publicDeck.archetype}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{publicDeck.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Formato: {publicDeck.format}</span>
                <span>Criado em {new Date(publicDeck.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="btn-secondary"
            >
              {showAnalysis ? '📊 Ocultar Análise' : '📊 Ver Análise'}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-secondary"
            >
              📤 Exportar
            </button>
            <button
              onClick={handleCopyDeck}
              className="btn-primary"
            >
              📋 Copiar Deck
            </button>
            <button
              onClick={handleLikeDeck}
              className="btn-secondary"
            >
              ❤️ Curtir ({publicDeck.likes})
            </button>
          </div>
        </div>

        {/* Estatísticas do Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{totalCards}</div>
            <div className="text-sm text-gray-600">Total de Cartas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{publicDeck.views}</div>
            <div className="text-sm text-gray-600">Visualizações</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{publicDeck.likes}</div>
            <div className="text-sm text-gray-600">Curtidas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{publicDeck.copies}</div>
            <div className="text-sm text-gray-600">Cópias</div>
          </div>
        </div>

        {/* Tags */}
        {publicDeck.tags && publicDeck.tags.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {publicDeck.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cartas do Deck */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cartas do Deck ({totalCards}/60)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicDeck.cards.map((card) => (
              <div key={card.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{card.name}</h3>
                  <p className="text-sm text-gray-500">#{card.code}</p>
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {card.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultados de Torneios */}
        {publicDeck.tournamentResults && publicDeck.tournamentResults.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Resultados de Torneios
            </h2>
            <div className="space-y-3">
              {publicDeck.tournamentResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{result.tournamentName}</h3>
                    <p className="text-sm text-gray-600">
                      {result.date.toLocaleDateString('pt-BR')} • {result.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {result.placement}º de {result.totalPlayers}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.archetype}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Análise do Deck */}
        {showAnalysis && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Análise do Deck
            </h2>
            <DeckAnalysisComponent analysis={analyzeDeck(publicDeck)} />
          </div>
        )}

        {/* Compatibilidade com Coleção */}
        <DeckCompatibility deck={publicDeck} />

        {/* Modal de Exportação */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Exportar Deck
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={(e) => setExportFormat(e.target.value as 'json')}
                        className="mr-2"
                      />
                      JSON (Pokémon TCG Live)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="text"
                        checked={exportFormat === 'text'}
                        onChange={(e) => setExportFormat(e.target.value as 'text')}
                        className="mr-2"
                      />
                      Texto (TCG Live)
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 btn-primary"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
