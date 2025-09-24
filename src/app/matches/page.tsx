'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/apiClient'
import { Deck, Match } from '@/types'

export default function MatchesPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<string>('')
  const [matchResult, setMatchResult] = useState<'win' | 'lose' | 'draw'>('win')
  const [matchNotes, setMatchNotes] = useState('')
  const [eventType, setEventType] = useState<'treino' | 'liga' | 'challenge' | 'cup' | 'regional' | 'intercontinental' | 'mundial'>('liga')
  const [opponentDeck, setOpponentDeck] = useState<string>('')
  const [endedByTime, setEndedByTime] = useState<boolean>(false)
  const [date, setDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    fetchDecks()
    fetchMatches()
  }, [])

  const fetchDecks = async () => {
    try {
      const data = await apiClient.get<Deck[]>('/api/decks')
      setDecks(data)
    } catch (error) {
      console.error('Erro ao carregar decks:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      const data = await apiClient.get<Match[]>('/api/matches')
      setMatches(data)
    } catch (error) {
      console.error('Erro ao carregar partidas:', error)
    }
  }

  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeck) return

    setLoading(true)
    try {
      await apiClient.post('/api/matches', {
        deckId: selectedDeck,
        result: matchResult,
        notes: matchNotes,
        eventType,
        opponentDeck,
        endedByTime,
        date: date || undefined,
      })

      setMatchNotes('')
      setOpponentDeck('')
      setEndedByTime(false)
      fetchMatches()
      fetchDecks() // Atualizar estatísticas dos decks
    } catch (error) {
      console.error('Erro ao registrar partida:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Registrar Partidas
        </h1>
        <p className="text-white/80">
          Registre suas vitórias e derrotas para acompanhar suas estatísticas
        </p>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário para registrar partida */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Nova Partida
          </h2>
          <form onSubmit={handleSubmitMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deck utilizado
              </label>
              <select
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                required
              >
                <option value="">Selecione um deck</option>
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name} ({deck.format})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="win"
                    checked={matchResult === 'win'}
                    onChange={(e) => setMatchResult(e.target.value as 'win' | 'lose' | 'draw')}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Vitória</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="lose"
                    checked={matchResult === 'lose'}
                    onChange={(e) => setMatchResult(e.target.value as 'win' | 'lose' | 'draw')}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Derrota</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="draw"
                    checked={matchResult === 'draw'}
                    onChange={(e) => setMatchResult(e.target.value as 'win' | 'lose' | 'draw')}
                    className="mr-2"
                  />
                  <span className="text-gray-600 font-medium">Empate</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Torneio</label>
              <select
                value={eventType}
                onChange={(e)=>setEventType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="treino">Treino</option>
                <option value="liga">Liga Semanal</option>
                <option value="challenge">Challenge</option>
                <option value="cup">Cup</option>
                <option value="regional">Regional</option>
                <option value="intercontinental">Intercontinental</option>
                <option value="mundial">Mundial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deck do Oponente</label>
              <input
                type="text"
                value={opponentDeck}
                onChange={(e)=>setOpponentDeck(e.target.value)}
                placeholder="Ex.: Charizard ex, Miraidon, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e)=>setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                />
              </div>
              <div className="flex items-center mt-7">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={endedByTime} onChange={(e)=>setEndedByTime(e.target.checked)} />
                  Empate/resultado por tempo
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                rows={3}
                placeholder="Anote detalhes sobre a partida..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDeck}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Partida'}
            </button>
          </form>
        </div>

        {/* Histórico de partidas */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Histórico de Partidas
          </h2>
          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma partida registrada ainda
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">
                        {match.deck.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(match.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${
                      match.result === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {match.result === 'win' ? 'Vitória' : 'Derrota'}
                    </span>
                    {match.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {match.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
