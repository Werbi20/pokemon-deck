import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  limit as limitFn
} from 'firebase/firestore'
import { db } from './firebase'
import { Deck, Match, DeckCard } from '@/types'
let local_getAllDecks: any
let local_getDeckById: any
let local_addDeck: any
let local_updateDeckById: any
let local_deleteDeckById: any
let local_listAllMatches: any
try {
  const repo = require('./deckRepo')
  local_getAllDecks = repo.getAllDecks
  local_getDeckById = repo.getDeckById
  local_addDeck = repo.addDeck
  local_updateDeckById = repo.updateDeckById
  local_deleteDeckById = repo.deleteDeckById
  local_listAllMatches = repo.listAllMatches
} catch {}

// Collections
const DECKS_COLLECTION = 'decks'
const MATCHES_COLLECTION = 'matches'
const COLLECTION_COLLECTION = 'userCollection'
const PUBLIC_DECKS_COLLECTION = 'publicDecks'
const ARCHETYPES_COLLECTION = 'archetypes'
const TOURNAMENTS_COLLECTION = 'tournaments'
const PROFILES_COLLECTION = 'profiles'
const FOLLOWS_COLLECTION = 'follows'
const ACTIVITIES_COLLECTION = 'activities'
const NOTIFICATIONS_COLLECTION = 'notifications'

