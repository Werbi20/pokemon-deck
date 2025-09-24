'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface UserLite { id: string; userId: string; username: string; displayName: string; avatar?: string }

export default function ExplorePage() {
  const [q, setQ] = useState('')
  const [users, setUsers] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { setUsers([]) }, [])

  const search = async (term: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profiles?q=${encodeURIComponent(term)}`)
      const data = await res.json()
      setUsers(data || [])
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg p-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onKeyDown={(e)=>{ if (e.key==='Enter') search(q) }}
          placeholder="Buscar usuários por @username ou nome"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
        />
        <button onClick={()=>search(q)} className="btn-primary">Buscar</button>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Usuários</h2>
        {loading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-500">Nenhum usuário encontrado</div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                  {u.avatar ? <img src={u.avatar} className="w-10 h-10 object-cover" /> : <span className="text-sm text-gray-500 flex items-center justify-center h-full">👤</span>}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{u.displayName}</div>
                  <div className="text-sm text-gray-600">@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


