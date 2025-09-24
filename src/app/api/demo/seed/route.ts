import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authMiddleware'
import { mockDecks, mockMatches, addMockDeck, addMockMatch, addMockCollectionCard } from '@/lib/mockData'

export async function POST(request: NextRequest) {
  return withAuth(request, async (_req, userId) => {
    try {
      // Gerar alguns decks se poucos existirem
      if (mockDecks.length < 5) {
        addMockDeck({
          name: 'Demo Control Deck',
          description: 'Deck de controle para teste',
          format: 'Standard',
          cards: [
            { id: '', name: 'Pikachu VMAX', imageUrl: '', code: '44', setCode: 'SWSH4', quantity: 3 },
            { id: '', name: 'Pikachu V', imageUrl: '', code: '43', setCode: 'SWSH4', quantity: 4 },
            { id: '', name: 'Lightning Energy', imageUrl: '', code: '108', setCode: 'BASE', quantity: 12 }
          ],
          matches: []
        })
        addMockDeck({
          name: 'Demo Aggro Deck',
          description: 'Deck agressivo de demonstração',
          format: 'Standard',
          cards: [
            { id: '', name: 'Charizard VMAX', imageUrl: '', code: '20', setCode: 'SWSH4', quantity: 3 },
            { id: '', name: 'Charizard V', imageUrl: '', code: '19', setCode: 'SWSH4', quantity: 4 },
            { id: '', name: 'Fire Energy', imageUrl: '', code: '107', setCode: 'BASE', quantity: 12 }
          ],
          matches: []
        })
      }

      // Adicionar algumas partidas se poucas
      if (mockMatches.length < 10 && mockDecks.length > 0) {
        const sampleDeck = mockDecks[0]
        for (let i = 0; i < 5; i++) {
          addMockMatch({
            result: i % 2 === 0 ? 'win' : 'lose',
            date: new Date(Date.now() - i * 86400000),
            notes: `Partida demo ${i + 1}`,
            deckId: sampleDeck.id
          })
        }
      }

      // Adicionar algumas cartas na coleção do usuário
  addMockCollectionCard(userId, { name: 'Pikachu', imageUrl: '', code: '44', set: 'SWSH4', quantity: 2, rarity: 'Rare', types: ['Lightning'] })
  addMockCollectionCard(userId, { name: 'Charizard', imageUrl: '', code: '20', set: 'SWSH4', quantity: 1, rarity: 'Rare Holo', types: ['Fire'] })
  addMockCollectionCard(userId, { name: 'Ultra Ball', imageUrl: '', code: '196', set: 'SVI', quantity: 4, rarity: 'Uncommon', types: [] })

      return NextResponse.json({
        decks: mockDecks.length,
        matches: mockMatches.length,
        message: 'Seed demo aplicado'
      })
    } catch (e) {
      console.error('Erro seed demo:', e)
      return NextResponse.json({ error: 'Falha ao gerar seed' }, { status: 500 })
    }
  })
}
