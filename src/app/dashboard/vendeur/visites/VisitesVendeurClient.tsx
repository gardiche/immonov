'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Refusée', color: 'bg-red-100 text-red-600', icon: XCircle },
  done: { label: 'Effectuée', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
}

export default function VisitesVendeurClient({ visits: initial }: { visits: any[] }) {
  const [visits, setVisits] = useState(initial)

  async function updateStatus(id: string, status: 'confirmed' | 'declined') {
    const res = await fetch(`/api/visites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) { toast.error('Erreur'); return }

    setVisits((v) => v.map((item) => item.id === id ? { ...item, status } : item))
    toast.success(status === 'confirmed' ? 'Visite confirmée' : 'Visite refusée')
  }

  if (visits.length === 0) {
    return (
      <div className="card-immo p-12 text-center text-gray-400">
        Aucune demande de visite pour l'instant.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => {
        const config = statusConfig[visit.status as keyof typeof statusConfig] ?? statusConfig.pending
        const Icon = config.icon
        const buyer = visit.profiles

        return (
          <div key={visit.id} className="card-immo p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-[#1B2A4A]">{visit.properties?.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{visit.properties?.city}</p>

                <div className="mt-3 text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Acheteur :</span> {buyer?.first_name} {buyer?.last_name}
                    {buyer?.phone && ` — ${buyer.phone}`}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Date souhaitée :</span>{' '}
                    {format(new Date(visit.requested_date), 'PPP à HH:mm', { locale: fr })}
                  </p>
                  {visit.message && (
                    <p className="text-gray-500 italic">"{visit.message}"</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </span>

                {visit.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(visit.id, 'declined')}
                      className="btn-outline-dark text-xs px-3 py-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => updateStatus(visit.id, 'confirmed')}
                      className="btn-primary text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700"
                    >
                      Confirmer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
