'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'

interface DashboardStats {
  totalDecks: number
  totalMatches: number
  winRate: number
  totalCollections: number
  collectionValue: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'decks' | 'matches' | 'collections' | 'stats'>('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados básicos
      const [decks, matches, collections] = await Promise.all([
        apiClient.get('/api/decks').catch(() => []),
        apiClient.get('/api/matches').catch(() => []),
        apiClient.get('/api/collection').catch(() => [])
      ])

      // Calcular estatísticas simples
      const matchesArray = Array.isArray(matches) ? matches : []
      const decksArray = Array.isArray(decks) ? decks : []
      const collectionsArray = Array.isArray(collections) ? collections : []
      
      const wins = matchesArray.filter((match: any) => match.result === 'win').length
      const winRate = matchesArray.length > 0 ? (wins / matchesArray.length) * 100 : 0
      const collectionValue = collectionsArray.reduce((sum: number, collection: any) => sum + (collection.currentPrice || 0), 0)

      setStats({
        totalDecks: decksArray.length,
        totalMatches: matchesArray.length,
        winRate,
        totalCollections: collectionsArray.length,
        collectionValue
      })
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
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
            Erro ao carregar dados
          </h3>
          <p className="text-white/80 mb-6">{error}</p>
          <button onClick={loadData} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-white/80">
            Bem-vindo ao seu gerenciador de decks Pokémon TCG
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="bg-white rounded-lg p-1">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'decks', label: 'Decks', icon: '🎴' },
              { id: 'matches', label: 'Partidas', icon: '⚔️' },
              { id: 'collections', label: 'Coleções', icon: '📦' },
              { id: 'stats', label: 'Estatísticas', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pokemon-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats?.totalDecks || 0}</div>
                <div className="text-sm text-gray-600">Decks Criados</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats?.totalMatches || 0}</div>
                <div className="text-sm text-gray-600">Partidas Jogadas</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{stats?.winRate.toFixed(1) || 0}%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{stats?.totalCollections || 0}</div>
                <div className="text-sm text-gray-600">Cartas na Coleção</div>
              </div>
            </div>

            {/* Valor da Coleção */}
            {stats && stats.collectionValue > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Valor da Coleção
                </h2>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.collectionValue)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Valor total das suas cartas
                </p>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/decks/new" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🎴</div>
                <div className="font-medium text-gray-800">Novo Deck</div>
              </Link>
              
              <Link href="/matches" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="font-medium text-gray-800">Registrar Partida</div>
              </Link>
              
              <Link href="/collection/add" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📦</div>
                <div className="font-medium text-gray-800">Adicionar Cartas</div>
              </Link>
              
              <Link href="/stats" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium text-gray-800">Ver Estatísticas</div>
              </Link>
            </div>

            {/* Mensagem de Boas-vindas */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎉 Bem-vindo ao Pokémon TCG Deck Manager!
              </h2>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro deck ou explore as funcionalidades disponíveis.
              </p>
              <div className="flex space-x-4">
                <Link href="/decks/new" className="btn-primary">
                  Criar Primeiro Deck
                </Link>
                <Link href="/collection/add" className="btn-secondary">
                  Adicionar Cartas
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Meus Decks</h2>
              <Link href="/decks/new" className="btn-primary">
                ➕ Novo Deck
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎴</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Gerenciar Decks
                </h3>
                <p className="text-gray-600 mb-4">
                  Acesse o gerenciador completo de decks
                </p>
                <Link href="/decks" className="btn-primary">
                  Ver Todos os Decks
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Partidas</h2>
              <Link href="/matches" className="btn-primary">
                ➕ Nova Partida
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Registrar Partidas
                </h3>
                <p className="text-gray-600 mb-4">
                  Registre suas partidas e acompanhe seu progresso
                </p>
                <Link href="/matches" className="btn-primary">
                  Ver Partidas
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Coleção</h2>
              <Link href="/collection/add" className="btn-primary">
                ➕ Adicionar Cartas
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Gerenciar Coleção
                </h3>
                <p className="text-gray-600 mb-4">
                  Acesse o gerenciador completo de coleção
                </p>
                <Link href="/collection" className="btn-primary">
                  Ver Coleção Completa
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Estatísticas</h2>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Estatísticas Detalhadas
                </h3>
                <p className="text-gray-600 mb-4">
                  Veja estatísticas detalhadas e gráficos
                </p>
                <Link href="/stats" className="btn-primary">
                  Ver Estatísticas Completas
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
