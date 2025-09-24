import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import { join } from 'path'
import { existsSync } from 'fs'

// Inicializa admin
try { admin.app() } catch { admin.initializeApp() }

// Carrega Next dinamicamente (SSR). OBS: Necessário que a build Next seja empacotada dentro de functions.
// Este é um setup simplificado e pode exigir ajustes de build (ex: usar script que copia .next para functions/.next)
let nextApp
let nextHandle

async function ensureNext() {
  if (nextApp) return
  const next = (await import('next')).default
  const dev = false
  const dir = join(process.cwd(), '..') // supõe que functions/ está dentro do root
  nextApp = next({ dev, dir })
  await nextApp.prepare()
  nextHandle = nextApp.getRequestHandler()
}

export const nextServer = functions.https.onRequest(async (req, res) => {
  try {
    await ensureNext()
    return nextHandle(req, res)
  } catch (e) {
    console.error('Erro SSR Next dentro da Function:', e)
    res.status(500).send('Erro interno (SSR)')
  }
})
