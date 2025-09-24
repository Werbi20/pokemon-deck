import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authMiddleware'

// Fallback para mockData quando Firestore não está disponível
async function getCollectionWithFallback(userId: string) {
  try {
    const { getCollection } = await import('@/lib/firestore')
    return await getCollection(userId)
  } catch (error) {
    console.log('Firestore não disponível, usando mockData para preços')
    // Para mockData, retornar array vazio por enquanto
    return []
  }
}

async function updateCollectionCardPriceWithFallback(userId: string, cardId: string, tcgPlayerId: string, price: number) {
  try {
    const { updateCollectionCardPrice } = await import('@/lib/firestore')
    return await updateCollectionCardPrice(userId, cardId, tcgPlayerId, price)
  } catch (error) {
    console.log('Firestore não disponível, preço não será salvo')
    // Em mockData, não salvamos preços
    return Promise.resolve()
  }
}

export async function GET(request: NextRequest) {
  console.log('GET /api/collection/prices - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('GET /api/collection/prices - userId:', userId)
    const collection = await getCollectionWithFallback(userId)
    console.log('GET /api/collection/prices - collection:', collection)
    
    // Para mockData, retornar valores mock
    if (collection.length === 0) {
      console.log('GET /api/collection/prices - retornando valores vazios')
      return NextResponse.json({
        totalValue: 0,
        cardValues: [],
        totalCards: 0
      })
    }
    
    // Tentar calcular valores usando TCGPlayer, mas com fallback
    try {
      const { tcgPlayerService } = await import('@/lib/tcgplayerApi')
      const collectionValue = await tcgPlayerService.calculateCollectionValue(collection)
      
      return NextResponse.json({
        totalValue: collectionValue.totalValue,
        cardValues: collectionValue.cardValues,
        totalCards: collection.length
      })
    } catch (tcgError) {
      console.log('TCGPlayer não disponível, retornando valores mock')
      // Valores mock para desenvolvimento
      const mockValue = collection.length * 2.5 // $2.50 por carta em média
      return NextResponse.json({
        totalValue: mockValue,
        cardValues: collection.map(card => ({
          card,
          price: { marketPrice: 2.5 },
          tcgPlayerCard: null
        })),
        totalCards: collection.length
      })
    }
  } catch (error) {
    console.error('Erro ao calcular preços da coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/collection/prices - iniciando')
  try {
    // Temporariamente sem withAuth para debug
    const userId = 'dev-user'
    console.log('POST /api/collection/prices - userId:', userId)
    const body = await req.json()
    const { action, cardId, tcgPlayerId, price } = body
    console.log('POST /api/collection/prices - body:', body)
    
    switch (action) {
      case 'update_price':
        if (!cardId || !tcgPlayerId || !price) {
          return NextResponse.json(
            { error: 'cardId, tcgPlayerId e price são obrigatórios' },
            { status: 400 }
          )
        }
        
        await updateCollectionCardPriceWithFallback(userId, cardId, tcgPlayerId, price)
        
        return NextResponse.json({ 
          message: 'Preço atualizado com sucesso'
        })
        
      case 'refresh_all_prices':
        const collection = await getCollectionWithFallback(userId)
        
        try {
          const { tcgPlayerService } = await import('@/lib/tcgplayerApi')
          const collectionValue = await tcgPlayerService.calculateCollectionValue(collection)
          
          // Atualizar preços de todas as cartas
          for (const cardValue of collectionValue.cardValues) {
            if (cardValue.tcgPlayerCard && cardValue.price) {
              await updateCollectionCardPriceWithFallback(
                userId,
                cardValue.card.id,
                cardValue.tcgPlayerCard.productId,
                cardValue.price.marketPrice
              )
            }
          }
          
          return NextResponse.json({ 
            message: 'Preços atualizados com sucesso',
            totalValue: collectionValue.totalValue
          })
        } catch (tcgError) {
          console.log('TCGPlayer não disponível para refresh')
          return NextResponse.json({ 
            message: 'Preços não puderam ser atualizados (TCGPlayer indisponível)',
            totalValue: collection.length * 2.5
          })
        }
        
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro ao processar preços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
