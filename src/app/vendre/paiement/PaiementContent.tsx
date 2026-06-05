'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, MapPin, Maximize2 } from 'lucide-react'
import type { Property } from '@/types/database'

export default function PaiementContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const propertyId = searchParams.get('property_id')
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!propertyId) { router.push('/dashboard/vendeur'); return }
    const supabase = createClient()
    supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()
      .then(({ data }) => {
        if (!data) { router.push('/dashboard/vendeur'); return }
        setProperty(data as Property)
        setLoading(false)
      })
  }, [propertyId, router])

  async function handlePayment() {
    if (!propertyId) return
    setPaying(true)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    })

    const data = await res.json()

    if (!res.ok || !data.url) {
      toast.error(data.error ?? 'Erreur lors du paiement')
      setPaying(false)
      return
    }

    window.location.href = data.url
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container-immo max-w-2xl">
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-8">Finaliser la publication</h1>

        {property && (
          <div className="card-immo p-6 mb-6">
            <h2 className="font-bold text-[#1B2A4A] mb-1">{property.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{property.city}</span>
              {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{property.surface} m²</span>}
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{Number(property.price).toLocaleString('fr-FR')} €</p>
          </div>
        )}

        <div className="card-immo p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-[#1B2A4A]">Forfait publication IMMONOV</p>
              <p className="text-sm text-gray-500">Annonce active jusqu&apos;à la vente</p>
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">250€</p>
          </div>

          <ul className="space-y-2">
            {[
              'Annonce visible sur IMMONOV',
              'Messagerie intégrée avec les acheteurs',
              'Gestion des visites',
              'Aucune commission à la vente',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying}
          className="btn-primary w-full py-4 text-base"
        >
          {paying ? 'Redirection...' : 'Payer 250€ et publier mon annonce'}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Paiement sécurisé par Stripe. Vos données bancaires ne nous sont jamais transmises.
        </p>
      </div>
    </div>
  )
}
