'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocalAuth } from '@/hooks/useLocalAuth'
import { useEffect, useState } from 'react'

const Navigation = () => {
  const pathname = usePathname()
  const { user, logout } = useLocalAuth()
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setDemoMode(true)
    }
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/decks', label: 'Decks', icon: '🎴' },
    { href: '/collection', label: 'Coleção', icon: '📦' },
    { href: '/matches', label: 'Partidas', icon: '⚔️' },
    { href: '/stats', label: 'Estatísticas', icon: '📊' },
    { href: '/public-decks', label: 'Comunidade', icon: '🌐' },
    { href: '/metagame', label: 'Metagame', icon: '📈' },
    { href: '/explore', label: 'Explorar', icon: '🔎' },
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎮</span>
            <span className="text-xl font-bold text-gray-800">
              Pokémon TCG Deck Manager
            </span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-pokemon-blue text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              👤 Perfil
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-sm text-gray-600">
                    Olá, {user.displayName}
                  </span>
                  {demoMode && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-300 uppercase tracking-wide">Demo</span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
