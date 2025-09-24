import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export const initialArchetypes = [
  {
    name: 'Lugia VSTAR',
    description: 'Deck focado em Lugia VSTAR com suporte de Pokémon Colorless e estratégias de aceleração de energia',
    keyCards: ['Lugia VSTAR', 'Archeops', 'Yveltal', 'Radiant Charizard'],
    playstyle: 'Control',
    tier: 'S' as const,
    metaShare: 15.2,
    winRate: 58.3,
    totalDecks: 1247,
    lastUpdated: new Date()
  },
  {
    name: 'Lost Box',
    description: 'Deck baseado em Comfey e Mirage Gate para aceleração de energia e ataques poderosos',
    keyCards: ['Comfey', 'Mirage Gate', 'Sableye', 'Cramorant'],
    playstyle: 'Combo',
    tier: 'S' as const,
    metaShare: 12.8,
    winRate: 56.7,
    totalDecks: 1056,
    lastUpdated: new Date()
  },
  {
    name: 'Mew VMAX',
    description: 'Deck de Mew VMAX com Genesect V e estratégias de aceleração de energia',
    keyCards: ['Mew VMAX', 'Genesect V', 'Fusion Strike Energy', 'Meloetta'],
    playstyle: 'Aggro',
    tier: 'A' as const,
    metaShare: 11.4,
    winRate: 54.2,
    totalDecks: 934,
    lastUpdated: new Date()
  },
  {
    name: 'Palkia VSTAR',
    description: 'Deck de Palkia VSTAR com Inteleon e estratégias de controle de campo',
    keyCards: ['Palkia VSTAR', 'Inteleon', 'Radiant Greninja', 'Manaphy'],
    playstyle: 'Control',
    tier: 'A' as const,
    metaShare: 9.7,
    winRate: 52.8,
    totalDecks: 798,
    lastUpdated: new Date()
  },
  {
    name: 'Arceus VSTAR',
    description: 'Deck versátil de Arceus VSTAR com múltiplas opções de ataque',
    keyCards: ['Arceus VSTAR', 'Duraludon VMAX', 'Flying Pikachu VMAX', 'Radiant Charizard'],
    playstyle: 'Versatile',
    tier: 'A' as const,
    metaShare: 8.9,
    winRate: 51.5,
    totalDecks: 732,
    lastUpdated: new Date()
  },
  {
    name: 'Regigigas',
    description: 'Deck de Regigigas com múltiplos Regis e estratégias de aceleração',
    keyCards: ['Regigigas', 'Regieleki VMAX', 'Regidrago VSTAR', 'Radiant Eternatus'],
    playstyle: 'Combo',
    tier: 'B' as const,
    metaShare: 7.3,
    winRate: 49.8,
    totalDecks: 601,
    lastUpdated: new Date()
  },
  {
    name: 'Giratina VSTAR',
    description: 'Deck de Giratina VSTAR com Lost Zone e estratégias de controle',
    keyCards: ['Giratina VSTAR', 'Comfey', 'Sableye', 'Radiant Greninja'],
    playstyle: 'Control',
    tier: 'B' as const,
    metaShare: 6.8,
    winRate: 48.9,
    totalDecks: 559,
    lastUpdated: new Date()
  },
  {
    name: 'Hisuian Zoroark VSTAR',
    description: 'Deck de Hisuian Zoroark VSTAR com estratégias de evolução rápida',
    keyCards: ['Hisuian Zoroark VSTAR', 'Hisuian Zorua', 'Radiant Hisuian Sneasler', 'Klefki'],
    playstyle: 'Aggro',
    tier: 'B' as const,
    metaShare: 5.9,
    winRate: 47.2,
    totalDecks: 485,
    lastUpdated: new Date()
  },
  {
    name: 'Kyurem VMAX',
    description: 'Deck de Kyurem VMAX com estratégias de aceleração de energia',
    keyCards: ['Kyurem VMAX', 'Frosmoth', 'Radiant Alakazam', 'Melony'],
    playstyle: 'Control',
    tier: 'C' as const,
    metaShare: 4.7,
    winRate: 45.6,
    totalDecks: 387,
    lastUpdated: new Date()
  },
  {
    name: 'Blissey V',
    description: 'Deck de Blissey V com estratégias de cura e resistência',
    keyCards: ['Blissey V', 'Chansey', 'Radiant Blissey', 'Big Charm'],
    playstyle: 'Control',
    tier: 'C' as const,
    metaShare: 3.8,
    winRate: 43.1,
    totalDecks: 312,
    lastUpdated: new Date()
  },
  {
    name: 'Rapid Strike Urshifu VMAX',
    description: 'Deck de Rapid Strike Urshifu VMAX com estratégias de ataque rápido',
    keyCards: ['Rapid Strike Urshifu VMAX', 'Rapid Strike Urshifu V', 'Octillery', 'Radiant Greninja'],
    playstyle: 'Aggro',
    tier: 'C' as const,
    metaShare: 3.2,
    winRate: 41.8,
    totalDecks: 263,
    lastUpdated: new Date()
  },
  {
    name: 'Single Strike Urshifu VMAX',
    description: 'Deck de Single Strike Urshifu VMAX com estratégias de poder',
    keyCards: ['Single Strike Urshifu VMAX', 'Single Strike Urshifu V', 'Houndoom', 'Radiant Charizard'],
    playstyle: 'Aggro',
    tier: 'D' as const,
    metaShare: 2.6,
    winRate: 39.4,
    totalDecks: 214,
    lastUpdated: new Date()
  }
]

export async function seedArchetypes() {
  try {
    const archetypesRef = collection(db, 'archetypes')
    
    for (const archetype of initialArchetypes) {
      await addDoc(archetypesRef, {
        ...archetype,
        lastUpdated: Timestamp.now()
      })
    }
    
    console.log('Arquétipos iniciais adicionados com sucesso!')
  } catch (error) {
    console.error('Erro ao adicionar arquétipos iniciais:', error)
  }
}
