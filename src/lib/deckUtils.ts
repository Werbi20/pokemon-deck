import { Deck, DeckCard, TCGExportFormat, PokemonCard } from '@/types';

/**
 * Converte um deck para o formato de exportação do Pokémon TCG Live
 */
export function exportDeckToTCGLive(deck: Deck): string {
  const exportData: TCGExportFormat = {
    name: deck.name,
    format: deck.format,
    cards: deck.cards.map(card => ({
      name: card.name,
      count: card.quantity
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Converte um deck para o formato de texto simples do TCG Live
 */
export function exportDeckToText(deck: Deck): string {
  // Separar por categorias básicas com base em subtypes/tipos simples
  const pokemon: DeckCard[] = []
  const trainer: DeckCard[] = []
  const energy: DeckCard[] = []

  for (const c of deck.cards) {
    const nameLower = c.name.toLowerCase()
    const isEnergy = isBasicEnergy(c.name) || nameLower.includes('energy') || (c.subtypes?.includes('Energy') ?? false)
    const isTrainer = nameLower.includes('trainer') || nameLower.includes("supporter") || nameLower.includes("item") || nameLower.includes("stadium")

    if (isEnergy) energy.push(c)
    else if (isTrainer) trainer.push(c)
    else pokemon.push(c)
  }

  const section = (title: string, cards: DeckCard[]) => {
    if (cards.length === 0) return ''
    const total = cards.reduce((s, c) => s + c.quantity, 0)
    const lines = cards
      .map(c => `${c.quantity} ${c.name} ${c.setCode ?? (c.code?.split('-')[0] || '')} ${c.code}`.trim())
      .join('\n')
    return `${title}: ${total}\n${lines}\n\n`
  }

  let text = ''
  text += section('Pokémon', pokemon)
  text += section('Trainer', trainer)
  text += section('Energy', energy)
  return text.trim()
}

/**
 * Importa um deck a partir do formato JSON do TCG Live
 */
export function importDeckFromTCGLive(jsonString: string): Partial<Deck> {
  try {
    const data: TCGExportFormat = JSON.parse(jsonString);
    
    return {
      name: data.name,
      format: data.format,
      cards: data.cards.map(card => ({
        id: '', // Será gerado pelo banco
        name: card.name,
        imageUrl: '', // Será preenchido pela API
        code: '', // Será preenchido pela API
        quantity: card.count
      }))
    };
  } catch (error) {
    throw new Error('Formato de deck inválido');
  }
}

/**
 * Importa um deck a partir do formato de texto do TCG Live
 */
export function importDeckFromText(text: string): Partial<Deck> {
  const rawLines = text.split(/\r?\n/) // manter linhas originais
  const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0)

  interface SectionInfo { key: 'pokemon' | 'trainer' | 'energy'; declaredTotal?: number }
  let currentSection: SectionInfo | null = null
  const sectionTotals: Record<string, number> = { pokemon: 0, trainer: 0, energy: 0 }
  const declaredTotals: Record<string, number | undefined> = { pokemon: undefined, trainer: undefined, energy: undefined }

  const collected: Array<Partial<DeckCard> & { __section?: string }> = []

  // Normalização de headers aceitos
  const headerRegex = /^(pok[eé]mon|pokemon|trainer|treinador|energy|energia)\s*:\s*(\d+)?/i

  for (const line of lines) {
    const headerMatch = line.match(headerRegex)
    if (headerMatch) {
      const raw = headerMatch[1].toLowerCase()
      let key: SectionInfo['key']
      if (raw.startsWith('pok')) key = 'pokemon'
      else if (raw.startsWith('tra') || raw.startsWith('tre')) key = 'trainer'
      else key = 'energy'
      currentSection = { key, declaredTotal: headerMatch[2] ? parseInt(headerMatch[2]) : undefined }
      declaredTotals[key] = currentSection.declaredTotal
      continue
    }

    // Linha de carta: quantidade + nome (+ opcional sufixo ex / VMAX / etc) + SET + número
    // Permitir set codes de 2 a 5 letras (ex: SFA, JTG, DRI, SVE, etc.)
    const cardMatch = line.match(/^(\d+)\s+(.+?)\s+([A-Z]{2,5})\s+(\d{1,4})$/)
    if (cardMatch) {
      const quantity = parseInt(cardMatch[1])
      const name = cardMatch[2].trim()
      const setCode = cardMatch[3]
      const number = cardMatch[4]
      const section = currentSection?.key
      collected.push({ name, quantity, setCode, code: number, imageUrl: '', __section: section })
      if (section) sectionTotals[section] += quantity
      continue
    }

    // Fallback simples: quantidade + nome (sem set/number)
    const simpleMatch = line.match(/^(\d+)\s+(.+)$/)
    if (simpleMatch) {
      const quantity = parseInt(simpleMatch[1])
      const name = simpleMatch[2].trim()
      const section = currentSection?.key
      collected.push({ name, quantity, imageUrl: '', code: '', __section: section })
      if (section) sectionTotals[section] += quantity
      continue
    }
  }

  // Mesclar cartas duplicadas (mesmo nome + setCode + code)
  const mergedMap = new Map<string, Partial<DeckCard>>()
  for (const c of collected) {
    const key = `${(c.name||'').toLowerCase()}|${c.setCode||''}|${c.code||''}`
    if (!mergedMap.has(key)) {
      mergedMap.set(key, { name: c.name, quantity: c.quantity, setCode: c.setCode, code: c.code, imageUrl: '' })
    } else {
      const existing = mergedMap.get(key)!
      existing.quantity = (existing.quantity || 0) + (c.quantity || 0)
    }
  }

  const cards = Array.from(mergedMap.values()).map(c => ({
    id: '',
    name: c.name || '',
    imageUrl: '',
    code: c.code || '',
    setCode: c.setCode,
    quantity: c.quantity || 0
  }))

  // Detectar formato (heurística: sempre Standard se 60 cartas, senão Unknown)
  const total = cards.reduce((s, c) => s + (c.quantity || 0), 0)
  const format = total === 60 ? 'Standard' : 'Unknown'

  // Validar discrepâncias com declarados
  const warnings: string[] = []
  ;(['pokemon','trainer','energy'] as const).forEach(sec => {
    const declared = declaredTotals[sec]
    if (declared !== undefined && declared !== sectionTotals[sec]) {
      warnings.push(`Seção ${sec} declarada ${declared} mas encontrada ${sectionTotals[sec]}`)
    }
  })
  if (format === 'Unknown') warnings.push(`Total de cartas ${total} diferente de 60`)

  // Se necessário poderíamos devolver warnings – por enquanto apenas console
  if (warnings.length) {
    // eslint-disable-next-line no-console
    console.warn('[importDeckFromText] Avisos:', warnings)
  }

  return { name: 'Imported Deck', format, cards }
}

/**
 * Verifica se uma carta é energia básica
 */
function isBasicEnergy(cardName: string): boolean {
  const basicEnergies = [
    'Grass Energy',
    'Fire Energy', 
    'Water Energy',
    'Lightning Energy',
    'Psychic Energy',
    'Fighting Energy',
    'Darkness Energy',
    'Metal Energy',
    'Fairy Energy',
    'Dragon Energy',
    'Energia Grama',
    'Energia Fogo',
    'Energia Água',
    'Energia Elétrica',
    'Energia Psíquica',
    'Energia Luta',
    'Energia Escuridão',
    'Energia Metal',
    'Energia Fada',
    'Energia Dragão'
  ];
  
  return basicEnergies.some(energy => 
    cardName.toLowerCase().includes(energy.toLowerCase())
  );
}

/**
 * Valida se um deck tem o número correto de cartas para o formato
 */
export function validateDeckFormat(deck: Deck): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);

  // Validação do número total de cartas
  switch (deck.format.toLowerCase()) {
    case 'standard':
    case 'expanded':
      if (totalCards !== 60) {
        errors.push(`Deck deve ter exatamente 60 cartas (atual: ${totalCards})`);
      }
      break;
    case 'limited':
      if (totalCards < 40) {
        errors.push(`Deck limitado deve ter pelo menos 40 cartas (atual: ${totalCards})`);
      }
      break;
  }

  // Verificar se há cartas duplicadas além do limite (exceto energia básica)
  const cardCounts = new Map<string, number>();
  deck.cards.forEach(card => {
    const currentCount = cardCounts.get(card.name) || 0;
    cardCounts.set(card.name, currentCount + card.quantity);
  });

  cardCounts.forEach((count, cardName) => {
    // Energia básica pode ter quantas cópias quiser
    if (!isBasicEnergy(cardName) && count > 4) {
      errors.push(`Carta "${cardName}" aparece ${count} vezes (máximo 4 cópias por carta)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula estatísticas de um deck
 */
export function calculateDeckStats(deck: Deck) {
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  const uniqueCards = deck.cards.length;
  
  const typeDistribution = new Map<string, number>();
  deck.cards.forEach(card => {
    // Aqui você pode adicionar lógica para determinar o tipo da carta
    // Por enquanto, vamos usar um placeholder
    const type = 'Pokémon'; // Isso seria determinado pela API
    typeDistribution.set(type, (typeDistribution.get(type) || 0) + card.quantity);
  });

  return {
    totalCards,
    uniqueCards,
    typeDistribution: Object.fromEntries(typeDistribution)
  };
}
