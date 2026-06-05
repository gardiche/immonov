import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Maximize2, Home, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('title, description, photos').eq('id', id).single()
  if (!data) return { title: 'Annonce introuvable' }

  return {
    title: `${data.title} — IMMONOV`,
    description: data.description?.slice(0, 160) ?? '',
    openGraph: { images: data.photos?.[0] ? [{ url: data.photos[0] }] : [] },
  }
}

const typeLabel: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain', autre: 'Autre',
}

export default async function AnnonceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*, profiles(first_name, last_name, phone)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!property) notFound()

  await supabase
    .from('properties')
    .update({ views_count: (property.views_count ?? 0) + 1 })
    .eq('id', id)

  const seller = (property as any).profiles

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Galerie + infos */}
              <div className="lg:col-span-2 space-y-6">
                {/* Galerie */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                  {property.photos?.slice(0, 4).map((url: string, i: number) => (
                    <div key={i} className={`relative ${i === 0 ? 'col-span-2 h-72' : 'h-40'} bg-gray-100`}>
                      <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  {(!property.photos || property.photos.length === 0) && (
                    <div className="col-span-2 h-72 bg-gray-100 flex items-center justify-center rounded-2xl">
                      <Home className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="card-immo p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-semibold text-[#4A6FD4] bg-[#4A6FD4]/10 px-2.5 py-1 rounded-full">
                        {typeLabel[property.property_type]}
                      </span>
                      <h1 className="text-2xl font-bold text-[#1B2A4A] mt-3">{property.title}</h1>
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        {property.address && `${property.address}, `}{property.city} {property.postal_code}
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-[#1B2A4A]">
                      {Number(property.price).toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  <div className="flex items-center gap-6 py-4 border-y border-[color:var(--border)] my-4 text-sm text-gray-600">
                    {property.surface && (
                      <span className="flex items-center gap-1.5">
                        <Maximize2 className="h-4 w-4 text-[#4A6FD4]" />
                        {property.surface} m²
                      </span>
                    )}
                    {property.rooms && (
                      <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
                    )}
                    <span className="flex items-center gap-1.5 ml-auto text-gray-400">
                      <Eye className="h-4 w-4" />
                      {property.views_count} vue{property.views_count > 1 ? 's' : ''}
                    </span>
                  </div>

                  {property.description && (
                    <div>
                      <h2 className="font-semibold text-[#1B2A4A] mb-2">Description</h2>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar contact */}
              <div className="space-y-4">
                <div className="card-immo p-6 sticky top-24">
                  <h3 className="font-bold text-[#1B2A4A] mb-1">Contacter le vendeur</h3>
                  <p className="text-sm text-gray-500 mb-5">
                    {seller?.first_name} {seller?.last_name}
                  </p>

                  <div className="space-y-3">
                    <a
                      href={`tel:${seller?.phone}`}
                      className={`btn-primary w-full text-sm ${!seller?.phone ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Appeler le vendeur
                    </a>
                    <button className="btn-outline-dark w-full text-sm">
                      Envoyer un message
                    </button>
                    <button className="btn-outline-dark w-full text-sm">
                      Demander une visite
                    </button>
                  </div>

                  {property.visit_price > 0 && (
                    <p className="text-xs text-gray-400 mt-4 text-center">
                      Visite : {property.visit_price}€
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
