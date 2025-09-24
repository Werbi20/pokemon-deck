'use client'

import { useState, useEffect } from 'react'

interface FilterData {
  sets: Array<{ id: string; name: string; series: string }>
  types: string[]
  subtypes: string[]
  rarities: string[]
  legalities: string[]
  regulationMarks: string[]
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function AdvancedFilters({ 
  onFiltersChange, 
  showFilters, 
  onToggleFilters 
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [filterData, setFilterData] = useState<FilterData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cards/filters')
      const data = await response.json()
      setFilterData(data)
    } catch (error) {
      console.error('Erro ao carregar filtros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pokemon-blue"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Filtros Avançados
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpar Filtros
          </button>
          <button
            onClick={onToggleFilters}
            className="text-sm text-pokemon-blue hover:text-pokemon-blue-dark"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {showFilters && filterData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Set */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coleção
            </label>
            <select
              value={filters.set || ''}
              onChange={(e) => handleFilterChange('set', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todas as coleções</option>
              {filterData.sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          {/* Raridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raridade
            </label>
            <select
              value={filters.rarity || ''}
              onChange={(e) => handleFilterChange('rarity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todas as raridades</option>
              {filterData.rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filters.types || ''}
              onChange={(e) => handleFilterChange('types', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todos os tipos</option>
              {filterData.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Subtipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtipo
            </label>
            <select
              value={filters.subtypes || ''}
              onChange={(e) => handleFilterChange('subtypes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todos os subtipos</option>
              {filterData.subtypes.map((subtype) => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>

          {/* HP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HP
            </label>
            <select
              value={filters.hp || ''}
              onChange={(e) => handleFilterChange('hp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Qualquer HP</option>
              <option value="0-50">0-50</option>
              <option value="51-100">51-100</option>
              <option value="101-150">101-150</option>
              <option value="151-200">151-200</option>
              <option value="201-250">201-250</option>
              <option value="251-300">251-300</option>
              <option value="301+">301+</option>
            </select>
          </div>

          {/* Custo de Recuo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo de Recuo
            </label>
            <select
              value={filters.convertedRetreatCost || ''}
              onChange={(e) => handleFilterChange('convertedRetreatCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Qualquer custo</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Custo de Ataque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo de Ataque
            </label>
            <select
              value={filters.attackCost || ''}
              onChange={(e) => handleFilterChange('attackCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Qualquer custo</option>
              <option value="Grass">Grama</option>
              <option value="Fire">Fogo</option>
              <option value="Water">Água</option>
              <option value="Lightning">Elétrica</option>
              <option value="Psychic">Psíquica</option>
              <option value="Fighting">Luta</option>
              <option value="Darkness">Escuridão</option>
              <option value="Metal">Metal</option>
              <option value="Fairy">Fada</option>
              <option value="Dragon">Dragão</option>
              <option value="Colorless">Incolor</option>
            </select>
          </div>

          {/* Dano do Ataque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dano do Ataque
            </label>
            <select
              value={filters.attackDamage || ''}
              onChange={(e) => handleFilterChange('attackDamage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Qualquer dano</option>
              <option value="0-50">0-50</option>
              <option value="51-100">51-100</option>
              <option value="101-150">101-150</option>
              <option value="151-200">151-200</option>
              <option value="201-250">201-250</option>
              <option value="251-300">251-300</option>
              <option value="301+">301+</option>
            </select>
          </div>

          {/* Legalidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legalidade
            </label>
            <select
              value={filters.legalities || ''}
              onChange={(e) => handleFilterChange('legalities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todas as legalidades</option>
              {filterData.legalities.map((legality) => (
                <option key={legality} value={legality}>
                  {legality}
                </option>
              ))}
            </select>
          </div>

          {/* Marca de Regulamentação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca de Regulamentação
            </label>
            <select
              value={filters.regulationMark || ''}
              onChange={(e) => handleFilterChange('regulationMark', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pokemon-blue"
            >
              <option value="">Todas as marcas</option>
              {filterData.regulationMarks.map((mark) => (
                <option key={mark} value={mark}>
                  {mark}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filtros ativos */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros Ativos:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pokemon-blue text-white"
              >
                {key}: {value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
