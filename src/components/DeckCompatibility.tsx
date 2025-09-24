'use client'

import { useState } from 'react'
import { Deck, DeckCard } from '@/types'
import { apiClient } from '@/lib/apiClient'

interface DeckCompatibilityProps {
  deck: Deck
}

interface CompatibilityResult {
  canBuild: boolean
  missingCards: Array<{
    name: string
    needed: number
    available: number
  }>
}

export default function DeckCompatibility({ deck }: DeckCompatibilityProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const checkCompatibility = async () => {
    setLoading(true)
    try {
      const result = await apiClient.post<CompatibilityResult>('/api/collection/compatibility', {
        deckCards: deck.cards
      })
      setCompatibility(result)
      setChecked(true)
    } catch (error) {
      console.error('Erro ao verificar compatibilidade:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Compatibilidade com Coleção
      </h3>
      
      {!checked ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Verifique se você pode montar este deck com suas cartas físicas
          </p>
          <button
            onClick={checkCompatibility}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar Compatibilidade'}
          </button>
        </div>
      ) : (
        <div>
          {compatibility?.canBuild ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✅</div>
              <h4 className="text-lg font-semibold text-green-600 mb-2">
                Você pode montar este deck!
              </h4>
              <p className="text-gray-600">
                Todas as cartas necessárias estão disponíveis na sua coleção
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center py-4 mb-4">
                <div className="text-4xl mb-2">❌</div>
                <h4 className="text-lg font-semibold text-red-600 mb-2">
                  Cartas em falta
                </h4>
                <p className="text-gray-600">
                  Você precisa de algumas cartas para montar este deck
                </p>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">Cartas necessárias:</h5>
                {compatibility?.missingCards.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{card.name}</span>
                      <div className="text-sm text-gray-600">
                        Necessário: {card.needed} | Disponível: {card.available}
                      </div>
                    </div>
                    <div className="text-red-600 font-medium">
                      Faltam: {card.needed - card.available}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setChecked(false)
                setCompatibility(null)
              }}
              className="btn-secondary"
            >
              Verificar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
