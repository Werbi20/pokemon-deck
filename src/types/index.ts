export interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
    ptcgoCode?: string;
  };
  types?: string[];
  subtypes?: string[];
  rarity?: string;
  hp?: number;
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface DeckCard {
  id: string;
  name: string;
  imageUrl: string;
  code: string; // card number within the set (e.g., 26)
  setCode?: string; // set code like PAR, SVI, PAL
  types?: string[];
  subtypes?: string[];
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  format: string;
  thumbnailUrl?: string;
  userId?: string;
  cards: DeckCard[];
  matches: Match[];
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  result: 'win' | 'lose' | 'draw';
  date: Date;
  notes?: string;
  deckId: string;
  deck: Deck;
  eventType?: 'treino' | 'liga' | 'challenge' | 'cup' | 'regional' | 'intercontinental';
  opponentDeck?: string;
  endedByTime?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  decks: Deck[];
  matches: Match[];
}

export interface WinRateStats {
  deckId: string;
  deckName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface TCGExportFormat {
  name: string;
  format: string;
  cards: Array<{
    name: string;
    count: number;
  }>;
}

// Firestore-shared types for client (to evitar importar '@/lib/firestore' no cliente)
export interface PublicDeck extends Deck {
  isPublic: boolean;
  shareToken: string;
  views: number;
  likes: number;
  copies: number;
  tags: string[];
  archetype?: string;
  tournamentResults?: TournamentResult[];
}

export interface TournamentResult {
  tournamentName: string;
  date: Date;
  placement: number;
  totalPlayers: number;
  format: string;
  archetype: string;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  keyCards: string[];
  playstyle: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  metaShare: number;
  winRate: number;
  totalDecks: number;
  lastUpdated: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  location: string;
  favoriteArchetype: string;
  favoriteFormat: string;
  joinDate: Date;
  lastActive: Date;
  stats: any;
  achievements: string[];
  socialLinks: {
    twitter?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
  };
  privacy: {
    showEmail: boolean;
    showStats: boolean;
    allowFollows: boolean;
  };
}

export interface Activity {
  id: string;
  userId: string;
  type: 'deck_created' | 'deck_public' | 'match_played' | 'achievement_unlocked' | 'followed_user';
  title: string;
  description: string;
  data: any;
  createdAt: Date;
  isPublic: boolean;
}

export interface CollectionRanking {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  totalValue: number;
  totalCards: number;
  lastUpdated: Date;
  rank: number;
  previousRank?: number;
  valueChange?: number;
  topCards: Array<{
    name: string;
    quantity: number;
    value: number;
    percentage: number;
  }>;
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  name: string;
  imageUrl: string;
  code: string;
  quantity: number;
  set: string;
  rarity?: string;
  types?: string[];
  addedAt: Date;
  tcgPlayerId?: number;
  currentPrice?: number;
  lastPriceUpdate?: Date;
}
