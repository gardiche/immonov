import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Refusée', color: 'bg-red-100 text-red-600', icon: XCircle },
  done: { label: 'Effectuée', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
}

export default async function VisitesAcheteurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/connexion')

  const { data: visits } = await supabase
    .from('visits')
    .select('*, properties(title, city)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo">
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-8">Mes visites</h1>

            {!visits || visits.length === 0 ? (
              <div className="card-immo p-12 text-center text-gray-400">
                Vous n'avez pas encore demandé de visite.
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => {
                  const config = statusConfig[visit.status as keyof typeof statusConfig] ?? statusConfig.pending
                  const Icon = config.icon

                  return (
                    <div key={visit.id} className="card-immo p-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1B2A4A]">{visit.properties?.title}</p>
                        <p className="text-sm text-gray-500">{visit.properties?.city}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {format(new Date(visit.requested_date), 'PPP à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${config.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
