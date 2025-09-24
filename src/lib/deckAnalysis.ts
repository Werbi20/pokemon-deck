import { Deck, DeckCard } from '@/types'

export interface DeckAnalysis {
  energyCurve: EnergyCurveAnalysis
  typeDistribution: TypeDistributionAnalysis
  rarityDistribution: RarityDistributionAnalysis
  suggestions: DeckSuggestion[]
  overallScore: number
}

export interface EnergyCurveAnalysis {
  totalEnergy: number
  energyDistribution: Array<{ cost: number; count: number; percentage: number }>
  averageEnergyCost: number
  recommendation: string
}

export interface TypeDistributionAnalysis {
  totalTypes: number
  typeCounts: Array<{ type: string; count: number; percentage: number }>
  dominantType: string
  recommendation: string
}

export interface RarityDistributionAnalysis {
  totalRarities: number
  rarityCounts: Array<{ rarity: string; count: number; percentage: number }>
  recommendation: string
}

export interface DeckSuggestion {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

// Função para determinar o tipo de uma carta baseado no nome
function getCardType(cardName: string): string {
  const name = cardName.toLowerCase()
  
  // Energias básicas
  if (name.includes('energy') && !name.includes('special')) {
    return 'Energy'
  }
  
  // Energias especiais
  if (name.includes('special') || name.includes('double') || name.includes('rainbow')) {
    return 'Special Energy'
  }
  
  // Pokémon
  if (name.includes('ex') || name.includes('gx') || name.includes('v') || name.includes('vmax') || name.includes('vstar')) {
    return 'Pokémon EX/GX/V'
  }
  
  // Treinadores
  if (name.includes('professor') || name.includes('research') || name.includes('ball') || 
      name.includes('switch') || name.includes('escape') || name.includes('nest') ||
      name.includes('ultra') || name.includes('great') || name.includes('poke') ||
      name.includes('supporter') || name.includes('item') || name.includes('stadium')) {
    return 'Trainer'
  }
  
  // Pokémon básicos (assumindo que não são energias ou treinadores)
  return 'Pokémon'
}

// Função para determinar a raridade baseada no nome
function getCardRarity(cardName: string): string {
  const name = cardName.toLowerCase()
  
  if (name.includes('ex') || name.includes('gx') || name.includes('vmax') || name.includes('vstar')) {
    return 'Rare Holo EX/GX/V'
  }
  
  if (name.includes('v')) {
    return 'Rare Holo V'
  }
  
  if (name.includes('energy')) {
    return 'Common'
  }
  
  if (name.includes('professor') || name.includes('research') || name.includes('ball')) {
    return 'Uncommon'
  }
  
  // Assumir comum para cartas não identificadas
  return 'Common'
}

// Função para estimar o custo de energia de uma carta
function estimateEnergyCost(cardName: string): number {
  const name = cardName.toLowerCase()
  
  // Energias básicas custam 0
  if (name.includes('energy') && !name.includes('special')) {
    return 0
  }
  
  // Energias especiais custam 1
  if (name.includes('special') || name.includes('double') || name.includes('rainbow')) {
    return 1
  }
  
  // Treinadores custam 0
  if (name.includes('professor') || name.includes('research') || name.includes('ball') || 
      name.includes('switch') || name.includes('escape') || name.includes('nest') ||
      name.includes('ultra') || name.includes('great') || name.includes('poke') ||
      name.includes('supporter') || name.includes('item') || name.includes('stadium')) {
    return 0
  }
  
  // Pokémon EX/GX/V tendem a ter custos mais altos
  if (name.includes('ex') || name.includes('gx') || name.includes('vmax') || name.includes('vstar')) {
    return 3 // Estimativa média
  }
  
  if (name.includes('v')) {
    return 2 // Estimativa média
  }
  
  // Pokémon básicos
  return 1 // Estimativa média
}

export function analyzeDeck(deck: Deck): DeckAnalysis {
  const energyCurve = analyzeEnergyCurve(deck.cards)
  const typeDistribution = analyzeTypeDistribution(deck.cards)
  const rarityDistribution = analyzeRarityDistribution(deck.cards)
  const suggestions = generateSuggestions(deck, energyCurve, typeDistribution, rarityDistribution)
  const overallScore = calculateOverallScore(energyCurve, typeDistribution, rarityDistribution)

  return {
    energyCurve,
    typeDistribution,
    rarityDistribution,
    suggestions,
    overallScore
  }
}

function analyzeEnergyCurve(cards: DeckCard[]): EnergyCurveAnalysis {
  const energyDistribution: Array<{ cost: number; count: number; percentage: number }> = []
  let totalEnergy = 0
  
  // Contar cartas por custo de energia
  const costCounts = new Map<number, number>()
  
  cards.forEach(card => {
    const cost = estimateEnergyCost(card.name)
    const currentCount = costCounts.get(cost) || 0
    costCounts.set(cost, currentCount + card.quantity)
    totalEnergy += card.quantity
  })
  
  // Converter para array e calcular percentuais
  costCounts.forEach((count, cost) => {
    energyDistribution.push({
      cost,
      count,
      percentage: Math.round((count / totalEnergy) * 100)
    })
  })
  
  // Ordenar por custo
  energyDistribution.sort((a, b) => a.cost - b.cost)
  
  // Calcular custo médio
  const averageEnergyCost = energyDistribution.reduce((sum, item) => sum + (item.cost * item.count), 0) / totalEnergy
  
  // Gerar recomendação
  let recommendation = ''
  const lowCostCards = energyDistribution.filter(item => item.cost <= 1).reduce((sum, item) => sum + item.count, 0)
  const lowCostPercentage = (lowCostCards / totalEnergy) * 100
  
  if (lowCostPercentage < 30) {
    recommendation = 'Considere adicionar mais cartas de baixo custo para melhorar a curva de energia'
  } else if (lowCostPercentage > 70) {
    recommendation = 'Muitas cartas de baixo custo. Considere adicionar algumas cartas mais poderosas'
  } else {
    recommendation = 'Boa distribuição de custos de energia'
  }
  
  return {
    totalEnergy,
    energyDistribution,
    averageEnergyCost: Math.round(averageEnergyCost * 100) / 100,
    recommendation
  }
}

function analyzeTypeDistribution(cards: DeckCard[]): TypeDistributionAnalysis {
  const typeCounts: Array<{ type: string; count: number; percentage: number }> = []
  let totalCards = 0
  
  // Contar cartas por tipo
  const typeMap = new Map<string, number>()
  
  cards.forEach(card => {
    const type = getCardType(card.name)
    const currentCount = typeMap.get(type) || 0
    typeMap.set(type, currentCount + card.quantity)
    totalCards += card.quantity
  })
  
  // Converter para array e calcular percentuais
  typeMap.forEach((count, type) => {
    typeCounts.push({
      type,
      count,
      percentage: Math.round((count / totalCards) * 100)
    })
  })
  
  // Ordenar por quantidade
  typeCounts.sort((a, b) => b.count - a.count)
  
  const dominantType = typeCounts[0]?.type || 'Unknown'
  
  // Gerar recomendação
  let recommendation = ''
  const pokemonCards = typeCounts.find(t => t.type === 'Pokémon')?.count || 0
  const energyCards = typeCounts.find(t => t.type === 'Energy')?.count || 0
  const trainerCards = typeCounts.find(t => t.type === 'Trainer')?.count || 0
  
  const pokemonPercentage = (pokemonCards / totalCards) * 100
  const energyPercentage = (energyCards / totalCards) * 100
  const trainerPercentage = (trainerCards / totalCards) * 100
  
  if (pokemonPercentage < 20) {
    recommendation = 'Poucos Pokémon no deck. Considere adicionar mais'
  } else if (energyPercentage < 15) {
    recommendation = 'Pouca energia no deck. Considere adicionar mais cartas de energia'
  } else if (trainerPercentage < 10) {
    recommendation = 'Poucos treinadores no deck. Considere adicionar mais suportes e itens'
  } else {
    recommendation = 'Boa distribuição de tipos de cartas'
  }
  
  return {
    totalTypes: typeCounts.length,
    typeCounts,
    dominantType,
    recommendation
  }
}

function analyzeRarityDistribution(cards: DeckCard[]): RarityDistributionAnalysis {
  const rarityCounts: Array<{ rarity: string; count: number; percentage: number }> = []
  let totalCards = 0
  
  // Contar cartas por raridade
  const rarityMap = new Map<string, number>()
  
  cards.forEach(card => {
    const rarity = getCardRarity(card.name)
    const currentCount = rarityMap.get(rarity) || 0
    rarityMap.set(rarity, currentCount + card.quantity)
    totalCards += card.quantity
  })
  
  // Converter para array e calcular percentuais
  rarityMap.forEach((count, rarity) => {
    rarityCounts.push({
      rarity,
      count,
      percentage: Math.round((count / totalCards) * 100)
    })
  })
  
  // Ordenar por quantidade
  rarityCounts.sort((a, b) => b.count - a.count)
  
  // Gerar recomendação
  let recommendation = ''
  const rareCards = rarityCounts.filter(r => r.rarity.includes('Rare')).reduce((sum, r) => sum + r.count, 0)
  const rarePercentage = (rareCards / totalCards) * 100
  
  if (rarePercentage > 50) {
    recommendation = 'Muitas cartas raras. Considere adicionar mais cartas básicas para consistência'
  } else if (rarePercentage < 10) {
    recommendation = 'Poucas cartas raras. Considere adicionar algumas cartas mais poderosas'
  } else {
    recommendation = 'Boa distribuição de raridades'
  }
  
  return {
    totalRarities: rarityCounts.length,
    rarityCounts,
    recommendation
  }
}

function generateSuggestions(
  deck: Deck, 
  energyCurve: EnergyCurveAnalysis, 
  typeDistribution: TypeDistributionAnalysis, 
  rarityDistribution: RarityDistributionAnalysis
): DeckSuggestion[] {
  const suggestions: DeckSuggestion[] = []
  
  // Verificar número total de cartas
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
  if (totalCards !== 60) {
    suggestions.push({
      type: 'warning',
      title: 'Número incorreto de cartas',
      description: `O deck tem ${totalCards} cartas, mas deve ter exatamente 60 cartas`,
      priority: 'high'
    })
  }
  
  // Verificar energia
  const energyCards = typeDistribution.typeCounts.find(t => t.type === 'Energy')?.count || 0
  if (energyCards < 8) {
    suggestions.push({
      type: 'warning',
      title: 'Pouca energia',
      description: `Apenas ${energyCards} cartas de energia. Considere adicionar mais (recomendado: 10-15)`,
      priority: 'high'
    })
  } else if (energyCards > 20) {
    suggestions.push({
      type: 'info',
      title: 'Muita energia',
      description: `${energyCards} cartas de energia pode ser excessivo. Considere reduzir para 10-15`,
      priority: 'medium'
    })
  }
  
  // Verificar treinadores
  const trainerCards = typeDistribution.typeCounts.find(t => t.type === 'Trainer')?.count || 0
  if (trainerCards < 10) {
    suggestions.push({
      type: 'info',
      title: 'Poucos treinadores',
      description: `Apenas ${trainerCards} treinadores. Considere adicionar mais suportes e itens`,
      priority: 'medium'
    })
  }
  
  // Verificar Pokémon
  const pokemonCards = typeDistribution.typeCounts.find(t => t.type === 'Pokémon')?.count || 0
  if (pokemonCards < 10) {
    suggestions.push({
      type: 'warning',
      title: 'Poucos Pokémon',
      description: `Apenas ${pokemonCards} Pokémon. Um deck precisa de mais Pokémon para funcionar`,
      priority: 'high'
    })
  }
  
  // Verificar cartas duplicadas
  const duplicateCards = deck.cards.filter(card => card.quantity > 4)
  if (duplicateCards.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Cartas duplicadas',
      description: `Algumas cartas têm mais de 4 cópias: ${duplicateCards.map(c => c.name).join(', ')}`,
      priority: 'high'
    })
  }
  
  return suggestions
}

function calculateOverallScore(
  energyCurve: EnergyCurveAnalysis,
  typeDistribution: TypeDistributionAnalysis,
  rarityDistribution: RarityDistributionAnalysis
): number {
  let score = 100
  
  // Penalizar por problemas na curva de energia
  const lowCostCards = energyCurve.energyDistribution.filter(item => item.cost <= 1).reduce((sum, item) => sum + item.count, 0)
  const lowCostPercentage = (lowCostCards / energyCurve.totalEnergy) * 100
  
  if (lowCostPercentage < 30) score -= 20
  else if (lowCostPercentage > 70) score -= 10
  
  // Penalizar por problemas na distribuição de tipos
  const energyCards = typeDistribution.typeCounts.find(t => t.type === 'Energy')?.count || 0
  const energyPercentage = (energyCards / 60) * 100
  
  if (energyPercentage < 15) score -= 15
  else if (energyPercentage > 25) score -= 10
  
  const trainerCards = typeDistribution.typeCounts.find(t => t.type === 'Trainer')?.count || 0
  const trainerPercentage = (trainerCards / 60) * 100
  
  if (trainerPercentage < 15) score -= 10
  
  return Math.max(0, Math.min(100, score))
}
