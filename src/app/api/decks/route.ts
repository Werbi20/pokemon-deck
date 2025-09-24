import { NextRequest, NextResponse } from 'next/server'
import { getDecks, createDeck } from '@/lib/firestore'
import { importDeckFromText } from '@/lib/deckUtils'
import { ensureDemoSeed } from '@/lib/demoSeed'
import { withAuth } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
  ensureDemoSeed(userId)
  const decks = await getDecks(userId)
      return NextResponse.json(decks)
    } catch (error) {
      console.error('Erro ao buscar decks:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const { name, description, format, cards, importText } = body

      ensureDemoSeed(userId)

      // Se veio texto de importação, parsear e sobrescrever estrutura
      let finalName = name as string | undefined
      let finalFormat = format as string | undefined
      let finalCards = cards as any[] | undefined

      if (importText && typeof importText === 'string') {
        const parsed = importDeckFromText(importText)
        if (!finalName) finalName = parsed.name || 'Imported Deck'
        if (!finalFormat) finalFormat = parsed.format || 'Standard'
        if (!finalCards || finalCards.length === 0) finalCards = parsed.cards as any[]
      }

      // Garantir nome base
      finalName = (finalName && finalName.trim()) || 'Imported Deck'
      finalFormat = finalFormat || 'Standard'

      // Buscar decks existentes para gerar nome único
      const existing = await getDecks(userId)
      const existingNames = new Set(existing.map(d => d.name.toLowerCase()))
      if (existingNames.has(finalName.toLowerCase())) {
        let counter = 2
        const base = finalName
        while (existingNames.has(`${base} (${counter})`.toLowerCase())) counter++
        finalName = `${base} (${counter})`
      }

      const deckId = await createDeck(userId, {
        name: finalName,
        description: description || '',
        format: finalFormat,
        cards: (finalCards || []).map((c: any) => ({
          id: c.id || '',
            name: c.name,
            imageUrl: c.imageUrl || '',
            code: c.code || '',
            setCode: c.setCode,
            quantity: c.quantity || 1
        })) as any
      } as any)

      return NextResponse.json({ id: deckId, name: finalName }, { status: 201 })
    } catch (error) {
      console.error('Erro ao criar deck:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  })
}
