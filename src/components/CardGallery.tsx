'use client'

import { useState, useEffect } from 'react'
import { PokemonCard, DeckCard } from '@/types'
import AdvancedFilters from './AdvancedFilters'

interface CardGalleryProps {
  onAddCard: (card: DeckCard) => void
  showAddToCollection?: boolean
  targetCollectionId?: string // se definido, adiciona à coleção
}

const CardGallery = ({ onAddCard, showAddToCollection = false, targetCollectionId }: CardGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [suggestions, setSuggestions] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const searchCards = async (query: string, pageNum: number = 1, currentFilters: Record<string, string> = {}) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        page: pageNum.toString()
      })

      // Adicionar filtros aos parâmetros
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/cards/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (pageNum === 1) {
          setCards(data.data)
        } else {
          setCards(prev => [...prev, ...data.data])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cartas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    searchCards(searchTerm, 1, filters)
  }

  // Autocomplete por prefixo enquanto digita
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      const q = searchTerm.trim()
      if (!q) { setSuggestions([]); return }
      try {
        const params = new URLSearchParams({ q, page: '1', pageSize: '8', orderBy: 'name' })
        const res = await fetch(`/api/cards/search?${params.toString()}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.data || [])
        }
      } catch {}
    }
    const id = setTimeout(run, 200)
    return () => { clearTimeout(id); controller.abort() }
  }, [searchTerm])

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters)
    setPage(1)
    if (searchTerm.trim()) {
      searchCards(searchTerm, 1, newFilters)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    searchCards(searchTerm, nextPage, filters)
  }

  const handleAddCard = (card: PokemonCard) => {
    const deckCard: DeckCard = {
      id: card.id,
      name: card.name,
      imageUrl: card.images.small,
      code: card.number,
      quantity: 1
    }
    onAddCard(deckCard)
  }

  const handleAddToCollection = async (card: PokemonCard) => {
    if (!targetCollectionId) {
      alert('Crie e selecione uma coleção antes de adicionar cartas.');
      return
    }
    try {
      await fetch(`/api/collections/${targetCollectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: targetCollectionId,
          name: card.name,
          imageUrl: card.images.small,
          code: card.number,
          quantity: 1,
          set: card.set.name,
          rarity: card.rarity,
          types: card.types
        }),
      })
      
      alert('Carta adicionada à coleção!')
    } catch (error) {
      console.error('Erro ao adicionar carta à coleção:', error)
      alert('Erro ao adicionar carta à coleção')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cartas..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          🔍 Filtros
        </button>
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-12 w-full bg-white border border-gray-200 rounded shadow max-h-64 overflow-auto">
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSearchTerm(s.name)
                  setSuggestions([])
                  handleAddCard(s as any)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
              >
                <img src={s.images.small} alt={s.name} className="w-8 h-8 object-cover rounded" />
                <span className="text-sm">{s.name} · {s.set?.name} · #{s.number}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Filtros Avançados */}
      <AdvancedFilters
        onFiltersChange={handleFiltersChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {cards.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="pokemon-card">
                <img
                  src={card.images.small}
                  alt={card.name}
                  className="pokemon-card-image"
                />
                <div className="pokemon-card-content">
                  <h3 className="pokemon-card-name">{card.name}</h3>
                  <div className="pokemon-card-details">
                    <p className="text-xs text-gray-500 mb-1">
                      {card.set.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      #{card.number}
                    </p>
                    {card.types && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {card.types.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddCard(card)}
                        className="w-full btn-primary text-sm py-1"
                      >
                        Adicionar ao Deck
                      </button>
                      {showAddToCollection && (
                        <button
                          onClick={() => handleAddToCollection(card)}
                          className="w-full btn-secondary text-sm py-1"
                        >
                          Adicionar à Coleção
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Carregar Mais'}
            </button>
          </div>
        </div>
      )}

      {searchTerm && cards.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma carta encontrada para "{searchTerm}"
        </div>
      )}
    </div>
  )
}

export default CardGallery