// Deck operations
export async function createDeck(userId: string, deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const deckRef = await addDoc(collection(db, DECKS_COLLECTION), {
      ...deckData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return deckRef.id
  } catch (e) {
    const id = await local_addDeck({ ...(deckData as any), userId })
    return id
  }
}

export async function getDecks(userId: string): Promise<Deck[]> {
  try {
    const q = query(
      collection(db, DECKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const decks: Deck[] = []
    for (const docSnapshot of querySnapshot.docs) {
      const deckData = docSnapshot.data()
      const deck: Deck = {
        id: docSnapshot.id,
        name: deckData.name,
        description: deckData.description,
        format: deckData.format,
        cards: deckData.cards || [],
        matches: [],
        createdAt: deckData.createdAt.toDate(),
        updatedAt: deckData.updatedAt.toDate()
      }
      const matchesQuery = query(
        collection(db, MATCHES_COLLECTION),
        where('deckId', '==', docSnapshot.id),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      )
      const matchesSnapshot = await getDocs(matchesQuery)
      deck.matches = matchesSnapshot.docs.map(matchDoc => {
        const matchData = matchDoc.data()
        return {
          id: matchDoc.id,
          result: matchData.result,
          date: matchData.date.toDate(),
          notes: matchData.notes,
          deckId: matchData.deckId,
          deck: deck
        }
      })
      decks.push(deck)
    }
    return decks
  } catch (e) {
    const localDecks = await local_getAllDecks(userId)
    return localDecks
  }
}

export async function getDeck(deckId: string, userId: string): Promise<Deck | null> {
  try {
    const deckRef = doc(db, DECKS_COLLECTION, deckId)
    const deckSnap = await getDoc(deckRef)
    if (!deckSnap.exists()) {
      return null
    }
    const deckData = deckSnap.data()
    if (deckData.userId !== userId) {
      return null
    }
    const deck: Deck = {
      id: deckSnap.id,
      name: deckData.name,
      description: deckData.description,
      format: deckData.format,
      cards: deckData.cards || [],
      matches: [],
      createdAt: deckData.createdAt.toDate(),
      updatedAt: deckData.updatedAt.toDate()
    }
    const matchesQuery = query(
      collection(db, MATCHES_COLLECTION),
      where('deckId', '==', deckId),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const matchesSnapshot = await getDocs(matchesQuery)
    deck.matches = matchesSnapshot.docs.map(matchDoc => {
      const matchData = matchDoc.data()
      return {
        id: matchDoc.id,
        result: matchData.result,
        date: matchData.date.toDate(),
        notes: matchData.notes,
        deckId: matchData.deckId,
        deck: deck
      }
    })
    return deck
  } catch (e) {
    return await local_getDeckById(deckId, userId)
  }
}

export async function updateDeck(deckId: string, userId: string, deckData: Partial<Deck>) {
  try {
    const deckRef = doc(db, DECKS_COLLECTION, deckId)
    const deckSnap = await getDoc(deckRef)
    if (!deckSnap.exists() || deckSnap.data().userId !== userId) {
      throw new Error('Deck não encontrado')
    }
    await updateDoc(deckRef, {
      ...deckData,
      updatedAt: Timestamp.now()
    })
  } catch (e) {
    await local_updateDeckById(deckId, deckData)
  }
}

export async function deleteDeck(deckId: string, userId: string) {
  try {
    const deckRef = doc(db, DECKS_COLLECTION, deckId)
    const deckSnap = await getDoc(deckRef)
    if (!deckSnap.exists() || deckSnap.data().userId !== userId) {
      throw new Error('Deck não encontrado')
    }
    const matchesQuery = query(
      collection(db, MATCHES_COLLECTION),
      where('deckId', '==', deckId),
      where('userId', '==', userId)
    )
    const matchesSnapshot = await getDocs(matchesQuery)
    const deletePromises = matchesSnapshot.docs.map(matchDoc => 
      deleteDoc(doc(db, MATCHES_COLLECTION, matchDoc.id))
    )
    await Promise.all(deletePromises)
    await deleteDoc(deckRef)
  } catch (e) {
    await local_deleteDeckById(deckId)
  }
}

// Match operations
export async function createMatch(userId: string, matchData: Omit<Match, 'id' | 'date' | 'deck'>) {
  try {
    const matchRef = await addDoc(collection(db, MATCHES_COLLECTION), {
      ...matchData,
      userId,
      date: Timestamp.now()
    })
    return matchRef.id
  } catch (e) {
    // Fallback: persistir dentro do deck localmente
    const id = await local_addDeck as any
    return id
  }
}

export async function getMatches(userId: string): Promise<Match[]> {
  try {
    const q = query(
      collection(db, MATCHES_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const matches: Match[] = []
    for (const docSnapshot of querySnapshot.docs) {
      const matchData = docSnapshot.data()
      const deck = await getDeck(matchData.deckId, userId)
      if (!deck) continue
      const match: Match = {
        id: docSnapshot.id,
        result: matchData.result,
        date: matchData.date.toDate(),
        notes: matchData.notes,
        deckId: matchData.deckId,
        deck: deck
      }
      matches.push(match)
    }
    return matches
  } catch (e) {
    return await local_listAllMatches()
  }
}

// Collection operations
export interface CollectionCard {
  id: string
  name: string
  imageUrl: string
  code: string
  quantity: number
  set: string
  rarity?: string
  types?: string[]
  addedAt: Date
  tcgPlayerId?: number
  currentPrice?: number
  lastPriceUpdate?: Date
}

export async function addCardToCollection(userId: string, card: Omit<CollectionCard, 'id' | 'addedAt'>) {
  const collectionRef = await addDoc(collection(db, COLLECTION_COLLECTION), {
    ...card,
    userId,
    addedAt: Timestamp.now()
  })
  
  return collectionRef.id
}

export async function updateCardInCollection(cardId: string, userId: string, quantity: number) {
  const cardRef = doc(db, COLLECTION_COLLECTION, cardId)
  
  // Check if card exists and belongs to user
  const cardSnap = await getDoc(cardRef)
  if (!cardSnap.exists() || cardSnap.data().userId !== userId) {
    throw new Error('Carta não encontrada')
  }
  
  if (quantity <= 0) {
    await deleteDoc(cardRef)
  } else {
    await updateDoc(cardRef, { quantity })
  }
}

export async function getCollection(userId: string): Promise<CollectionCard[]> {
  const q = query(
    collection(db, COLLECTION_COLLECTION),
    where('userId', '==', userId),
    orderBy('name')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      imageUrl: data.imageUrl,
      code: data.code,
      quantity: data.quantity,
      set: data.set,
      rarity: data.rarity,
      types: data.types,
      addedAt: data.addedAt.toDate()
    }
  })
}

export async function searchCardInCollection(userId: string, cardName: string): Promise<CollectionCard | null> {
  const q = query(
    collection(db, COLLECTION_COLLECTION),
    where('userId', '==', userId),
    where('name', '==', cardName)
  )
  
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  
  const doc = querySnapshot.docs[0]
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    imageUrl: data.imageUrl,
    code: data.code,
    quantity: data.quantity,
    set: data.set,
    rarity: data.rarity,
    types: data.types,
    addedAt: data.addedAt.toDate()
  }
}

export async function getAvailableCardsForDeck(userId: string, deckCards: DeckCard[]): Promise<{ canBuild: boolean; missingCards: Array<{ name: string; needed: number; available: number }> }> {
  const collection = await getCollection(userId)
  const collectionMap = new Map(collection.map(card => [card.name, card.quantity]))
  
  const missingCards: Array<{ name: string; needed: number; available: number }> = []
  let canBuild = true
  
  for (const deckCard of deckCards) {
    const available = collectionMap.get(deckCard.name) || 0
    if (available < deckCard.quantity) {
      canBuild = false
      missingCards.push({
        name: deckCard.name,
        needed: deckCard.quantity,
        available
      })
    }
  }
  
  return { canBuild, missingCards }
}

// Public Deck operations
export interface PublicDeck extends Deck {
  isPublic: boolean
  shareToken: string
  views: number
  likes: number
  copies: number
  tags: string[]
  archetype?: string
  tournamentResults?: TournamentResult[]
}

export interface TournamentResult {
  tournamentName: string
  date: Date
  placement: number
  totalPlayers: number
  format: string
  archetype: string
}

export interface Archetype {
  id: string
  name: string
  description: string
  keyCards: string[]
  playstyle: string
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  metaShare: number
  winRate: number
  totalDecks: number
  lastUpdated: Date
}

export async function makeDeckPublic(userId: string, deckId: string, tags: string[] = [], archetype?: string) {
  const deckRef = doc(db, DECKS_COLLECTION, deckId)
  const deckSnap = await getDoc(deckRef)
  
  if (!deckSnap.exists() || deckSnap.data().userId !== userId) {
    throw new Error('Deck não encontrado')
  }
  
  const deckData = deckSnap.data() as Deck
  const shareToken = generateShareToken()
  
  const publicDeckData: Omit<PublicDeck, 'id'> = {
    ...deckData,
    isPublic: true,
    shareToken,
    views: 0,
    likes: 0,
    copies: 0,
    tags,
    archetype,
    tournamentResults: []
  }
  
  // Criar cópia pública
  const publicDeckRef = await addDoc(collection(db, PUBLIC_DECKS_COLLECTION), {
    ...publicDeckData,
    originalDeckId: deckId,
    originalUserId: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  
  // Atualizar deck original
  await updateDoc(deckRef, {
    isPublic: true,
    shareToken,
    publicDeckId: publicDeckRef.id
  })
  
  // Criar atividade
  await createActivity(userId, {
    type: 'deck_public',
    title: 'Tornou deck público',
    description: `Compartilhou o deck "${deckData.name}" com a comunidade`,
    data: { deckId, deckName: deckData.name, publicDeckId: publicDeckRef.id },
    isPublic: true
  })
  
  return publicDeckRef.id
}

export async function getPublicDecks(filters: {
  archetype?: string
  format?: string
  tags?: string[]
  limit?: number
  orderBy?: 'views' | 'likes' | 'copies' | 'createdAt'
} = {}): Promise<PublicDeck[]> {
  let q = query(collection(db, PUBLIC_DECKS_COLLECTION))
  
  if (filters.archetype) {
    q = query(q, where('archetype', '==', filters.archetype))
  }
  
  if (filters.format) {
    q = query(q, where('format', '==', filters.format))
  }
  
  if (filters.tags && filters.tags.length > 0) {
    q = query(q, where('tags', 'array-contains-any', filters.tags))
  }
  
  const orderByField = filters.orderBy || 'createdAt'
  q = query(q, orderBy(orderByField, 'desc'))
  
  if (filters.limit) {
    q = query(q, limitFn(filters.limit))
  }
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      tournamentResults: data.tournamentResults?.map((result: any) => ({
        ...result,
        date: result.date.toDate()
      })) || []
    } as PublicDeck
  })
}

export async function getPublicDeckByToken(shareToken: string): Promise<PublicDeck | null> {
  const q = query(
    collection(db, PUBLIC_DECKS_COLLECTION),
    where('shareToken', '==', shareToken)
  )
  
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  
  const doc = querySnapshot.docs[0]
  const data = doc.data()
  
  // Incrementar visualizações
  await updateDoc(doc.ref, {
    views: (data.views || 0) + 1
  })
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    tournamentResults: data.tournamentResults?.map((result: any) => ({
      ...result,
      date: result.date.toDate()
    })) || []
  } as PublicDeck
}

export async function copyPublicDeck(userId: string, publicDeckId: string): Promise<string> {
  const publicDeckRef = doc(db, PUBLIC_DECKS_COLLECTION, publicDeckId)
  const publicDeckSnap = await getDoc(publicDeckRef)
  
  if (!publicDeckSnap.exists()) {
    throw new Error('Deck público não encontrado')
  }
  
  const publicDeckData = publicDeckSnap.data() as PublicDeck
  
  // Criar cópia privada
  const newDeckData: Omit<Deck, 'id'> = {
    name: `${publicDeckData.name} (Cópia)`,
    description: `Cópia de deck público: ${publicDeckData.description || ''}`,
    format: publicDeckData.format,
    cards: publicDeckData.cards,
    userId,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const newDeckRef = await addDoc(collection(db, DECKS_COLLECTION), {
    ...newDeckData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  
  // Incrementar contador de cópias
  await updateDoc(publicDeckRef, {
    copies: (publicDeckData.copies || 0) + 1
  })
  
  // Criar atividade
  await createActivity(userId, {
    type: 'deck_created',
    title: 'Copiou deck público',
    description: `Copiou o deck "${publicDeckData.name}" da comunidade`,
    data: { deckId: newDeckRef.id, deckName: publicDeckData.name, originalDeckId: publicDeckId },
    isPublic: true
  })
  
  return newDeckRef.id
}

export async function likePublicDeck(publicDeckId: string, userId: string): Promise<void> {
  const publicDeckRef = doc(db, PUBLIC_DECKS_COLLECTION, publicDeckId)
  const publicDeckSnap = await getDoc(publicDeckRef)
  
  if (!publicDeckSnap.exists()) {
    throw new Error('Deck público não encontrado')
  }
  
  const publicDeckData = publicDeckSnap.data() as PublicDeck
  
  // Verificar se o usuário já curtiu
  const likesRef = collection(db, 'deckLikes')
  const userLikeQuery = query(
    likesRef,
    where('publicDeckId', '==', publicDeckId),
    where('userId', '==', userId)
  )
  
  const userLikeSnapshot = await getDocs(userLikeQuery)
  
  if (userLikeSnapshot.empty) {
    // Adicionar like
    await addDoc(likesRef, {
      publicDeckId,
      userId,
      createdAt: Timestamp.now()
    })
    
    await updateDoc(publicDeckRef, {
      likes: (publicDeckData.likes || 0) + 1
    })
  } else {
    // Remover like
    await deleteDoc(userLikeSnapshot.docs[0].ref)
    
    await updateDoc(publicDeckRef, {
      likes: Math.max(0, (publicDeckData.likes || 0) - 1)
    })
  }
}

// Archetype operations
export async function getArchetypes(): Promise<Archetype[]> {
  const q = query(
    collection(db, ARCHETYPES_COLLECTION),
    orderBy('metaShare', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      lastUpdated: data.lastUpdated.toDate()
    } as Archetype
  })
}

export async function updateArchetypeStats(archetypeId: string, stats: {
  metaShare: number
  winRate: number
  totalDecks: number
}): Promise<void> {
  const archetypeRef = doc(db, ARCHETYPES_COLLECTION, archetypeId)
  await updateDoc(archetypeRef, {
    ...stats,
    lastUpdated: Timestamp.now()
  })
}

// Tournament operations
export async function addTournamentResult(publicDeckId: string, result: TournamentResult): Promise<void> {
  const publicDeckRef = doc(db, PUBLIC_DECKS_COLLECTION, publicDeckId)
  const publicDeckSnap = await getDoc(publicDeckRef)
  
  if (!publicDeckSnap.exists()) {
    throw new Error('Deck público não encontrado')
  }
  
  const publicDeckData = publicDeckSnap.data() as PublicDeck
  const tournamentResults = publicDeckData.tournamentResults || []
  
  tournamentResults.push(result)
  
  await updateDoc(publicDeckRef, {
    tournamentResults: tournamentResults.map(result => ({
      ...result,
      date: Timestamp.fromDate(result.date)
    }))
  })
}

// User Profile operations
export interface UserProfile {
  id: string
  userId: string
  username: string
  displayName: string
  bio: string
  avatar: string
  banner: string
  location: string
  favoriteArchetype: string
  favoriteFormat: string
  joinDate: Date
  lastActive: Date
  stats: {
    totalDecks: number
    publicDecks: number
    totalMatches: number
    winRate: number
    followers: number
    following: number
    totalLikes: number
    totalViews: number
  }
  achievements: string[]
  socialLinks: {
    twitter?: string
    youtube?: string
    twitch?: string
    discord?: string
  }
  privacy: {
    showEmail: boolean
    showStats: boolean
    allowFollows: boolean
  }
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface Activity {
  id: string
  userId: string
  type: 'deck_created' | 'deck_public' | 'match_played' | 'achievement_unlocked' | 'followed_user'
  title: string
  description: string
  data: any
  createdAt: Date
  isPublic: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'follow' | 'like' | 'copy' | 'comment' | 'achievement'
  title: string
  message: string
  data: any
  read: boolean
  createdAt: Date
}

export async function createUserProfile(userId: string, profileData: {
  username: string
  displayName: string
  email: string
  bio?: string
  avatar?: string
  banner?: string
  location?: string
  favoriteArchetype?: string
  favoriteFormat?: string
  socialLinks?: {
    twitter?: string
    youtube?: string
    twitch?: string
    discord?: string
  }
  privacy?: {
    showEmail?: boolean
    showStats?: boolean
    allowFollows?: boolean
  }
}): Promise<string> {
  const profileRef = await addDoc(collection(db, PROFILES_COLLECTION), {
    userId,
    username: profileData.username,
    displayName: profileData.displayName,
    bio: profileData.bio || '',
    avatar: profileData.avatar || '',
    banner: profileData.banner || '',
    location: profileData.location || '',
    favoriteArchetype: profileData.favoriteArchetype || '',
    favoriteFormat: profileData.favoriteFormat || 'Standard',
    joinDate: Timestamp.now(),
    lastActive: Timestamp.now(),
    stats: {
      totalDecks: 0,
      publicDecks: 0,
      totalMatches: 0,
      winRate: 0,
      followers: 0,
      following: 0,
      totalLikes: 0,
      totalViews: 0
    },
    achievements: [],
    socialLinks: profileData.socialLinks || {},
    privacy: {
      showEmail: profileData.privacy?.showEmail ?? false,
      showStats: profileData.privacy?.showStats ?? true,
      allowFollows: profileData.privacy?.allowFollows ?? true
    }
  })
  
  return profileRef.id
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, PROFILES_COLLECTION),
    where('userId', '==', userId)
  )
  
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  
  const doc = querySnapshot.docs[0]
  const data = doc.data()
  
  return {
    id: doc.id,
    ...data,
    joinDate: data.joinDate.toDate(),
    lastActive: data.lastActive.toDate()
  } as UserProfile
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, PROFILES_COLLECTION),
    where('username', '==', username)
  )
  
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  
  const doc = querySnapshot.docs[0]
  const data = doc.data()
  
  return {
    id: doc.id,
    ...data,
    joinDate: data.joinDate.toDate(),
    lastActive: data.lastActive.toDate()
  } as UserProfile
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const profile = await getUserProfile(userId)
  if (!profile) {
    throw new Error('Perfil não encontrado')
  }
  
  const profileRef = doc(db, PROFILES_COLLECTION, profile.id)
  await updateDoc(profileRef, {
    ...updates,
    lastActive: Timestamp.now()
  })
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  // Verificar se já está seguindo
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  )
  
  const followSnapshot = await getDocs(followQuery)
  if (!followSnapshot.empty) {
    throw new Error('Você já está seguindo este usuário')
  }
  
  // Criar follow
  await addDoc(collection(db, FOLLOWS_COLLECTION), {
    followerId,
    followingId,
    createdAt: Timestamp.now()
  })
  
  // Atualizar contadores
  const followerProfile = await getUserProfile(followerId)
  const followingProfile = await getUserProfile(followingId)
  
  if (followerProfile && followingProfile) {
    const followerRef = doc(db, PROFILES_COLLECTION, followerProfile.id)
    const followingRef = doc(db, PROFILES_COLLECTION, followingProfile.id)
    
    await updateDoc(followerRef, {
      'stats.following': followerProfile.stats.following + 1
    })
    
    await updateDoc(followingRef, {
      'stats.followers': followingProfile.stats.followers + 1
    })
  }
  
  // Criar notificação
  await createNotification(followingId, {
    type: 'follow',
    title: 'Novo seguidor',
    message: `${followerProfile?.displayName || 'Alguém'} começou a te seguir`,
    data: { followerId }
  })
  
  // Criar atividade
  await createActivity(followerId, {
    type: 'followed_user',
    title: 'Começou a seguir',
    description: `Agora está seguindo ${followingProfile?.displayName || 'um usuário'}`,
    data: { followingId },
    isPublic: true
  })
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  // Encontrar follow
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  )
  
  const followSnapshot = await getDocs(followQuery)
  if (followSnapshot.empty) {
    throw new Error('Você não está seguindo este usuário')
  }
  
  // Remover follow
  await deleteDoc(followSnapshot.docs[0].ref)
  
  // Atualizar contadores
  const followerProfile = await getUserProfile(followerId)
  const followingProfile = await getUserProfile(followingId)
  
  if (followerProfile && followingProfile) {
    const followerRef = doc(db, PROFILES_COLLECTION, followerProfile.id)
    const followingRef = doc(db, PROFILES_COLLECTION, followingProfile.id)
    
    await updateDoc(followerRef, {
      'stats.following': Math.max(0, followerProfile.stats.following - 1)
    })
    
    await updateDoc(followingRef, {
      'stats.followers': Math.max(0, followingProfile.stats.followers - 1)
    })
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  )
  
  const followSnapshot = await getDocs(followQuery)
  return !followSnapshot.empty
}

