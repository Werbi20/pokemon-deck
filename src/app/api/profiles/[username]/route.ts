import { NextRequest, NextResponse } from 'next/server'
import { getUserProfileByUsername } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const profile = await getUserProfileByUsername(params.username)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
