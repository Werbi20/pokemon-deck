import { NextRequest, NextResponse } from 'next/server'
import { addUser, findByEmail } from '@/lib/demoAuthStore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

  const exists = findByEmail(email)
    if (exists) {
      return NextResponse.json({ error: 'Email já registrado' }, { status: 409 })
    }

    const newUser = {
      id: Math.random().toString(36).slice(2),
      email,
      password, // Em produção: NUNCA armazenar senha em texto puro
      displayName,
      createdAt: new Date()
    }
    addUser(newUser)

    return NextResponse.json({ message: 'Usuário registrado com sucesso' })
  } catch (e) {
    console.error('Erro ao registrar usuário:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
