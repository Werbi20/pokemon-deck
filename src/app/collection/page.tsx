'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { CollectionCard } from '@/types'

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [collectionValue, setCollectionValue] = useState<any>(null)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSet, setFilterSet] = useState('')
  const [filterRarity, setFilterRarity] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false)

  useEffect(() => {
    fetchCollection()
    fetchCollectionValue()
  }, [])

  const fetchCollection = async () => {
    try {
      const data = await apiClient.get<CollectionCard[]>('/api/collection')
      setCollection(data)
    } catch (error) {
      console.error('Erro ao carregar coleção:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCollectionValue = async () => {
    try {
      setLoadingPrices(true)
      const data = await apiClient.get('/api/collection/prices')
      setCollectionValue(data)
    } catch (error) {
      console.error('Erro ao carregar valores da coleção:', error)
    } finally {
      setLoadingPrices(false)
    }
  }

  const refreshPrices = async () => {
    try {
      setLoadingPrices(true)
      await apiClient.post('/api/collection/prices', {
        action: 'refresh_all_prices'
      })
      await fetchCollectionValue()
      alert('Preços atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar preços:', error)
      alert('Erro ao atualizar preços')
    } finally {
      setLoadingPrices(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const handleUpdateQuantity = async (cardId: string, newQuantity: number) => {
    try {
      await apiClient.put('/api/collection', {
        cardId,
        quantity: newQuantity
      })
      
      setCollection(prev => 
        prev.map(card => 
          card.id === cardId 
            ? { ...card, quantity: newQuantity }
            : card
        ).filter(card => card.quantity > 0)
      )
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
    }
  }

  const filteredCollection = collection.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSet = !filterSet || card.set === filterSet
    const matchesRarity = !filterRarity || card.rarity === filterRarity
    const matchesType = !filterType || (card.types && card.types.includes(filterType))
    
    return matchesSearch && matchesSet && matchesRarity && matchesType
  })

  const uniqueSets = [...new Set(collection.map(card => card.set))].sort()
  const uniqueRarities = [...new Set(collection.map(card => card.rarity).filter(Boolean))].sort()
  const uniqueTypes = [...new Set(collection.flatMap(card => card.types || []))].sort()

  const totalCards = collection.reduce((sum, card) => sum + card.quantity, 0)
  const uniqueCards = collection.length

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      alert('Por favor, digite um nome para a coleção')
      return
    }

    try {
      console.log('Criando coleção:', { name: newCollectionName.trim(), isPublic: newCollectionIsPublic })
      const res = await apiClient.post<{ id: string }>('/api/collections', { 
        name: newCollectionName.trim(),
        isPublic: newCollectionIsPublic 
      })
      console.log('Coleção criada com sucesso:', res)
      alert('Coleção criada com sucesso: ' + newCollectionName)
      setShowCreateModal(false)
      setNewCollectionName('')
      setNewCollectionIsPublic(false)
    } catch (e) {
      console.error('Erro ao criar coleção:', e)
      const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido'
      alert(`Erro ao criar coleção: ${errorMessage}`)
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
        {/* Criar Coleção Rápido */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Minhas Coleções</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Criar nova coleção
            </button>
            <a href="/collection/add" className="btn-primary">Adicionar cartas à coleção</a>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Minha Coleção
            </h1>
            <p className="text-white/80">
              Gerencie suas cartas físicas do Pokémon TCG
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/collection/decks"
              className="btn-secondary flex items-center space-x-2"
            >
              <span>🎴</span>
              <span>Ver Decks</span>
            </Link>
            <Link
              href="/collection/add"
              className="btn-primary flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Adicionar Cartas</span>
            </Link>
          </div>
        </div>

        {/* Estatísticas da Coleção */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Estatísticas da Coleção
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
              <div className="text-sm text-blue-600">Total de Cartas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{uniqueCards}</div>
              <div className="text-sm text-green-600">Cartas Únicas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{uniqueSets.length}</div>
              <div className="text-sm text-purple-600">Sets Diferentes</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{uniqueTypes.length}</div>
              <div className="text-sm text-yellow-600">Tipos Diferentes</div>
            </div>
          </div>
        </div>

        {/* Valores da Coleção */}
        {collectionValue && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Valor da Coleção
              </h2>
              <button
                onClick={refreshPrices}
                disabled={loadingPrices}
                className="btn-secondary text-sm"
              >
                {loadingPrices ? 'Atualizando...' : '🔄 Atualizar Preços'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(collectionValue.totalValue)}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {collectionValue.totalCards > 0 ? formatCurrency(collectionValue.totalValue / collectionValue.totalCards) : '$0.00'}
                </div>
                <div className="text-sm text-gray-600">Valor Médio por Carta</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {collectionValue.cardValues.filter((cv: any) => cv.price).length}
                </div>
                <div className="text-sm text-gray-600">Cartas com Preço</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nome
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome da carta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set
              </label>
              <select
                value={filterSet}
                onChange={(e) => setFilterSet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="">Todos os sets</option>
                {uniqueSets.map(set => (
                  <option key={set} value={set}>{set}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raridade
              </label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="">Todas as raridades</option>
                {uniqueRarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="">Todos os tipos</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cartas */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cartas na Coleção ({filteredCollection.length})
          </h2>
          
          {filteredCollection.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {collection.length === 0 
                ? 'Sua coleção está vazia. Adicione cartas para começar!'
                : 'Nenhuma carta encontrada com os filtros aplicados.'
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCollection.map((card) => (
                <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{card.name}</h3>
                      <p className="text-sm text-gray-500">{card.set}</p>
                      <p className="text-sm text-gray-500">#{card.code}</p>
                      {card.rarity && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mt-1">
                          {card.rarity}
                        </span>
                      )}
                      {card.types && card.types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(card.id, card.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                        disabled={card.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{card.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(card.id, card.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Criação de Coleção */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Criar Nova Coleção
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Coleção
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Ex: Minha Coleção Principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                    autoFocus
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newCollectionIsPublic}
                    onChange={(e) => setNewCollectionIsPublic(e.target.checked)}
                    className="h-4 w-4 text-pokemon-blue focus:ring-pokemon-blue border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Tornar coleção pública
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCollectionName('')
                    setNewCollectionIsPublic(false)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="btn-primary"
                >
                  Criar Coleção
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
