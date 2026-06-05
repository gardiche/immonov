import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MessagerieClient from '@/components/messaging/MessagerieClient'

export default async function MessagesVendeurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, properties(title, city), profiles!conversations_buyer_id_fkey(first_name, last_name)')
    .eq('seller_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-8">Messagerie</h1>
            <MessagerieClient conversations={conversations ?? []} currentUserId={user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
