import { mockDecks, mockMatches } from '@/lib/mockData'

// Marca global para não repetir seed
const globalRef = globalThis as any
if (!globalRef.__DEMO_SEEDED__) {
  globalRef.__DEMO_SEEDED__ = false
}

export function ensureDemoSeed(userId: string) {
  if (globalRef.__DEMO_SEEDED__) return
  if (userId !== 'demo-user') return
  // Aqui poderíamos adaptar dados para o userId específico se necessário
  // No momento os mocks já incluem decks genéricos
  globalRef.__DEMO_SEEDED__ = true
}
