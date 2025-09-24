import { TcgplayerApi } from '@api/tcgplayer'

// Configuração da API do TCGPlayer
const tcgplayerApi = new TcgplayerApi({
  apiKey: process.env.TCGPLAYER_API_KEY || 'your-api-key-here',
  baseUrl: 'https://api.tcgplayer.com'
})

export interface TCGPlayerCard {
  productId: number
  name: string
  cleanName: string
  imageUrl: string
  categoryId: number
  groupId: number
  url: string
  modifiedOn: string
  imageCount: number
  presaleInfo: any
  extendedData: any[]
}

export interface TCGPlayerPrice {
  productId: number
  lowPrice: number
  midPrice: number
  highPrice: number
  marketPrice: number
  directLowPrice: number
  subTypeName: string
  updatedAt: string
}

export interface TCGPlayerSet {
  setId: number
  name: string
  abbreviation: string
  publishDate: string
  modifiedOn: string
  description: string
  categoryId: number
  categoryName: string
  url: string
  imageUrl: string
}

export class TCGPlayerService {
  private api: TcgplayerApi

  constructor() {
    this.api = tcgplayerApi
  }

  // Buscar cartas por nome
  async searchCards(query: string, limit: number = 20): Promise<TCGPlayerCard[]> {
    try {
      const response = await this.api.catalog.searchProducts({
        q: query,
        limit: limit.toString(),
        categoryId: '1' // Pokémon TCG
      })
      
      return response.data?.results || []
    } catch (error) {
      console.error('Erro ao buscar cartas no TCGPlayer:', error)
      return []
    }
  }

  // Buscar preços de cartas específicas
  async getCardPrices(productIds: number[]): Promise<TCGPlayerPrice[]> {
    try {
      const response = await this.api.pricing.getProductPrices({
        productIds: productIds.join(',')
      })
      
      return response.data?.results || []
    } catch (error) {
      console.error('Erro ao buscar preços no TCGPlayer:', error)
      return []
    }
  }

  // Buscar preço de uma carta específica
  async getCardPrice(productId: number): Promise<TCGPlayerPrice | null> {
    try {
      const prices = await this.getCardPrices([productId])
      return prices[0] || null
    } catch (error) {
      console.error('Erro ao buscar preço da carta:', error)
      return null
    }
  }

  // Buscar sets disponíveis
  async getSets(): Promise<TCGPlayerSet[]> {
    try {
      const response = await this.api.catalog.getGroups({
        categoryId: '1' // Pokémon TCG
      })
      
      return response.data?.results || []
    } catch (error) {
      console.error('Erro ao buscar sets no TCGPlayer:', error)
      return []
    }
  }

  // Buscar produtos de um set específico
  async getSetProducts(setId: number, limit: number = 100): Promise<TCGPlayerCard[]> {
    try {
      const response = await this.api.catalog.getProducts({
        groupId: setId.toString(),
        limit: limit.toString()
      })
      
      return response.data?.results || []
    } catch (error) {
      console.error('Erro ao buscar produtos do set:', error)
      return []
    }
  }

  // Mapear carta do Pokémon TCG API para TCGPlayer
  async mapPokemonCardToTCGPlayer(pokemonCard: any): Promise<TCGPlayerCard | null> {
    try {
      // Buscar por nome da carta
      const searchResults = await this.searchCards(pokemonCard.name, 5)
      
      if (searchResults.length === 0) {
        return null
      }

      // Tentar encontrar a carta mais próxima
      const exactMatch = searchResults.find(card => 
        card.cleanName.toLowerCase() === pokemonCard.name.toLowerCase()
      )

      if (exactMatch) {
        return exactMatch
      }

      // Se não encontrar exato, retornar o primeiro resultado
      return searchResults[0]
    } catch (error) {
      console.error('Erro ao mapear carta:', error)
      return null
    }
  }

  // Calcular valor total de uma coleção
  async calculateCollectionValue(collection: any[]): Promise<{
    totalValue: number
    cardValues: Array<{
      card: any
      tcgPlayerCard: TCGPlayerCard | null
      price: TCGPlayerPrice | null
      totalValue: number
    }>
  }> {
    const cardValues: Array<{
      card: any
      tcgPlayerCard: TCGPlayerCard | null
      price: TCGPlayerPrice | null
      totalValue: number
    }> = []

    let totalValue = 0

    for (const collectionCard of collection) {
      try {
        // Mapear para TCGPlayer
        const tcgPlayerCard = await this.mapPokemonCardToTCGPlayer(collectionCard)
        
        if (tcgPlayerCard) {
          // Buscar preço
          const price = await this.getCardPrice(tcgPlayerCard.productId)
          
          if (price) {
            const cardValue = price.marketPrice * collectionCard.quantity
            totalValue += cardValue
            
            cardValues.push({
              card: collectionCard,
              tcgPlayerCard,
              price,
              totalValue: cardValue
            })
          } else {
            cardValues.push({
              card: collectionCard,
              tcgPlayerCard,
              price: null,
              totalValue: 0
            })
          }
        } else {
          cardValues.push({
            card: collectionCard,
            tcgPlayerCard: null,
            price: null,
            totalValue: 0
          })
        }
      } catch (error) {
        console.error('Erro ao calcular valor da carta:', error)
        cardValues.push({
          card: collectionCard,
          tcgPlayerCard: null,
          price: null,
          totalValue: 0
        })
      }
    }

    return {
      totalValue,
      cardValues
    }
  }
}

// Instância singleton
export const tcgPlayerService = new TCGPlayerService()
