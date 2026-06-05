'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function AnnoncesFiltres() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ville, setVille] = useState(searchParams.get('ville') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? '')
  const [prixMax, setPrixMax] = useState(searchParams.get('prix_max') ?? '')
  const [tri, setTri] = useState(searchParams.get('tri') ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (ville) params.set('ville', ville)
    if (type) params.set('type', type)
    if (prixMax) params.set('prix_max', prixMax)
    if (tri) params.set('tri', tri)
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <div className="card-immo p-5 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          className="input"
          placeholder="Ville..."
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />

        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="appartement">Appartement</option>
          <option value="maison">Maison</option>
          <option value="terrain">Terrain</option>
          <option value="autre">Autre</option>
        </select>

        <input
          className="input"
          placeholder="Prix max (€)"
          type="number"
          value={prixMax}
          onChange={(e) => setPrixMax(e.target.value)}
        />

        <div className="flex gap-2">
          <select className="input flex-1" value={tri} onChange={(e) => setTri(e.target.value)}>
            <option value="">Plus récentes</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
          <button onClick={applyFilters} className="btn-primary px-4 py-2 flex-shrink-0">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
