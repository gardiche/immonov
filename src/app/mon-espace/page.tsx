import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function MonEspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.first_name ?? 'vous'

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo max-w-3xl">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">
              Bonjour, <span className="font-serif-italic">{firstName}</span> 👋
            </h1>
            <p className="text-gray-500 mb-10">Que souhaitez-vous faire aujourd'hui ?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/dashboard/vendeur" className="card-immo p-8 bg-[#1B2A4A] text-white hover:bg-[#141F38] transition-colors group">
                <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center mb-6">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Espace vendeur</h2>
                <p className="text-white/60 text-sm">Gérez vos annonces, visites et messages avec les acheteurs.</p>
              </Link>

              <Link href="/dashboard/acheteur" className="card-immo p-8 bg-[#4A6FD4] text-white hover:bg-[#2E4DA0] transition-colors group">
                <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center mb-6">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Espace acheteur</h2>
                <p className="text-white/60 text-sm">Retrouvez vos favoris, visites planifiées et conversations.</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
