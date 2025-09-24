import { NextRequest, NextResponse } from 'next/server'
import { seedDemoData, validateUser } from '@/lib/demoAuthStore'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

if (DEMO_MODE) {
  seedDemoData()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

  // Buscar usuário
  const user = validateUser(email, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Gerar token simples (em produção, usar JWT)
    const token = `token-${user.id}-${Date.now()}`

    // Retornar sucesso
    return NextResponse.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      token
    })

  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

