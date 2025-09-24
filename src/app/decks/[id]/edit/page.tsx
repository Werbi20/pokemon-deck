'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CardGallery from '@/components/CardGallery'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { DeckCard, Deck } from '@/types'
import { validateDeckFormat } from '@/lib/deckUtils'

export default function EditDeckPage() {
  const params = useParams()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [deckFormat, setDeckFormat] = useState('Standard')
  const [cards, setCards] = useState<DeckCard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDeck(params.id as string)
    }
  }, [params.id])

  const fetchDeck = async (deckId: string) => {
    try {
      const data = await apiClient.get<Deck>(`/api/decks/${deckId}`)
      setDeck(data)
      setDeckName(data.name)
      setDeckDescription(data.description || '')
      setDeckFormat(data.format)
      setCards(data.cards)
    } catch (error) {
      console.error('Erro ao carregar deck:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

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

  const handleUpdateCardQuantity = (cardName: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCard(cardName)
      return
    }

    setCards(prev => 
      prev.map(c => 
        c.name === cardName 
          ? { ...c, quantity }
          : c
      )
    )
  }

  const handleSubmit = async () => {
    if (!deck) return

    setSaving(true)

    try {
      await apiClient.put(`/api/decks/${deck.id}`, {
        name: deckName,
        description: deckDescription,
        format: deckFormat,
        cards: cards,
        thumbnailUrl: cards.find(c => c.imageUrl)?.imageUrl || deck.thumbnailUrl || '',
      })

      router.push(`/decks/${deck.id}`)
    } catch (error) {
      console.error('Erro ao atualizar deck:', error)
    } finally {
      setSaving(false)
    }
  }

  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
  
  // Validar o deck atual
  const currentDeck: Deck = {
    id: deck?.id || '',
    name: deckName,
    description: deckDescription,
    format: deckFormat,
    cards: cards,
    matches: deck?.matches || [],
    createdAt: deck?.createdAt || new Date(),
    updatedAt: new Date()
  }
  
  const validation = validateDeckFormat(currentDeck)

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
        <button onClick={() => router.push('/')} className="btn-primary">
          Voltar para Decks
        </button>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header simplificado com apenas Salvar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Editar Deck</h1>
            <p className="text-white/80">Busque cartas e ajuste seu deck</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/decks/${deck.id}`)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !validation.isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Deck'}
            </button>
          </div>
        </div>

        {/* Layout lado a lado: esquerda busca, direita grid de cartas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Buscar Cartas</h2>
            <CardGallery onAddCard={handleAddCard} />
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cartas no Deck ({totalCards})</h2>
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
