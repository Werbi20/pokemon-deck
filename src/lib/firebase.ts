import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o app apenas se houver config minimamente válida
const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

let app: ReturnType<typeof initializeApp> | undefined
try {
  if (!getApps().length) {
    if (hasValidConfig) {
      app = initializeApp(firebaseConfig as any)
    } else {
      app = undefined
    }
  } else {
    app = getApp()
  }
} catch {
  app = undefined
}

// Evitar inicializar Auth/Provider/DB no lado do servidor (SSR)
let auth: ReturnType<typeof getAuth> | undefined
let googleProvider: GoogleAuthProvider | undefined
let db: ReturnType<typeof getFirestore> | undefined
if (typeof window !== 'undefined') {
  try {
    if (hasValidConfig && app) {
      auth = getAuth(app)
      googleProvider = new GoogleAuthProvider()
      db = getFirestore(app)
    } else {
      // eslint-disable-next-line no-console
      console.warn('[Firebase] Configuração ausente ou inválida. Rodando sem Auth/DB no cliente.')
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] Falha ao inicializar no cliente. Prosseguindo sem Auth/DB.', e)
    auth = undefined
    googleProvider = undefined
    db = undefined
  }
}

export { app, auth, db, googleProvider };

export const isFirebaseReady = hasValidConfig && Boolean(app)
