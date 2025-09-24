'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { CollectionRanking } from '@/types'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

export default function RankingPage() {
  const [rankings, setRankings] = useState<CollectionRanking[]>([])
  const [userRank, setUserRank] = useState<any>(null)
  const [valueHistory, setValueHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Buscar ranking geral
      const rankingsData = await apiClient.get<CollectionRanking[]>('/api/collection/ranking')
      setRankings(rankingsData)
      
      // Buscar ranking do usuário atual
      const userProfile = await apiClient.get('/api/profiles')
      setCurrentUser(userProfile)
      
      if (userProfile) {
        const userRankData = await apiClient.get(`/api/collection/ranking?userId=${userProfile.userId}`)
        setUserRank(userRankData.userRank)
        setValueHistory(userRankData.valueHistory)
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600'
    if (rank === 2) return 'text-gray-500'
    if (rank === 3) return 'text-amber-600'
    if (rank <= 10) return 'text-blue-600'
    if (rank <= 50) return 'text-green-600'
    return 'text-gray-600'
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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Ranking de Coleções
          </h1>
          <p className="text-white/80">
            Veja quem tem as coleções mais valiosas da comunidade
          </p>
        </div>

        {/* Ranking do Usuário Atual */}
        {userRank && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Seu Ranking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getRankColor(userRank.rank)}`}>
                  {getRankIcon(userRank.rank)}
                </div>
                <div className="text-sm text-gray-600">Posição</div>
                <div className="text-lg font-semibold text-gray-800">
                  {userRank.rank}º de {userRank.totalUsers}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {userRank.percentile}%
                </div>
                <div className="text-sm text-gray-600">Percentil</div>
                <div className="text-lg font-semibold text-gray-800">
                  Melhor que {userRank.percentile}% dos usuários
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {currentUser?.stats?.collectionValue ? formatCurrency(currentUser.stats.collectionValue) : '$0.00'}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
                <div className="text-lg font-semibold text-gray-800">
                  {currentUser?.stats?.totalCards || 0} cartas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Evolução do Valor */}
        {valueHistory.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Evolução do Valor da Sua Coleção (30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={valueHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top 10 Coleções */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top 10 Coleções Mais Valiosas
          </h3>
          <div className="space-y-4">
            {rankings.slice(0, 10).map((ranking) => (
              <div key={ranking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${getRankColor(ranking.rank)}`}>
                    {getRankIcon(ranking.rank)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{ranking.displayName}</h4>
                    <p className="text-sm text-gray-600">@{ranking.username}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {formatCurrency(ranking.totalValue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {ranking.totalCards} cartas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking Completo */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ranking Completo
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Posição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cartas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Última Atualização</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking) => (
                  <tr key={ranking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`font-bold ${getRankColor(ranking.rank)}`}>
                        {getRankIcon(ranking.rank)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{ranking.displayName}</div>
                        <div className="text-sm text-gray-500">@{ranking.username}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800">
                        {formatCurrency(ranking.totalValue)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{ranking.totalCards}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">
                        {new Date(ranking.lastUpdated).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{rankings.length}</div>
            <div className="text-sm text-gray-600">Usuários no Ranking</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {rankings.length > 0 ? formatCurrency(rankings[0].totalValue) : '$0.00'}
            </div>
            <div className="text-sm text-gray-600">Coleção Mais Valiosa</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + r.totalValue, 0) / rankings.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Valor Médio (USD)</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
