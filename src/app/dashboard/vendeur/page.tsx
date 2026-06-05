import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Heart, Calendar, MessageSquare, Plus, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function DashboardVendeurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const [profileRes, propertiesRes, visitsRes, conversationsRes] = await Promise.all([
    supabase.from('profiles').select('first_name').eq('id', user.id).single(),
    supabase.from('properties').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
    supabase.from('visits').select('id').eq('property_id', user.id),
    supabase.from('conversations').select('id').eq('seller_id', user.id),
  ])

  const firstName = profileRes.data?.first_name ?? ''
  const properties = propertiesRes.data ?? []
  const totalViews = properties.reduce((acc, p) => acc + (p.views_count ?? 0), 0)

  const favoritesRes = await supabase
    .from('favorites')
    .select('id')
    .in('property_id', properties.map(p => p.id))

  const stats = [
    { icon: Eye, label: 'Vues totales', value: totalViews },
    { icon: Heart, label: 'Favoris', value: favoritesRes.data?.length ?? 0 },
    { icon: Calendar, label: 'Visites demandées', value: visitsRes.data?.length ?? 0 },
    { icon: MessageSquare, label: 'Conversations', value: conversationsRes.data?.length ?? 0 },
  ]

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
    pending_payment: { label: 'En attente de paiement', color: 'bg-yellow-100 text-yellow-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    sold: { label: 'Vendue', color: 'bg-blue-100 text-blue-700' },
    archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-500' },
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Bonjour, {firstName}</h1>
                <p className="text-gray-500 text-sm mt-1">Tableau de bord vendeur</p>
              </div>
              <div className="flex gap-3">
                <Link href="/estimation" className="btn-outline-dark text-sm px-5 py-2">
                  <BarChart2 className="inline h-4 w-4 mr-1.5" /> Estimer
                </Link>
                <Link href="/vendre/creer" className="btn-primary text-sm px-5 py-2">
                  <Plus className="inline h-4 w-4 mr-1.5" /> Créer une annonce
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="card-immo p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-[#4A6FD4]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#4A6FD4]" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Annonces */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Mes annonces</h2>
              {properties.length === 0 ? (
                <div className="card-immo p-12 text-center text-gray-400">
                  <p className="mb-4">Aucune annonce pour l'instant.</p>
                  <Link href="/vendre/creer" className="btn-primary text-sm px-6 py-2.5">
                    Créer ma première annonce
                  </Link>
                </div>
              ) : (
                <div className="card-immo overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[color:var(--off-white)] border-b border-[color:var(--border)]">
                      <tr>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Bien</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Statut</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Prix</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Ville</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Vues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                      {properties.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-[#1B2A4A]">{p.title}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusLabel[p.status]?.color}`}>
                              {statusLabel[p.status]?.label ?? p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{Number(p.price).toLocaleString('fr-FR')} €</td>
                          <td className="px-6 py-4 text-gray-600">{p.city ?? '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{p.views_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Raccourcis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/vendeur/messages" className="card-immo p-6 flex items-center gap-4 hover:border-[#4A6FD4]/30">
                <div className="h-10 w-10 rounded-full bg-[#4A6FD4]/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-[#4A6FD4]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A]">Messagerie</p>
                  <p className="text-sm text-gray-500">{conversationsRes.data?.length ?? 0} conversation(s)</p>
                </div>
              </Link>
              <Link href="/dashboard/vendeur/visites" className="card-immo p-6 flex items-center gap-4 hover:border-[#4A6FD4]/30">
                <div className="h-10 w-10 rounded-full bg-[#4A6FD4]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#4A6FD4]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A]">Visites</p>
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
