'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import CardGallery from '@/components/CardGallery'
import { DeckCard } from '@/types'
import { apiClient } from '@/lib/apiClient'

export default function AddToCollectionPage() {
  const [addedCards, setAddedCards] = useState<DeckCard[]>([])
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const list = await apiClient.get<Array<{ id: string; name: string }>>('/api/collections')
        setCollections(list)
        if (list.length > 0) setSelectedCollectionId(list[0].id)
      } catch {}
    }
    loadCollections()
  }, [])

  const handleAddCard = (card: DeckCard) => {
    // Esta função é necessária para o CardGallery, mas não será usada
    // pois estamos apenas adicionando à coleção
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Adicionar Cartas à Coleção
          </h1>
          <p className="text-white/80">
            Busque e adicione cartas à sua coleção pessoal
          </p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Buscar Cartas
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={async () => {
                const name = prompt('Nome da nova coleção:')?.trim()
                if (!name) return
                const isPublic = confirm('Tornar coleção pública? OK = Pública, Cancelar = Privada')
                const res = await apiClient.post<{ id: string }>('/api/collections', { name, isPublic })
                setCollections(prev => [...prev, { id: res.id, name }])
                setSelectedCollectionId(res.id)
              }}
              className="btn-secondary"
            >
              ➕ Nova Coleção
            </button>
          </div>
          <CardGallery 
            onAddCard={handleAddCard} 
            showAddToCollection={true}
            targetCollectionId={selectedCollectionId}
          />
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Como Funciona
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h3 className="font-medium text-gray-800">Busque a carta</h3>
                <p>Use a barra de busca para encontrar a carta que deseja adicionar</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Clique em "Adicionar à Coleção"</h3>
                <p>A carta será adicionada à sua coleção pessoal com quantidade 1</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Gerencie sua coleção</h3>
                <p>Vá para a página "Coleção" para ajustar quantidades e ver estatísticas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
