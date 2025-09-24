import { Deck, Match, DeckCard, CollectionCard } from '@/types'

// ===== Collections (User-defined collections) =====
export interface UserCollection {
  id: string
  userId: string
  name: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const userCollections: UserCollection[] = []
const collectionCards: CollectionCard[] = []

// Dados mock para desenvolvimento
export const mockDecks: Deck[] = [
  {
    id: 'deck-1',
    name: 'Deck Pikachu VMAX',
    description: 'Um deck agressivo focado em Pikachu VMAX',
    format: 'Standard',
    cards: [
      {
        id: 'card-1',
        name: 'Pikachu VMAX',
        imageUrl: 'https://images.pokemontcg.io/swsh4/044_hires.png',
        code: 'SWSH4-044',
        quantity: 3
      },
      {
        id: 'card-2',
        name: 'Pikachu V',
        imageUrl: 'https://images.pokemontcg.io/swsh4/043_hires.png',
        code: 'SWSH4-043',
        quantity: 4
      },
      {
        id: 'card-3',
        name: 'Lightning Energy',
        imageUrl: 'https://images.pokemontcg.io/base/108_hires.png',
        code: 'BASE-108',
        quantity: 12
      }
    ],
    matches: [
      {
        id: 'match-1',
        result: 'win',
        date: new Date('2024-01-15'),
        notes: 'Vitória contra Charizard VMAX',
        deckId: 'deck-1',
        deck: {} as Deck
      },
      {
        id: 'match-2',
        result: 'lose',
        date: new Date('2024-01-14'),
        notes: 'Derrota para Mew VMAX',
        deckId: 'deck-1',
        deck: {} as Deck
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'deck-2',
    name: 'Deck Charizard VMAX',
    description: 'Deck clássico com Charizard VMAX',
    format: 'Standard',
    cards: [
      {
        id: 'card-4',
        name: 'Charizard VMAX',
        imageUrl: 'https://images.pokemontcg.io/swsh4/020_hires.png',
        code: 'SWSH4-020',
        quantity: 3
      },
      {
        id: 'card-5',
        name: 'Charizard V',
        imageUrl: 'https://images.pokemontcg.io/swsh4/019_hires.png',
        code: 'SWSH4-019',
        quantity: 4
      },
      {
        id: 'card-6',
        name: 'Fire Energy',
        imageUrl: 'https://images.pokemontcg.io/base/107_hires.png',
        code: 'BASE-107',
        quantity: 12
      }
    ],
    matches: [
      {
        id: 'match-3',
        result: 'win',
        date: new Date('2024-01-12'),
        notes: 'Vitória contra Mew VMAX',
        deckId: 'deck-2',
        deck: {} as Deck
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12')
  }
];

export const mockMatches: Match[] = [
  {
    id: 'match-1',
    result: 'win',
    date: new Date('2024-01-15'),
    notes: 'Vitória contra Charizard VMAX',
    deckId: 'deck-1',
    deck: {} as Deck
  },
  {
    id: 'match-2',
    result: 'lose',
    date: new Date('2024-01-14'),
    notes: 'Derrota para Mew VMAX',
    deckId: 'deck-1',
    deck: {} as Deck
  },
  {
    id: 'match-3',
    result: 'win',
    date: new Date('2024-01-12'),
    notes: 'Vitória contra Mew VMAX',
    deckId: 'deck-2',
    deck: {} as Deck
  }
];

// ===== Helpers para geração dinâmica em modo demo =====
export function addMockMatch(match: Omit<Match, 'id' | 'deck'> & { id?: string }) {
  const id = match.id || `match-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  const deck = mockDecks.find(d => d.id === match.deckId)
  if (!deck) return id
  const newMatch: Match = { id, result: match.result, date: match.date, notes: match.notes, deckId: match.deckId, deck }
  mockMatches.push(newMatch)
  deck.matches = deck.matches || []
  deck.matches.push(newMatch)
  return id
}

export function addMockDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const id = deck.id || `deck-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  const newDeck: Deck = { ...deck, id, createdAt: new Date(), updatedAt: new Date(), matches: deck.matches || [] }
  mockDecks.push(newDeck)
  return id
}

export interface MockCollectionEntry extends CollectionCard { userId?: string }

// Tipagem relaxada para ambiente mock (evita divergências com versão firestore)
export function addMockCollectionCard(userId: string, card: any) {
  const id = card.id || `col-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
  ;(collectionCards as any).push({
    id,
    name: card.name,
    imageUrl: card.imageUrl,
    code: card.code,
    quantity: card.quantity,
    set: card.set,
    rarity: card.rarity,
    types: card.types,
    addedAt: new Date(),
    userId
  })
  return id
}

// ===== Preload: Deck fornecido pelo usuário =====
(() => {
  const exists = mockDecks.some(d => d.id === 'deck-user-1')
  if (!exists) {
    const userDeckCards: DeckCard[] = [
      { id: '', name: 'Charcadet', imageUrl: '', setCode: 'PAR', code: '26', quantity: 3 },
      { id: '', name: 'Armarouge', imageUrl: '', setCode: 'SVI', code: '41', quantity: 2 },
      { id: '', name: "Ethan's Ho-Oh ex", imageUrl: '', setCode: 'DRI', code: '39', quantity: 2 },
      { id: '', name: 'Iron Bundle', imageUrl: '', setCode: 'PAR', code: '56', quantity: 1 },
      { id: '', name: 'Fezandipiti ex', imageUrl: '', setCode: 'SFA', code: '38', quantity: 1 },
      { id: '', name: 'Mew ex', imageUrl: '', setCode: 'MEW', code: '151', quantity: 1 },
      { id: '', name: 'Latias ex', imageUrl: '', setCode: 'SSP', code: '76', quantity: 1 },
      { id: '', name: 'Squawkabilly ex', imageUrl: '', setCode: 'PAL', code: '169', quantity: 1 },
      { id: '', name: 'Wellspring Mask Ogerpon ex', imageUrl: '', setCode: 'TWM', code: '64', quantity: 1 },
      { id: '', name: 'Terapagos ex', imageUrl: '', setCode: 'SCR', code: '128', quantity: 1 },
      { id: '', name: 'Chi-Yu', imageUrl: '', setCode: 'PAR', code: '29', quantity: 1 },
      { id: '', name: 'Durant ex', imageUrl: '', setCode: 'SSP', code: '4', quantity: 1 },
      { id: '', name: "Lillie's Clefairy ex", imageUrl: '', setCode: 'JTG', code: '56', quantity: 1 },
      { id: '', name: 'Munkidori ex', imageUrl: '', setCode: 'SFA', code: '37', quantity: 1 },
      { id: '', name: 'Pecharunt ex', imageUrl: '', setCode: 'SFA', code: '39', quantity: 1 },
      { id: '', name: 'Reshiram ex', imageUrl: '', setCode: 'WHT', code: '20', quantity: 1 },
      { id: '', name: 'Iron Hands ex', imageUrl: '', setCode: 'PAR', code: '70', quantity: 1 },
      // Trainers
      { id: '', name: 'Carmine', imageUrl: '', setCode: 'TWM', code: '145', quantity: 4 },
      { id: '', name: "Professor's Research", imageUrl: '', setCode: 'JTG', code: '155', quantity: 4 },
      { id: '', name: 'Iono', imageUrl: '', setCode: 'PAL', code: '185', quantity: 2 },
      { id: '', name: "Boss's Orders", imageUrl: '', setCode: 'PAL', code: '172', quantity: 1 },
      { id: '', name: 'Night Stretcher', imageUrl: '', setCode: 'SFA', code: '61', quantity: 4 },
      { id: '', name: 'Ultra Ball', imageUrl: '', setCode: 'SVI', code: '196', quantity: 4 },
      { id: '', name: 'Nest Ball', imageUrl: '', setCode: 'SVI', code: '181', quantity: 4 },
      { id: '', name: 'Super Rod', imageUrl: '', setCode: 'PAL', code: '188', quantity: 1 },
      { id: '', name: 'Pal Pad', imageUrl: '', setCode: 'SVI', code: '182', quantity: 1 },
      { id: '', name: 'Area Zero Underdepths', imageUrl: '', setCode: 'SCR', code: '131', quantity: 3 },
      // Energy
      { id: '', name: 'Fire Energy', imageUrl: '', setCode: 'SVE', code: '10', quantity: 7 },
      { id: '', name: 'Prism Energy', imageUrl: '', setCode: 'BLK', code: '86', quantity: 3 },
      { id: '', name: 'Legacy Energy', imageUrl: '', setCode: 'TWM', code: '167', quantity: 1 },
    ]

    mockDecks.push({
      id: 'deck-user-1',
      name: 'Exemplo - Deck Importado',
      description: 'Deck importado no formato de lista (Pokémon/Trainer/Energy).',
      format: 'Standard',
      cards: userDeckCards,
      matches: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
})()

// Funções mock para substituir o Firestore
export async function getDecks(userId: string): Promise<Deck[]> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockDecks
}

export async function getDeck(deckId: string, userId: string): Promise<Deck | null> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const deck = mockDecks.find(d => d.id === deckId)
  return deck || null
}

export async function createDeck(userId: string, deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800))
  const newId = `deck-${Date.now()}`
  const newDeck: Deck = {
    ...deckData,
    id: newId,
    matches: deckData.matches ?? [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  mockDecks.push(newDeck)
  return newId
}

export async function updateDeck(deckId: string, userId: string, deckData: Partial<Deck>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 600))
  const deckIndex = mockDecks.findIndex(d => d.id === deckId)
  if (deckIndex !== -1) {
    mockDecks[deckIndex] = {
      ...mockDecks[deckIndex],
      ...deckData,
      updatedAt: new Date()
    }
  }
}

export async function deleteDeck(deckId: string, userId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 400))
  const deckIndex = mockDecks.findIndex(d => d.id === deckId)
  if (deckIndex !== -1) {
    mockDecks.splice(deckIndex, 1)
  }
}

export async function getMatches(userId: string): Promise<Match[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return mockMatches
}

export async function createMatch(userId: string, matchData: Omit<Match, 'id' | 'date' | 'deck'>): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500))
  const newId = `match-${Date.now()}`
  const newMatch: Match = {
    ...matchData,
    id: newId,
    date: new Date(),
    deck: mockDecks.find(d => d.id === matchData.deckId) || {} as Deck
  }
  mockMatches.push(newMatch)
  return newId
}

// ===== Collections API (mock) =====
export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  await new Promise(r => setTimeout(r, 200))
  return userCollections.filter(c => c.userId === userId)
}

export async function createUserCollection(userId: string, name: string, isPublic: boolean = false): Promise<string> {
  console.log('mockData.createUserCollection - entrada:', { userId, name, isPublic })
  await new Promise(r => setTimeout(r, 300))
  const id = `col-${Date.now()}`
  const newCollection = { id, userId, name, isPublic, createdAt: new Date(), updatedAt: new Date() }
  console.log('mockData.createUserCollection - criando:', newCollection)
  userCollections.push(newCollection)
  console.log('mockData.createUserCollection - total de coleções:', userCollections.length)
  return id
}

export async function getCollectionCards(userId: string, collectionId: string): Promise<CollectionCard[]> {
  await new Promise(r => setTimeout(r, 200))
  // no user check in mock; in real, verify ownership
  return collectionCards.filter(c => c.collectionId === collectionId)
}

export async function addCardToUserCollection(
  userId: string,
  collectionId: string,
  card: Omit<CollectionCard, 'id' | 'addedAt' | 'collectionId'>
): Promise<string> {
  await new Promise(r => setTimeout(r, 250))
  // merge if same name+code
  const existing = collectionCards.find(c => c.collectionId === collectionId && c.name === card.name && c.code === card.code)
  if (existing) {
    existing.quantity += card.quantity
    return existing.id
  }
  const id = `cc-${Date.now()}-${Math.floor(Math.random()*1000)}`
  collectionCards.push({
    id,
    collectionId,
    addedAt: new Date(),
    ...card,
  })
  return id
}

export async function updateCollectionCardInUserCollection(
  userId: string,
  collectionId: string,
  cardId: string,
  quantity: number
): Promise<void> {
  await new Promise(r => setTimeout(r, 200))
  const idx = collectionCards.findIndex(c => c.collectionId === collectionId && c.id === cardId)
  if (idx >= 0) {
    if (quantity <= 0) collectionCards.splice(idx, 1)
    else collectionCards[idx].quantity = quantity
  }
}
