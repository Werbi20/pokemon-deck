import { NextRequest } from 'next/server'
import { admin } from './firebaseAdmin'

// Verifica ID Token do Firebase via Admin SDK ou token local
export async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    console.log('verifyFirebaseToken - iniciando verificação')
    const authHeader = request.headers.get('authorization')
    console.log('verifyFirebaseToken - authHeader:', authHeader)
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('verifyFirebaseToken - sem header de autorização')
      return null
    }
    const idToken = authHeader.split('Bearer ')[1]
    console.log('verifyFirebaseToken - idToken:', idToken)
    
    // Dev: aceitar token mock para permitir desenvolvimento sem login real
    if (idToken === 'mock-token') {
      console.log('verifyFirebaseToken - usando token mock')
      return 'dev-user'
    }
    
    // Verificar se é um token local (formato: token-userId-timestamp)
    if (idToken.startsWith('token-')) {
      console.log('verifyFirebaseToken - usando token local')
      const parts = idToken.split('-')
      if (parts.length >= 2) {
        const userId = parts[1]
        console.log('verifyFirebaseToken - userId do token local:', userId)
        return userId
      }
    }
    
    console.log('verifyFirebaseToken - verificando token real com admin')
    const decoded = await admin.auth().verifyIdToken(idToken)
    console.log('verifyFirebaseToken - token verificado:', decoded.uid)
    return decoded.uid || null
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

// Middleware para proteger rotas
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<Response>
): Promise<Response> {
  console.log('withAuth - verificando token para:', request.url)
  const userId = await verifyFirebaseToken(request)
  console.log('withAuth - userId obtido:', userId)
  
  if (!userId) {
    // Em desenvolvimento, permitir prosseguir como usuário mock quando firebase-admin indisponível
    const devBypass = process.env.NODE_ENV !== 'production'
    console.log('withAuth - devBypass:', devBypass)
    if (devBypass) {
      console.log('withAuth - usando dev-user')
      return handler(request, 'dev-user')
    } else {
      console.log('withAuth - retornando 401')
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  console.log('withAuth - prosseguindo com userId:', userId)
  return handler(request, userId)
}
