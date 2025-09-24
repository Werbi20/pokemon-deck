import { NextRequest, NextResponse } from 'next/server'
import { pokemonTCGApi } from '@/lib/tcgApi'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros básicos
    const qRaw = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const orderBy = searchParams.get('orderBy') || 'name'
    
    // Filtros avançados
    const set = searchParams.get('set') || undefined
    const rarity = searchParams.get('rarity') || undefined
    const types = searchParams.get('types') || undefined
    const subtypes = searchParams.get('subtypes') || undefined
    const hp = searchParams.get('hp') || undefined
    const retreatCost = searchParams.get('retreatCost') || undefined
    const convertedRetreatCost = searchParams.get('convertedRetreatCost') || undefined
    const attackCost = searchParams.get('attackCost') || undefined
    const attackDamage = searchParams.get('attackDamage') || undefined
    const weakness = searchParams.get('weakness') || undefined
    const resistance = searchParams.get('resistance') || undefined
    const nationalPokedexNumbers = searchParams.get('nationalPokedexNumbers') || undefined
    const legalities = searchParams.get('legalities') || undefined
    const regulationMark = searchParams.get('regulationMark') || undefined

    // Parse inteligente: suporta 'PAR', 'PAR 26', 'Charcadet PAR', 'Charcadet PAR 26'
    let query: string | undefined = undefined
    {
      const tokens = qRaw.trim().split(/\s+/).filter(Boolean)
      let setCode: string | undefined
      let numberCode: string | undefined
      const nameTokens: string[] = []
      for (const t of tokens) {
        if (/^[A-Z]{2,4}$/.test(t)) {
          setCode = t
        } else if (/^\d{1,4}$/.test(t)) {
          numberCode = t
        } else {
          nameTokens.push(t)
        }
      }
      const parts: string[] = []
      if (nameTokens.length > 0) parts.push(`name:${nameTokens.join(' ')}*`)
      if (setCode) parts.push(`set.ptcgoCode:${setCode}`)
      if (numberCode) parts.push(`number:${numberCode}`)
      if (parts.length > 0) query = parts.join(' ')
      else if (qRaw) query = `name:${qRaw}*`
    }

    const result = await pokemonTCGApi.searchCards({
      q: query,
      page,
      pageSize,
      orderBy,
      set,
      rarity,
      types,
      subtypes,
      hp,
      retreatCost,
      convertedRetreatCost,
      attackCost,
      attackDamage,
      weakness,
      resistance,
      nationalPokedexNumbers,
      legalities,
      regulationMark
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar cartas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