export async function getFollowers(userId: string): Promise<UserProfile[]> {
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followingId', '==', userId)
  )
  
  const followSnapshot = await getDocs(followQuery)
  const followerIds = followSnapshot.docs.map(doc => doc.data().followerId)
  
  const profiles: UserProfile[] = []
  for (const followerId of followerIds) {
    const profile = await getUserProfile(followerId)
    if (profile) {
      profiles.push(profile)
    }
  }
  
  return profiles
}

export async function getFollowing(userId: string): Promise<UserProfile[]> {
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', userId)
  )
  
  const followSnapshot = await getDocs(followQuery)
  const followingIds = followSnapshot.docs.map(doc => doc.data().followingId)
  
  const profiles: UserProfile[] = []
  for (const followingId of followingIds) {
    const profile = await getUserProfile(followingId)
    if (profile) {
      profiles.push(profile)
    }
  }
  
  return profiles
}

export async function getFeed(userId: string, limitCount: number = 20): Promise<Activity[]> {
  const following = await getFollowing(userId)
  const followingIds = following.map(profile => profile.userId)
  
  // Incluir as próprias atividades
  followingIds.push(userId)
  
  const activitiesQuery = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('userId', 'in', followingIds),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limitFn(limitCount)
  )
  
  const activitiesSnapshot = await getDocs(activitiesQuery)
  return activitiesSnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate()
    } as Activity
  })
}

