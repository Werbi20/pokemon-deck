'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CardGallery from '@/components/CardGallery'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { DeckCard, Deck } from '@/types'
import { validateDeckFormat, importDeckFromTCGLive, importDeckFromText } from '@/lib/deckUtils'

export default function NewDeckPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [deckFormat, setDeckFormat] = useState('Standard')
  const [cards, setCards] = useState<DeckCard[]>([])
  const [loading, setLoading] = useState(false)
  // Mantemos suporte a import automático via querystring, sem UI
  const [importFormat, setImportFormat] = useState<'json' | 'text'>('json')
  const [importContent, setImportContent] = useState('')

  const handleAddCard = (card: DeckCard) => {
    setCards(prev => {
      const existingCard = prev.find(c => c.name === card.name)
      if (existingCard) {
        return prev.map(c => 
          c.name === card.name 
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      } else {
        return [...prev, { ...card, quantity: 1 }]
      }
    })
  }

  // Pré-preencher com dados da etapa inicial (start)
  useEffect(() => {
    const presetName = params.get('name') || ''
    const presetFormat = params.get('format') || ''
    const importFormatParam = params.get('importFormat')
    const importContentParam = params.get('importContent')
    if (presetName) setDeckName(presetName)
    if (presetFormat) setDeckFormat(presetFormat)
    if (importFormatParam && importContentParam) {
      setImportFormat(importFormatParam as 'json' | 'text')
      try {
        setImportContent(decodeURIComponent(importContentParam))
        // importar automaticamente
        setTimeout(() => handleImport(), 0)
      } catch {}
    }
  }, [])

  const handleRemoveCard = (cardName: string) => {
    setCards(prev => {
      const card = prev.find(c => c.name === cardName)
      if (card && card.quantity > 1) {
        return prev.map(c => 
          c.name === cardName 
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
      } else {
        return prev.filter(c => c.name !== cardName)
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Enriquecer cartas sem imagem/código via API de resolução
      const needsResolve = cards.some(c => !c.imageUrl || !c.code)
      let payloadCards = cards
      if (needsResolve) {
        const response = await fetch('/api/cards/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards })
        })
        if (response.ok) {
          const data = await response.json()
          payloadCards = data.cards || cards
        }
      }

      const created = await apiClient.post<{ id: string }>('/api/decks', {
        name: deckName || 'Novo Deck',
        description: deckDescription,
        format: deckFormat || 'Standard',
        cards: payloadCards,
        thumbnailUrl: payloadCards.find(c => c.imageUrl)?.imageUrl || '',
      })

      if (created?.id) {
        router.push(`/decks/${created.id}`)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao criar deck:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
  
  // Validar o deck atual
  const currentDeck: Deck = {
    id: '',
    name: deckName,
    description: deckDescription,
    format: deckFormat,
    cards: cards,
    matches: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const validation = validateDeckFormat(currentDeck)

  const handleImport = () => {
    try {
      let importedDeck: Partial<Deck>
      
      if (importFormat === 'json') {
        importedDeck = importDeckFromTCGLive(importContent)
      } else {
        importedDeck = importDeckFromText(importContent)
      }

      // Preencher os campos com os dados importados
      if (importedDeck.name) setDeckName(importedDeck.name)
      if (importedDeck.format) setDeckFormat(importedDeck.format)
      if (importedDeck.cards) {
        setCards(importedDeck.cards as DeckCard[])
      }

      setShowImportModal(false)
      setImportContent('')
    } catch (error) {
      alert('Erro ao importar deck: ' + (error as Error).message)
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Novo Deck</h1>
            <p className="text-white/80">Busque cartas e monte seu deck</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !validation.isValid}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Deck'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Esquerda: Busca de Cartas */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Buscar Cartas</h2>
            <CardGallery onAddCard={handleAddCard} />
          </div>

          {/* Direita: Visualização do Deck */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Cartas no Deck ({totalCards})</h2>
            </div>
            {cards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma carta adicionada</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {cards
                  .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
                  .map(card => (
                    <div key={`${card.name}-${card.code}`} className="relative group">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full aspect-[3/4] object-cover rounded"
                      />
                      <div className="absolute -top-1 -right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">x{card.quantity}</div>
                      <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card.name)}
                          className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCard(card)}
                          className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
