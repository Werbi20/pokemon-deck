'use client'

import { DeckAnalysis, DeckSuggestion } from '@/lib/deckAnalysis'
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
  Cell
} from 'recharts'

interface DeckAnalysisProps {
  analysis: DeckAnalysis
}

export default function DeckAnalysisComponent({ analysis }: DeckAnalysisProps) {
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-600 bg-red-50 border-red-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'success': return '✅'
      default: return '📝'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Precisa Melhorar'
  }

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Avaliação Geral do Deck
        </h2>
        <div className="flex items-center space-x-4">
          <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}
          </div>
          <div>
            <div className={`text-lg font-medium ${getScoreColor(analysis.overallScore)}`}>
              {getScoreLabel(analysis.overallScore)}
            </div>
            <div className="text-sm text-gray-600">
              Pontuação baseada na análise completa
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curva de Energia */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Curva de Energia
          </h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Custo médio: {analysis.energyCurve.averageEnergyCost}
            </div>
            <div className="text-sm text-gray-600">
              {analysis.energyCurve.recommendation}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analysis.energyCurve.energyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cost" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Cartas']}
                labelFormatter={(label) => `Custo ${label}`}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Tipos */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição de Tipos
          </h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Tipo dominante: {analysis.typeDistribution.dominantType}
            </div>
            <div className="text-sm text-gray-600">
              {analysis.typeDistribution.recommendation}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analysis.typeDistribution.typeCounts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analysis.typeDistribution.typeCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição de Raridades */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribuição de Raridades
        </h3>
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            {analysis.rarityDistribution.recommendation}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analysis.rarityDistribution.rarityCounts.map((rarity) => (
            <div key={rarity.rarity} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">{rarity.count}</div>
              <div className="text-sm text-gray-600">{rarity.rarity}</div>
              <div className="text-xs text-gray-500">{rarity.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sugestões */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Sugestões de Melhoria
        </h3>
        {analysis.suggestions.length === 0 ? (
          <div className="text-center py-4 text-green-600">
            ✅ Seu deck está bem balanceado!
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.suggestions
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {suggestion.priority === 'high' ? 'Alta' :
                           suggestion.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <p className="text-sm">{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