export async function createActivity(userId: string, activityData: {
  type: Activity['type']
  title: string
  description: string
  data: any
  isPublic: boolean
}): Promise<void> {
  await addDoc(collection(db, ACTIVITIES_COLLECTION), {
    userId,
    type: activityData.type,
    title: activityData.title,
    description: activityData.description,
    data: activityData.data,
    isPublic: activityData.isPublic,
    createdAt: Timestamp.now()
  })
}

export async function createNotification(userId: string, notificationData: {
  type: Notification['type']
  title: string
  message: string
  data: any
}): Promise<void> {
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    userId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data,
    read: false,
    createdAt: Timestamp.now()
  })
}

export async function getNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  const notificationsQuery = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limitFn(limitCount)
  )
  
  const notificationsSnapshot = await getDocs(notificationsQuery)
  return notificationsSnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate()
    } as Notification
  })
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
  await updateDoc(notificationRef, { read: true })
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notifications = await getNotifications(userId, 100)
  const batch = writeBatch(db)
  
  notifications.forEach(notification => {
    if (!notification.read) {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id)
      batch.update(notificationRef, { read: true })
    }
  })
  
  await batch.commit()
}

export async function searchUsers(queryText: string, limitCount: number = 20): Promise<UserProfile[]> {
  const profilesQuery = query(
    collection(db, PROFILES_COLLECTION),
    orderBy('displayName'),
    limitFn(limitCount)
  )
  
  const profilesSnapshot = await getDocs(profilesQuery)
  const profiles = profilesSnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      joinDate: data.joinDate.toDate(),
      lastActive: data.lastActive.toDate()
    } as UserProfile
  })
  
  // Filtrar por query (Firestore não suporta busca de texto completo)
  return profiles.filter(profile => 
    profile.displayName.toLowerCase().includes(queryText.toLowerCase()) ||
    profile.username.toLowerCase().includes(queryText.toLowerCase())
  )
}

