import { NextRequest, NextResponse } from 'next/server'
import { pokemonTCGApi } from '@/lib/tcgApi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const inputCards: Array<{ name: string; setCode?: string; code?: string; imageUrl?: string; quantity: number }> = body.cards || []

    const resolved: any[] = []
    for (const c of inputCards) {
      // Se já tiver imagem válida, manter
      if (c.imageUrl && c.imageUrl.length > 0) {
        resolved.push(c)
        continue
      }
      // Construir consultas com várias variações de nome + setCode (ptcgo) + número
      // A API aceita campos: name, set.ptcgoCode, number
      const originalName = (c.name || '')
      const basicName = originalName.replace(/["']/g, '')
      const normalizedName = basicName.normalize('NFD').replace(/\p{Diacritic}/gu, '')
      const nameVariants = Array.from(new Set([
        originalName,
        basicName,
        normalizedName,
        basicName.replace(/\s+ex$/i, ''),
        normalizedName.replace(/\s+ex$/i, ''),
      ].filter(v => v)))

      let res: any = { data: [] }
      const queries: string[] = []
      for (const nv of nameVariants) {
        const safe = nv.replace(/"/g, '\\"')
        if (safe && c.setCode && c.code) queries.push(`name:\"${safe}\" set.ptcgoCode:${c.setCode} number:${c.code}`)
        if (safe && c.code) queries.push(`name:\"${safe}\" number:${c.code}`)
        if (safe && c.setCode) queries.push(`name:${safe}* set.ptcgoCode:${c.setCode}`)
        if (safe) queries.push(`name:${safe}*`)
      }
      if (c.setCode && c.code) queries.push(`set.ptcgoCode:${c.setCode} number:${c.code}`)

      for (const q of queries) {
        try {
          res = await pokemonTCGApi.searchCards({ q, page: 1, pageSize: 20 })
          if (res?.data?.length) break
        } catch {}
      }
      // selecionar melhor match: por número quando fornecido, senão primeiro
      const match = res.data.find(card => (c.code ? card.number === c.code : true)) || res.data[0]
      if (match) {
        resolved.push({
          ...c,
          id: match.id,
          imageUrl: match.images.small,
          code: match.number,
          setCode: match.set?.ptcgoCode || match.set?.id,
          types: match.types,
          subtypes: match.subtypes,
        })
      } else {
        resolved.push(c)
      }
    }

    return NextResponse.json({ cards: resolved })
  } catch (error) {
    console.error('Erro ao resolver cartas:', error)
    return NextResponse.json({ cards: [] })
  }
}


