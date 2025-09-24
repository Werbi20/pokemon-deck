'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import DeckAnalysisComponent from '@/components/DeckAnalysis'
import DeckCompatibility from '@/components/DeckCompatibility'
import { apiClient } from '@/lib/apiClient'
import { Deck, DeckCard } from '@/types'
import { validateDeckFormat, exportDeckToTCGLive, exportDeckToText } from '@/lib/deckUtils'
import { analyzeDeck } from '@/lib/deckAnalysis'

export default function DeckViewPage() {
  const params = useParams()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'text'>('json')
  const [showAnalysis, setShowAnalysis] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDeck(params.id as string)
    }
  }, [params.id])

  const fetchDeck = async (deckId: string) => {
    try {
      const data = await apiClient.get<Deck>(`/api/decks/${deckId}`)
      // Resolver imagens ausentes via API
      const needsResolve = data.cards.some(c => !c.imageUrl || c.imageUrl.length === 0)
      if (needsResolve) {
        try {
          const res = await fetch('/api/cards/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cards: data.cards })
          })
          if (res.ok) {
            const payload = await res.json()
            setDeck({ ...data, cards: payload.cards })
          } else {
            setDeck(data)
          }
        } catch {
          setDeck(data)
        }
      } else {
        setDeck(data)
      }
    } catch (error) {
      console.error('Erro ao carregar deck:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deck || !confirm('Tem certeza que deseja excluir este deck?')) {
      return
    }

    try {
      await apiClient.delete(`/api/decks/${deck.id}`)
      router.push('/')
    } catch (error) {
      console.error('Erro ao excluir deck:', error)
    }
  }

  const handleExport = () => {
    if (!deck) return

    let content: string
    let filename: string
    let mimeType: string

    if (exportFormat === 'json') {
      content = exportDeckToTCGLive(deck)
      filename = `${deck.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      mimeType = 'application/json'
    } else {
      content = exportDeckToText(deck)
      filename = `${deck.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
      mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
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

  const handleMakePublic = async () => {
    if (!deck) return

    const tags = prompt('Digite as tags do deck (separadas por vírgula):') || ''
    const archetype = prompt('Digite o arquétipo do deck (opcional):') || undefined

    try {
      const response = await apiClient.post('/api/public-decks', {
        deckId: deck.id,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        archetype
      })

      alert('Deck tornado público com sucesso!')
      // Atualizar o deck para mostrar que é público
      setDeck(prev => prev ? ({ ...prev, isPublic: true } as Deck) : prev)
    } catch (error) {
      console.error('Erro ao tornar deck público:', error)
      alert('Erro ao tornar deck público')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Deck não encontrado
        </h3>
        <Link href="/" className="btn-primary">
          Voltar para Decks
        </Link>
      </div>
    )
  }

  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
  const safeMatches = Array.isArray((deck as any).matches) ? (deck as any).matches : []
  const wins = safeMatches.filter((match: any) => match.result === 'win').length
  const totalMatches = safeMatches.length
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
  const validation = validateDeckFormat(deck)

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8">
      {/* Header do Deck */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{deck.name}</h1>
              {!validation.isValid && (
                <span className="text-red-500 text-lg" title="Deck inválido">
                  ⚠️
                </span>
              )}
            </div>
            {deck.description && (
              <p className="text-gray-600 mb-2">{deck.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {deck.format}
              </span>
              <span>Criado em {new Date(deck.createdAt).toLocaleDateString('pt-BR')}</span>
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
            {!deck?.isPublic && (
              <button
                onClick={handleMakePublic}
                className="btn-secondary"
              >
                🌐 Tornar Público
              </button>
            )}
            <Link
              href={`/decks/${deck.id}/edit`}
              className="btn-primary"
            >
              ✏️ Editar
            </Link>
            <button
              onClick={handleDelete}
              className="btn-danger"
            >
              🗑️ Excluir
            </button>
          </div>
        </div>

        {/* Estatísticas do Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800">{totalCards}/60</div>
            <div className="text-sm text-gray-600">Cartas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800">{deck.cards.length}</div>
            <div className="text-sm text-gray-600">Cartas Únicas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800">{totalMatches}</div>
            <div className="text-sm text-gray-600">Partidas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {winRate}%
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Lista de Cartas - Grid com quantidade sobreposta */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cartas do Deck ({totalCards})
        </h2>
        {deck.cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Este deck não possui cartas</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {deck.cards
              .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
              .map((card) => (
                <div key={`${card.name}-${card.code}`} className="relative group">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full aspect-[3/4] object-cover rounded"
                  />
                  <div className="absolute -top-1 -right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    x{card.quantity}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Copiar Deck (exportação rápida) */}
      <div className="bg-white rounded-lg p-6">
        <button
          className="btn-secondary"
          onClick={() => {
            const text = exportDeckToText(deck)
            navigator.clipboard.writeText(text)
            alert('Deck copiado para a área de transferência!')
          }}
        >
          📋 Copiar Deck (texto)
        </button>
      </div>

      {/* Histórico de Partidas */}
      {safeMatches.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Histórico de Partidas
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(safeMatches as Array<{ id: string; result: string; date: string | Date; notes?: string }>)
              .sort((a: { date: string | Date }, b: { date: string | Date }) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((match: { id: string; result: string; date: string | Date; notes?: string }) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(match.date).toLocaleDateString('pt-BR')}
                      </p>
                      {match.notes && (
                        <p className="text-xs text-gray-500">{match.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className={`font-medium ${
                    match.result === 'win' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {match.result === 'win' ? 'Vitória' : 'Derrota'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Análise do Deck */}
      {showAnalysis && deck && (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Análise do Deck
          </h2>
          <DeckAnalysisComponent analysis={analyzeDeck(deck)} />
        </div>
      )}

      {/* Compatibilidade com Coleção */}
      {deck && (
        <DeckCompatibility deck={deck} />
      )}

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
                  Formato de exportação
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value as 'json' | 'text')}
                      className="mr-2"
                    />
                    <span>JSON (Pokémon TCG Live)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={exportFormat === 'text'}
                      onChange={(e) => setExportFormat(e.target.value as 'json' | 'text')}
                      className="mr-2"
                    />
                    <span>Texto (TCG Live)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                className="btn-primary"
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
