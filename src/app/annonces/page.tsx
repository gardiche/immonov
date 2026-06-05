import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import AnnoncesFiltres from './AnnoncesFiltres'
import type { Property } from '@/types/database'

export const revalidate = 60

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<{ ville?: string; type?: string; prix_max?: string; tri?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')

  if (params.ville) query = query.ilike('city', `%${params.ville}%`)
  if (params.type) query = query.eq('property_type', params.type)
  if (params.prix_max) query = query.lte('price', Number(params.prix_max))

  if (params.tri === 'prix_asc') query = query.order('price', { ascending: true })
  else if (params.tri === 'prix_desc') query = query.order('price', { ascending: false })
  else query = query.order('published_at', { ascending: false })

  const { data: properties } = await query

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-[#1B2A4A] text-white py-14">
          <div className="container-immo">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Trouvez votre prochain{' '}
              <span className="font-serif-italic">chez-vous</span>
            </h1>
            <p className="text-white/60">{properties?.length ?? 0} annonce{(properties?.length ?? 0) > 1 ? 's' : ''} disponible{(properties?.length ?? 0) > 1 ? 's' : ''}</p>
          </div>
        </section>

        {/* Filtres */}
        <div className="container-immo -mt-6 relative z-10 mb-10">
          <AnnoncesFiltres />
        </div>

        {/* Grille */}
        <div className="container-immo pb-20">
          {!properties || properties.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Aucune annonce ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <AnnonceCard key={p.id} property={p as Property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
