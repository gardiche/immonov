'use client'

import { Download } from 'lucide-react'

export default function AdminClient({ properties }: { properties: any[] }) {
  function exportXML() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://immonov.fr'
    const items = properties.map((p) => {
      const seller = p.profiles
      return `  <bien>
    <reference>${p.id}</reference>
    <type_transaction>Vente</type_transaction>
    <type_bien>${p.property_type}</type_bien>
    <titre><![CDATA[${p.title}]]></titre>
    <description><![CDATA[${p.description ?? ''}]]></description>
    <prix>${p.price}</prix>
    <surface>${p.surface ?? ''}</surface>
    <nb_pieces>${p.rooms ?? ''}</nb_pieces>
    <ville>${p.city ?? ''}</ville>
    <code_postal>${p.postal_code ?? ''}</code_postal>
    <adresse><![CDATA[${p.address ?? ''}]]></adresse>
    <url>${appUrl}/annonces/${p.id}</url>
    <date_publication>${p.published_at ?? ''}</date_publication>
    <contact>
      <nom>${seller?.first_name ?? ''} ${seller?.last_name ?? ''}</nom>
      <tel>${seller?.phone ?? ''}</tel>
    </contact>
    <photos>
      ${(p.photos ?? []).map((url: string) => `<photo>${url}</photo>`).join('\n      ')}
    </photos>
  </bien>`
    }).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<annonces>
${items}
</annonces>`

    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `immonov-export-${new Date().toISOString().split('T')[0]}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#1B2A4A]">Annonces actives</h2>
        <button onClick={exportXML} className="btn-outline-dark text-sm px-4 py-2 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export XML
        </button>
      </div>

      <div className="card-immo overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--off-white)] border-b border-[color:var(--border)]">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Bien</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Vendeur</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Prix</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Ville</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Vues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#1B2A4A]">{p.title}</td>
                <td className="px-6 py-4 text-gray-600">{p.profiles?.first_name} {p.profiles?.last_name}</td>
                <td className="px-6 py-4 text-gray-600">{Number(p.price).toLocaleString('fr-FR')} €</td>
                <td className="px-6 py-4 text-gray-600">{p.city}</td>
                <td className="px-6 py-4 text-gray-600">{p.views_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
