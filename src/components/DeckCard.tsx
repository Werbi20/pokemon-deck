'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Deck } from '@/types'
import { validateDeckFormat } from '@/lib/deckUtils'
import { apiClient } from '@/lib/apiClient'

interface DeckCardProps {
  deck: Deck
}

const DeckCard = ({ deck }: DeckCardProps) => {
  const router = useRouter()
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
  const uniqueCards = deck.cards.length
  const safeMatches = Array.isArray((deck as any).matches) ? (deck as any).matches : []
  const wins = safeMatches.filter((match: any) => match.result === 'win').length
  const totalMatches = safeMatches.length
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
  const validation = validateDeckFormat(deck)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este deck?')) return
    try {
      await apiClient.delete(`/api/decks/${deck.id}`)
      router.refresh()
    } catch (e) {
      alert('Erro ao excluir deck')
    }
  }

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'standard':
        return 'bg-blue-100 text-blue-800'
      case 'expanded':
        return 'bg-green-100 text-green-800'
      case 'limited':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="deck-card">
      <div className="deck-card-header">
        {deck.thumbnailUrl && (
          <img src={deck.thumbnailUrl} alt={deck.name} className="w-full h-32 object-cover rounded mb-3" />
        )}
        <div className="flex items-center space-x-2">
          <h3 className="deck-card-title">{deck.name}</h3>
          {!validation.isValid && (
            <span className="text-red-500 text-sm" title="Deck inválido">
              ⚠️
            </span>
          )}
        </div>
        <span className={`deck-card-format ${getFormatColor(deck.format)}`}>
          {deck.format}
        </span>
      </div>
      
      {deck.description && (
        <p className="text-gray-600 mb-4">{deck.description}</p>
      )}
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total de cartas:</span>
          <span className={`font-medium ${totalCards === 60 ? 'text-green-600' : 'text-red-600'}`}>
            {totalCards}/60
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cartas únicas:</span>
          <span className="font-medium">{uniqueCards}</span>
        </div>
        {totalMatches > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Win Rate:</span>
            <span className={`font-medium ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {winRate}% ({wins}/{totalMatches})
            </span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Link
          href={`/decks/${deck.id}`}
          className="flex-1 btn-primary text-center"
        >
          Ver Deck
        </Link>
        <Link
          href={`/decks/${deck.id}/edit`}
          className="btn-secondary"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="btn-danger"
          title="Excluir deck"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

export default DeckCard