// Collection Ranking operations
export interface CollectionRanking {
  id: string
  userId: string
  username: string
  displayName: string
  totalValue: number
  totalCards: number
  lastUpdated: Date
  rank: number
  previousRank?: number
  valueChange?: number
  topCards: Array<{
    name: string
    quantity: number
    value: number
    percentage: number
  }>
}

export interface CollectionStats {
  totalValue: number
  totalCards: number
  averageCardValue: number
  mostValuableCard: {
    name: string
    value: number
    quantity: number
  }
  valueByRarity: Record<string, number>
  valueBySet: Record<string, number>
  lastUpdated: Date
}

export async function updateCollectionStats(userId: string, stats: CollectionStats): Promise<void> {
  const profile = await getUserProfile(userId)
  if (!profile) {
    throw new Error('Perfil não encontrado')
  }
  
  const profileRef = doc(db, PROFILES_COLLECTION, profile.id)
  await updateDoc(profileRef, {
    'stats.collectionValue': stats.totalValue,
    'stats.totalCards': stats.totalCards,
    'stats.averageCardValue': stats.averageCardValue,
    lastActive: Timestamp.now()
  })
}

export async function getCollectionRankings(limitCount: number = 50): Promise<CollectionRanking[]> {
  const profilesQuery = query(
    collection(db, PROFILES_COLLECTION),
    where('stats.collectionValue', '>', 0),
    orderBy('stats.collectionValue', 'desc'),
    limitFn(limitCount)
  )
  
  const profilesSnapshot = await getDocs(profilesQuery)
  const rankings: CollectionRanking[] = []
  
  profilesSnapshot.docs.forEach((doc, index) => {
    const data = doc.data()
    rankings.push({
      id: doc.id,
      userId: data.userId,
      username: data.username,
      displayName: data.displayName,
      totalValue: data.stats.collectionValue || 0,
      totalCards: data.stats.totalCards || 0,
      lastUpdated: data.lastActive.toDate(),
      rank: index + 1,
      topCards: [] // Será preenchido separadamente
    })
  })
  
  return rankings
}

