import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/mon-espace')

  const [propertiesRes, statsRes] = await Promise.all([
    supabase
      .from('properties')
      .select('*, profiles(first_name, last_name, phone)')
      .eq('status', 'active')
      .order('published_at', { ascending: false }),
    supabase.from('properties').select('price, views_count').eq('status', 'active'),
  ])

  const properties = propertiesRes.data ?? []
  const allActive = statsRes.data ?? []
  const totalViews = allActive.reduce((acc, p) => acc + (p.views_count ?? 0), 0)
  const avgPrice = allActive.length
    ? Math.round(allActive.reduce((acc, p) => acc + Number(p.price), 0) / allActive.length)
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-8">Administration</h1>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="card-immo p-5">
                <p className="text-2xl font-bold text-[#1B2A4A]">{properties.length}</p>
                <p className="text-xs text-gray-500 mt-1">Annonces actives</p>
              </div>
              <div className="card-immo p-5">
                <p className="text-2xl font-bold text-[#1B2A4A]">{totalViews.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-gray-500 mt-1">Vues totales</p>
              </div>
              <div className="card-immo p-5">
                <p className="text-2xl font-bold text-[#1B2A4A]">{avgPrice.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500 mt-1">Prix moyen</p>
              </div>
            </div>

            <AdminClient properties={properties} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
