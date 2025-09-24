import { promises as fs } from 'fs'
import path from 'path'
import { Deck, Match } from '@/types'

const DATA_DIR = path.join(process.cwd(), '.data')
const DECKS_FILE = path.join(DATA_DIR, 'decks.json')

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(DECKS_FILE).catch(async () => {
      await fs.writeFile(DECKS_FILE, '[]', 'utf8')
    })
  } catch {}
}

async function readDecks(): Promise<Deck[]> {
  await ensureDataFile()
  const content = await fs.readFile(DECKS_FILE, 'utf8').catch(() => '[]')
  try { return JSON.parse(content) as Deck[] } catch { return [] }
}

async function writeDecks(decks: Deck[]): Promise<void> {
  await ensureDataFile()
  await fs.writeFile(DECKS_FILE, JSON.stringify(decks, null, 2), 'utf8')
}

export async function getAllDecks(userId?: string): Promise<Deck[]> {
  const all = await readDecks()
  return userId ? all.filter(d => d.userId === userId) : all
}

export async function getDeckById(id: string, userId?: string): Promise<Deck | null> {
  const decks = await readDecks()
  const deck = decks.find(d => d.id === id) || null
  if (!deck) return null
  if (userId && deck.userId && deck.userId !== userId) return null
  return deck
}

export async function addDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> & { userId?: string }): Promise<string> {
  const decks = await readDecks()
  const id = `deck-${Date.now()}`
  const now = new Date()
  const thumb = deck.thumbnailUrl || deck.cards?.find(c => c.imageUrl)?.imageUrl || ''
  decks.unshift({ ...deck, thumbnailUrl: thumb, id, createdAt: now, updatedAt: now, userId: deck.userId })
  await writeDecks(decks)
  return id
}

export async function updateDeckById(id: string, updates: Partial<Deck>): Promise<void> {
  const decks = await readDecks()
  const idx = decks.findIndex(d => d.id === id)
  if (idx === -1) return
  const thumb = updates.thumbnailUrl
    || updates.cards?.find(c => (c as any).imageUrl)?.imageUrl
    || decks[idx].thumbnailUrl
    || ''
  decks[idx] = { ...decks[idx], ...updates, thumbnailUrl: thumb, updatedAt: new Date() }
  await writeDecks(decks)
}

export async function deleteDeckById(id: string): Promise<void> {
  const decks = await readDecks()
  const next = decks.filter(d => d.id !== id)
  await writeDecks(next)
}

// Matches helpers persisted within deck (per deck history)
export async function addMatchToDeck(deckId: string, match: Omit<Match, 'id' | 'deck' | 'date'> & { date?: Date }): Promise<string> {
  const decks = await readDecks()
  const idx = decks.findIndex(d => d.id === deckId)
  if (idx === -1) throw new Error('Deck não encontrado')
  const id = `match-${Date.now()}`
  const date = match.date ?? new Date()
  const newMatch: Match = {
    id,
    deckId,
    deck: decks[idx],
    date,
    result: match.result,
    notes: match.notes,
    eventType: match.eventType,
    opponentDeck: match.opponentDeck,
    endedByTime: match.endedByTime ?? false,
  }
  const existing = decks[idx].matches || []
  decks[idx].matches = [newMatch, ...existing]
  decks[idx].updatedAt = new Date()
  await writeDecks(decks)
  return id
}

export async function listAllMatches(): Promise<Match[]> {
  const decks = await readDecks()
  return decks.flatMap(d => (d.matches || []).map(m => ({ ...m, deck: d })))
}


