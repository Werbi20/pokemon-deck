// Evitar import estático de 'firebase-admin' para não quebrar build quando não instalado
let admin: any
try {
  console.log('firebaseAdmin - tentando carregar firebase-admin')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  admin = require('firebase-admin')
  console.log('firebaseAdmin - firebase-admin carregado com sucesso')

  if (!admin.apps.length) {
    console.log('firebaseAdmin - inicializando app')
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (projectId && clientEmail && privateKey) {
      console.log('firebaseAdmin - usando credenciais do .env')
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      })
    } else {
      console.log('firebaseAdmin - usando Application Default Credentials')
      // Fallback para Application Default Credentials, se configurado no ambiente
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    }
    console.log('firebaseAdmin - app inicializado')
  } else {
    console.log('firebaseAdmin - app já existe')
  }
} catch (e) {
  console.log('firebaseAdmin - firebase-admin não disponível, usando shim:', e)
  // Shim mínimo quando firebase-admin não está disponível
  admin = {
    auth: () => ({
      verifyIdToken: async () => { 
        console.log('firebaseAdmin - shim verifyIdToken chamado')
        throw new Error('firebase-admin indisponível') 
      }
    }),
    apps: []
  }
}

export { admin }
