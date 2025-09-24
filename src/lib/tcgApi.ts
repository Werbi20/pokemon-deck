import { PokemonCard } from '@/types'

// Base da API oficial
const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2'

// Sempre via variável de ambiente (nunca hardcode)
const API_KEY = process.env.POKEMON_TCG_API_KEY

// Controle de cache simples em memória para endpoints estáticos
interface CacheEntry<T> {
  data: T
  expires: number
}

const memoryCache: Record<string, CacheEntry<any>> = {}

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache[key]
  if (!entry) return null
  if (Date.now() > entry.expires) {
    delete memoryCache[key]
    return null
  }
  return entry.data as T
}

function setInCache<T>(key: string, data: T, ttlMs: number) {
  memoryCache[key] = { data, expires: Date.now() + ttlMs }
}

export interface SearchCardsParams {
  q?: string
  page?: number
  pageSize?: number
  orderBy?: string
  // Filtros estruturados (serão incorporados em uma única query q)
  set?: string
  rarity?: string
  types?: string
  subtypes?: string
  hp?: string
  retreatCost?: string
  convertedRetreatCost?: string
  attackCost?: string
  attackDamage?: string
  weakness?: string
  resistance?: string
  nationalPokedexNumbers?: string
  legalities?: string
  regulationMark?: string
}

export interface SearchCardsResponse {
  data: PokemonCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

export class PokemonTCGApi {
  private apiKey?: string
  private static MAX_RETRIES = 3
  private static RETRY_BASE_DELAY = 300 // ms

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${POKEMON_TCG_API_BASE}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    if (this.apiKey) headers['X-Api-Key'] = this.apiKey

    let lastError: any
    for (let attempt = 0; attempt <= PokemonTCGApi.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url.toString(), { headers })
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          // Rate limit ou erro transitório
            if (attempt < PokemonTCGApi.MAX_RETRIES) {
              const delay = (2 ** attempt) * PokemonTCGApi.RETRY_BASE_DELAY
              await new Promise(r => setTimeout(r, delay))
              continue
            }
        }
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        return response.json() as Promise<T>
      } catch (err) {
        lastError = err
        if (attempt === PokemonTCGApi.MAX_RETRIES) break
        const delay = (2 ** attempt) * PokemonTCGApi.RETRY_BASE_DELAY
        await new Promise(r => setTimeout(r, delay))
      }
    }
    throw lastError || new Error('Unknown API error')
  }

  // Constrói a query única (q) conforme especificação da API
  private buildQuery(params: SearchCardsParams): string | undefined {
    const clauses: string[] = []
    if (params.q) clauses.push(params.q)
    if (params.set) clauses.push(`set.id:${params.set}`)
    if (params.rarity) clauses.push(`rarity:"${params.rarity}"`)
    if (params.types) clauses.push(`types:${params.types}`)
    if (params.subtypes) clauses.push(`subtypes:${params.subtypes}`)
    if (params.hp) clauses.push(`hp:${params.hp}`)
    if (params.retreatCost) clauses.push(`retreatCost:${params.retreatCost}`)
    if (params.convertedRetreatCost) clauses.push(`convertedRetreatCost:${params.convertedRetreatCost}`)
    if (params.attackCost) clauses.push(`attacks.cost:${params.attackCost}`)
    if (params.attackDamage) clauses.push(`attacks.damage:${params.attackDamage}`)
    if (params.weakness) clauses.push(`weaknesses.type:${params.weakness}`)
    if (params.resistance) clauses.push(`resistances.type:${params.resistance}`)
    if (params.nationalPokedexNumbers) clauses.push(`nationalPokedexNumbers:${params.nationalPokedexNumbers}`)
    if (params.legalities) clauses.push(`legalities.${params.legalities.toLowerCase()}:Legal`)
    if (params.regulationMark) clauses.push(`regulationMark:${params.regulationMark}`)
    return clauses.length ? clauses.join(' ') : undefined
  }

  async searchCards(params: SearchCardsParams = {}): Promise<SearchCardsResponse> {
    const { page = 1, pageSize = 20, orderBy = 'name' } = params
    const q = this.buildQuery(params)
    const searchParams: Record<string, any> = { page, pageSize, orderBy }
    if (q) searchParams.q = q
    return this.makeRequest<SearchCardsResponse>('/cards', searchParams)
  }

  async getCardById(id: string): Promise<{ data: PokemonCard }> {
    return this.makeRequest<{ data: PokemonCard }>(`/cards/${id}`)
  }

  async getSets(): Promise<{ data: Array<{ id: string; name: string; series: string; ptcgoCode?: string }> }> {
    const cacheKey = 'sets'
    const cached = getFromCache<{ data: Array<{ id: string; name: string; series: string; ptcgoCode?: string }> }>(cacheKey)
    if (cached) return cached
    const data = await this.makeRequest<{ data: Array<{ id: string; name: string; series: string; ptcgoCode?: string }> }>('/sets')
    setInCache(cacheKey, data, 6 * 60 * 60 * 1000) // 6 horas
    return data
  }

  async getTypes(): Promise<{ data: string[] }> {
    const cacheKey = 'types'
    const cached = getFromCache<{ data: string[] }>(cacheKey)
    if (cached) return cached
    const data = await this.makeRequest<{ data: string[] }>('/types')
    setInCache(cacheKey, data, 6 * 60 * 60 * 1000)
    return data
  }

  async getSubtypes(): Promise<{ data: string[] }> {
    const cacheKey = 'subtypes'
    const cached = getFromCache<{ data: string[] }>(cacheKey)
    if (cached) return cached
    const data = await this.makeRequest<{ data: string[] }>('/subtypes')
    setInCache(cacheKey, data, 6 * 60 * 60 * 1000)
    return data
  }
}

// Instância singleton da API
export const pokemonTCGApi = new PokemonTCGApi(API_KEY)
