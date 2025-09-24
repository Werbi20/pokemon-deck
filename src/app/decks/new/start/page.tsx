'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function NewDeckStartPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [format, setFormat] = useState('Standard')
  const [mode, setMode] = useState<'create' | 'import'>('create')
  const [importText, setImportText] = useState('')

  const handleContinue = () => {
    const params = new URLSearchParams()
    if (name.trim()) params.set('name', name.trim())
    if (format) params.set('format', format)
    if (mode === 'import' && importText.trim()) {
      params.set('importFormat', 'text')
      params.set('importContent', encodeURIComponent(importText.trim()))
    }
    router.push(`/decks/new?${params.toString()}`)
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Novo Deck</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Deck</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Charizard ex"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
              >
                <option value="Standard">Standard</option>
                <option value="Expanded">Expanded</option>
                <option value="Limited">Limited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Como deseja começar?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="create"
                    checked={mode === 'create'}
                    onChange={() => setMode('create')}
                  />
                  <span>Criar do zero</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="import"
                    checked={mode === 'import'}
                    onChange={() => setMode('import')}
                  />
                  <span>Importar lista (texto)</span>
                </label>
              </div>
            </div>

            {mode === 'import' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cole a lista</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
                  placeholder={"Pokémon: 21\n3 Charcadet PAR 26\n..."}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => router.push('/decks')} className="btn-secondary">Cancelar</button>
              <button onClick={handleContinue} className="btn-primary">Continuar</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}


