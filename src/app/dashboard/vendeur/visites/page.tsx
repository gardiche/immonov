import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VisitesVendeurClient from './VisitesVendeurClient'

export default async function VisitesVendeurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const { data: visits } = await supabase
    .from('visits')
    .select('*, properties(title, city), profiles!visits_buyer_id_fkey(first_name, last_name, phone)')
    .eq('properties.seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-8">Demandes de visite</h1>
            <VisitesVendeurClient visits={visits ?? []} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
