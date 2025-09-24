'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { DeckCard as DeckCardType, Deck } from '@/types'
import { apiClient } from '@/lib/apiClient'
import { importDeckFromText, validateDeckFormat } from '@/lib/deckUtils'
import ProtectedRoute from '@/components/ProtectedRoute'
import DeckCardComponent from '@/components/DeckCard'

export default function DecksPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newFormat, setNewFormat] = useState('Standard')
  const [newCards, setNewCards] = useState<DeckCardType[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get<Deck[]>('/api/decks')
      setDecks(data)
    } catch (err) {
      setError('Erro ao carregar decks')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImportText = async () => {
    try {
      setCreating(true)
      const partial = importDeckFromText(importText)
      // Resolver cartas
      let payloadCards = (partial.cards as DeckCardType[]) || []
      const needsResolve = payloadCards.some(c => !c.imageUrl || !c.code)
      if (needsResolve && payloadCards.length > 0) {
        const res = await fetch('/api/cards/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cards: payloadCards }) })
        if (res.ok) {
          const data = await res.json()
          payloadCards = data.cards || payloadCards
        }
      }
      const created = await apiClient.post<{ id: string; name: string }>(
        '/api/decks',
        {
          importText,
          name: partial.name,
          format: partial.format,
          cards: payloadCards
        }
      )
      setImportText('')
      setShowCreateModal(false)
      if (created?.id) router.push(`/decks/${created.id}/edit`)
      else fetchDecks()
    } catch (e) {
      alert('Erro ao importar deck')
    } finally {
      setCreating(false)
    }
  }

  const handleCreate = async () => {
    try {
      setCreating(true)
      let payloadCards = newCards
      const needsResolve = payloadCards.some(c => !c.imageUrl || !c.code)
      if (needsResolve && payloadCards.length > 0) {
        const res = await fetch('/api/cards/resolve', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards: payloadCards })
        })
        if (res.ok) {
          const data = await res.json()
          payloadCards = data.cards || payloadCards
        }
      }
      const created = await apiClient.post<{ id: string }>(
        '/api/decks',
        { name: newName || 'Novo Deck', description: newDescription, format: newFormat, cards: payloadCards }
      )
      setShowCreateModal(false)
      setNewName(''); setNewDescription(''); setNewFormat('Standard'); setNewCards([]); setImportText('')
      if (created?.id) router.push(`/decks/${created.id}/edit`)
      else router.push('/decks')
    } catch (e) {
      alert('Erro ao criar deck')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pokemon-blue"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Erro ao carregar decks
          </h3>
          <p className="text-white/80 mb-6">{error}</p>
          <button onClick={fetchDecks} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Meus Decks
            </h1>
            <p className="text-white/80">
              Gerencie seus decks do Pokémon TCG
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Novo Deck</span>
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎴</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum deck encontrado
            </h3>
            <p className="text-white/80 mb-6">
              Crie seu primeiro deck para começar a jogar!
            </p>
            <Link href="/decks/new" className="btn-primary">
              Criar Primeiro Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <DeckCardComponent key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Novo Deck</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setImportOpen(!importOpen)} className="btn-secondary text-sm whitespace-nowrap">{importOpen? 'Ocultar importação' : '+ Importar deck'}</button>
                <button onClick={handleCreate} disabled={creating} className="btn-primary text-sm disabled:opacity-50 whitespace-nowrap">{creating? 'Criando...' : 'Criar Deck'}</button>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {!importOpen && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Deck</label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                    <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue">
                      <option value="Standard">Standard</option>
                      <option value="Expanded">Expanded</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>
                </>
              )}

              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">Resumo do Deck</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total de cartas:</span>
                    <span className={`${newCards.reduce((s,c)=>s+c.quantity,0)===60?'text-green-600':'text-red-600'} font-medium`}>
                      {newCards.reduce((s,c)=>s+c.quantity,0)}/60
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cartas únicas:</span>
                    <span className="font-medium">{newCards.length}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Regras do Deck:</h5>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Exatamente 60 cartas</li>
                    <li>• Máximo 4 cópias de cada carta</li>
                    <li>• Energia básica: sem limite</li>
                  </ul>
                </div>
                {/* Erros */}
                {(() => { const v = validateDeckFormat({ id:'', name:newName||'Novo Deck', description:newDescription, format:newFormat, cards:newCards as any, matches:[], createdAt:new Date(), updatedAt:new Date() });
                  return !v.isValid ? (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <h5 className="text-xs font-medium text-red-600 mb-1">Erros:</h5>
                    <ul className="text-xs text-red-500 space-y-1">{v.errors.map((e,i)=>(<li key={i}>• {e}</li>))}</ul>
                  </div>) : null })()}
              </div>

              {/* Importar */}
              <div>
                {importOpen && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-500">Cole e importe o deck – será criado automaticamente e você será redirecionado para edição.</p>
                    <textarea value={importText} onChange={(e)=>setImportText(e.target.value)} rows={12} className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue" placeholder={'Pokémon: 19\n4 N\'s Zorua JTG 97\n...'} />
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>{ setImportText(''); setImportOpen(false) }} className="btn-secondary text-sm">Cancelar</button>
                      <button onClick={handleImportText} disabled={!importText.trim() || creating} className="btn-primary text-sm disabled:opacity-50">{creating? 'Importando...' : 'Importar e Criar'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
              <button onClick={()=>setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary disabled:opacity-50">{creating? 'Criando...' : 'Criar Deck'}</button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
