import { NextRequest, NextResponse } from 'next/server'
import { pokemonTCGApi } from '@/lib/tcgApi'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let result: any = {}

    switch (type) {
      case 'sets':
        result = await pokemonTCGApi.getSets()
        break
      case 'types':
        result = await pokemonTCGApi.getTypes()
        break
      case 'subtypes':
        result = await pokemonTCGApi.getSubtypes()
        break
      default:
        // Retornar todos os filtros
        const [sets, types, subtypes] = await Promise.all([
          pokemonTCGApi.getSets(),
          pokemonTCGApi.getTypes(),
          pokemonTCGApi.getSubtypes()
        ])
        
        result = {
          sets: sets.data,
          types: types.data,
          subtypes: subtypes.data,
          rarities: [
            'Common',
            'Uncommon', 
            'Rare',
            'Rare Holo',
            'Rare Holo EX',
            'Rare Holo GX',
            'Rare Holo V',
            'Rare Holo VMAX',
            'Rare Holo VSTAR',
            'Rare Ultra',
            'Rare Secret',
            'Rare Rainbow',
            'Rare Shiny',
            'Rare Shiny GX',
            'Rare Shiny V',
            'Rare Shiny VMAX',
            'Rare Shiny VSTAR'
          ],
          legalities: [
            'Standard',
            'Expanded',
            'Unlimited'
          ],
          regulationMarks: [
            'A',
            'B', 
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z'
          ]
        }
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar filtros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
