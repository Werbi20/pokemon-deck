'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { Deck, WinRateStats } from '@/types'
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

export default function StatsPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const data = await apiClient.get<Deck[]>('/api/decks')
      setDecks(data)
    } catch (error) {
      console.error('Erro ao carregar decks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas de win rate
  const calculateWinRateStats = (): WinRateStats[] => {
    return decks.map(deck => {
      const wins = deck.matches.filter(match => match.result === 'win').length
      const losses = deck.matches.filter(match => match.result === 'lose').length
      const totalMatches = wins + losses
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

      return {
        deckId: deck.id,
        deckName: deck.name,
        totalMatches,
        wins,
        losses,
        winRate
      }
    }).filter(stat => stat.totalMatches > 0) // Apenas decks com partidas
  }

  const winRateStats = calculateWinRateStats()

  // Dados para gráfico de pizza (vitórias vs derrotas)
  const totalWins = winRateStats.reduce((sum, stat) => sum + stat.wins, 0)
  const totalLosses = winRateStats.reduce((sum, stat) => sum + stat.losses, 0)
  
  const pieData = [
    { name: 'Vitórias', value: totalWins, color: '#22C55E' },
    { name: 'Derrotas', value: totalLosses, color: '#EF4444' }
  ]

  // Dados para gráfico de linha (evolução do win rate ao longo do tempo)
  const getWinRateOverTime = () => {
    const allMatches = decks.flatMap(deck => 
      deck.matches.map(match => ({
        ...match,
        deckName: deck.name
      }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const winRateOverTime = []
    let cumulativeWins = 0
    let cumulativeMatches = 0

    allMatches.forEach((match, index) => {
      cumulativeMatches++
      if (match.result === 'win') {
        cumulativeWins++
      }
      
      const winRate = Math.round((cumulativeWins / cumulativeMatches) * 100)
      
      winRateOverTime.push({
        match: index + 1,
        winRate,
        date: new Date(match.date).toLocaleDateString('pt-BR')
      })
    })

    return winRateOverTime
  }

  const winRateOverTime = getWinRateOverTime()

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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Estatísticas
        </h1>
        <p className="text-white/80">
          Acompanhe seu desempenho e evolução nos jogos
        </p>
      </div>

      {winRateStats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma estatística disponível
          </h3>
          <p className="text-white/80">
            Registre algumas partidas para ver suas estatísticas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Win Rate por Deck */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Win Rate por Deck
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winRateStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="deckName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Win Rate']}
                  labelFormatter={(label) => `Deck: ${label}`}
                />
                <Bar 
                  dataKey="winRate" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição Vitórias vs Derrotas */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Vitórias vs Derrotas
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
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

          {/* Evolução do Win Rate */}
          {winRateOverTime.length > 1 && (
            <div className="bg-white rounded-lg p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Evolução do Win Rate
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={winRateOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="match" 
                    label={{ value: 'Partida', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Win Rate']}
                    labelFormatter={(label) => `Partida ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="winRate" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Resumo das Estatísticas */}
          <div className="bg-white rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Resumo Geral
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalWins}</div>
                <div className="text-sm text-green-600">Vitórias</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{totalLosses}</div>
                <div className="text-sm text-red-600">Derrotas</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalWins + totalLosses}
                </div>
                <div className="text-sm text-blue-600">Total de Partidas</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalWins + totalLosses > 0 
                    ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-purple-600">Win Rate Geral</div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
