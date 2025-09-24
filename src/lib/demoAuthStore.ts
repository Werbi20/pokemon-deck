// Store global em memória para modo demo / desenvolvimento
// Usa globalThis para sobreviver a hot reload no Next.js (em desenvolvimento)

export interface DemoUser {
  id: string
  email: string
  password: string
  displayName: string
  createdAt: Date
}

type StoreShape = {
  users: Map<string, DemoUser>
  emailIndex: Map<string, string>
  seeded: boolean
}

const globalRef = globalThis as any
if (!globalRef.__DEMO_AUTH_STORE__) {
  globalRef.__DEMO_AUTH_STORE__ = {
    users: new Map(),
    emailIndex: new Map(),
    seeded: false
  } as StoreShape
}

const store: StoreShape = globalRef.__DEMO_AUTH_STORE__

export function seedDemoData() {
  if (store.seeded) return
  // Usuário demo padrão
  const demoUser: DemoUser = {
    id: 'demo-user',
    email: 'demo@tcg.local',
    password: 'demo',
    displayName: 'Demo Trainer',
    createdAt: new Date()
  }
  addUser(demoUser)
  store.seeded = true
}

export function addUser(user: DemoUser) {
  store.users.set(user.id, user)
  store.emailIndex.set(user.email.toLowerCase(), user.id)
}

export function findByEmail(email: string): DemoUser | undefined {
  const id = store.emailIndex.get(email.toLowerCase())
  if (!id) return undefined
  return store.users.get(id)
}

export function validateUser(email: string, password: string): DemoUser | undefined {
  const user = findByEmail(email)
  if (user && user.password === password) return user
  return undefined
}

export function listUsers(): DemoUser[] {
  return Array.from(store.users.values())
}
