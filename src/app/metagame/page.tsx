'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { Archetype, PublicDeck } from '@/types'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

export default function MetagamePage() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [publicDecks, setPublicDecks] = useState<PublicDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState('Standard')

  useEffect(() => {
    fetchData()
  }, [selectedFormat])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [archetypesResponse, decksResponse] = await Promise.all([
        apiClient.get<Archetype[]>('/api/archetypes'),
        apiClient.get<PublicDeck[]>(`/api/public-decks?format=${selectedFormat}&limit=100`)
      ])
      
      setArchetypes(archetypesResponse)
      setPublicDecks(decksResponse)
    } catch (error) {
      console.error('Erro ao carregar dados do metagame:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return '#ef4444' // red
      case 'A': return '#f97316' // orange
      case 'B': return '#eab308' // yellow
      case 'C': return '#22c55e' // green
      case 'D': return '#6b7280' // gray
      default: return '#6b7280'
    }
  }

  const getTierBgColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'bg-red-100 text-red-800'
      case 'A': return 'bg-orange-100 text-orange-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-green-100 text-green-800'
      case 'D': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calcular estatísticas do metagame
  const metaStats = archetypes.map(archetype => {
    const archetypeDecks = publicDecks.filter(deck => deck.archetype === archetype.name)
    const totalDecks = publicDecks.length
    const metaShare = totalDecks > 0 ? (archetypeDecks.length / totalDecks) * 100 : 0
    
    return {
      name: archetype.name,
      tier: archetype.tier,
      metaShare: Math.round(metaShare * 10) / 10,
      winRate: archetype.winRate,
      totalDecks: archetypeDecks.length,
      color: getTierColor(archetype.tier)
    }
  }).sort((a, b) => b.metaShare - a.metaShare)

  // Dados para gráfico de pizza
  const pieData = metaStats.slice(0, 8).map(item => ({
    name: item.name,
    value: item.metaShare,
    color: item.color
  }))

  // Dados para gráfico de linha (evolução do metagame)
  const lineData = metaStats.slice(0, 5).map(item => ({
    name: item.name,
    metaShare: item.metaShare,
    winRate: item.winRate
  }))

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Metagame Tracker
            </h1>
            <p className="text-white/80">
              Acompanhe o metagame atual do Pokémon TCG
            </p>
          </div>
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="Standard">Standard</option>
              <option value="Expanded">Expanded</option>
              <option value="Limited">Limited</option>
            </select>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{archetypes.length}</div>
            <div className="text-sm text-gray-600">Arquétipos Ativos</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{publicDecks.length}</div>
            <div className="text-sm text-gray-600">Decks Analisados</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {metaStats.length > 0 ? metaStats[0].metaShare : 0}%
            </div>
            <div className="text-sm text-gray-600">Arquétipo Dominante</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {metaStats.length > 0 ? Math.round(metaStats.reduce((sum, item) => sum + item.winRate, 0) / metaStats.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Win Rate Médio</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Meta Share */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribuição do Metagame
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metaStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Meta Share']}
                  labelFormatter={(label) => `Arquétipo: ${label}`}
                />
                <Bar dataKey="metaShare" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Top Arquétipos */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Top 8 Arquétipos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Arquétipos */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Tier List do Metagame
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Arquétipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Meta Share</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Win Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Decks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {archetypes.map((archetype) => {
                  const stats = metaStats.find(s => s.name === archetype.name)
                  return (
                    <tr key={archetype.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{archetype.name}</div>
                        <div className="text-sm text-gray-500">{archetype.playstyle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTierBgColor(archetype.tier)}`}>
                          {archetype.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${stats?.metaShare || 0}%`,
                                backgroundColor: getTierColor(archetype.tier)
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{stats?.metaShare || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">{archetype.winRate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{stats?.totalDecks || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {archetype.description}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartas-Chave dos Arquétipos */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Cartas-Chave dos Arquétipos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archetypes.slice(0, 6).map((archetype) => (
              <div key={archetype.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{archetype.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTierBgColor(archetype.tier)}`}>
                    {archetype.tier}
                  </span>
                </div>
                <div className="space-y-1">
                  {archetype.keyCards.slice(0, 3).map((card, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {card}
                    </div>
                  ))}
                  {archetype.keyCards.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{archetype.keyCards.length - 3} mais...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
