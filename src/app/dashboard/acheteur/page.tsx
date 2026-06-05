import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Calendar, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function DashboardAcheteurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const [profileRes, favoritesRes, visitsRes, conversationsRes] = await Promise.all([
    supabase.from('profiles').select('first_name').eq('id', user.id).single(),
    supabase.from('favorites').select('*, properties(id, title, city, price, photos)').eq('buyer_id', user.id),
    supabase.from('visits').select('id, status').eq('buyer_id', user.id),
    supabase.from('conversations').select('id').eq('buyer_id', user.id),
  ])

  const firstName = profileRes.data?.first_name ?? ''
  const favorites = favoritesRes.data ?? []

  const stats = [
    { icon: Heart, label: 'Favoris', value: favorites.length },
    { icon: Calendar, label: 'Visites', value: visitsRes.data?.length ?? 0 },
    { icon: MessageSquare, label: 'Conversations', value: conversationsRes.data?.length ?? 0 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Bonjour, {firstName}</h1>
              <p className="text-gray-500 text-sm mt-1">Tableau de bord acheteur</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="card-immo p-5">
                  <div className="h-8 w-8 rounded-lg bg-[#4A6FD4]/10 flex items-center justify-center mb-2">
                    <Icon className="h-4 w-4 text-[#4A6FD4]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Favoris */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Mes favoris</h2>
              {favorites.length === 0 ? (
                <div className="card-immo p-12 text-center text-gray-400">
                  <p className="mb-4">Aucun favori pour l'instant.</p>
                  <Link href="/annonces" className="btn-primary text-sm px-6 py-2.5">
                    Parcourir les annonces
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favorites.map((fav: any) => (
                    <Link key={fav.id} href={`/annonces/${fav.properties?.id}`} className="card-immo p-4 block">
                      <p className="font-semibold text-[#1B2A4A] text-sm">{fav.properties?.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{fav.properties?.city}</p>
                      <p className="text-[#4A6FD4] font-bold text-sm mt-2">
                        {Number(fav.properties?.price).toLocaleString('fr-FR')} €
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Raccourcis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/acheteur/messages" className="card-immo p-6 flex items-center gap-4 hover:border-[#4A6FD4]/30">
                <div className="h-10 w-10 rounded-full bg-[#4A6FD4]/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-[#4A6FD4]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A]">Messagerie</p>
                  <p className="text-sm text-gray-500">{conversationsRes.data?.length ?? 0} conversation(s)</p>
                </div>
              </Link>
              <Link href="/dashboard/acheteur/visites" className="card-immo p-6 flex items-center gap-4 hover:border-[#4A6FD4]/30">
                <div className="h-10 w-10 rounded-full bg-[#4A6FD4]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#4A6FD4]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A]">Mes visites</p>
                  <p className="text-sm text-gray-500">{visitsRes.data?.length ?? 0} demande(s)</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