export async function getUserCollectionRank(userId: string): Promise<{
  rank: number
  totalUsers: number
  percentile: number
} | null> {
  const userProfile = await getUserProfile(userId)
  if (!userProfile || !userProfile.stats.collectionValue) {
    return null
  }
  
  const allProfilesQuery = query(
    collection(db, PROFILES_COLLECTION),
    where('stats.collectionValue', '>', 0),
    orderBy('stats.collectionValue', 'desc')
  )
  
  const allProfilesSnapshot = await getDocs(allProfilesQuery)
  const totalUsers = allProfilesSnapshot.docs.length
  
  let userRank = 0
  allProfilesSnapshot.docs.forEach((doc, index) => {
    if (doc.data().userId === userId) {
      userRank = index + 1
    }
  })
  
  if (userRank === 0) {
    return null
  }
  
  const percentile = Math.round(((totalUsers - userRank + 1) / totalUsers) * 100)
  
  return {
    rank: userRank,
    totalUsers,
    percentile
  }
}

export async function updateCollectionCardPrice(
  userId: string, 
  cardId: string, 
  tcgPlayerId: number, 
  price: number
): Promise<void> {
  const collectionQuery = query(
    collection(db, COLLECTION_COLLECTION),
    where('userId', '==', userId),
    where('id', '==', cardId)
  )
  
  const collectionSnapshot = await getDocs(collectionQuery)
  if (collectionSnapshot.empty) {
    throw new Error('Carta não encontrada na coleção')
  }
  
  const cardRef = collectionSnapshot.docs[0].ref
  await updateDoc(cardRef, {
    tcgPlayerId,
    currentPrice: price,
    lastPriceUpdate: Timestamp.now()
  })
}

export async function getCollectionValueHistory(
  userId: string, 
  days: number = 30
): Promise<Array<{
  date: Date
  value: number
}>> {
  // Esta função seria implementada com uma coleção separada para histórico
  // Por simplicidade, retornamos dados mockados
  const history: Array<{ date: Date; value: number }> = []
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    // Simular variação de preço
    const baseValue = 1000
    const variation = Math.sin(i * 0.1) * 100
    history.push({
      date,
      value: Math.max(0, baseValue + variation)
    })
  }
  
  return history
}

// Utility functions
function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
