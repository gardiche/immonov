import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Maximize2, Home } from 'lucide-react'
import type { Property } from '@/types/database'

const typeLabel: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  terrain: 'Terrain',
  autre: 'Autre',
}

export default function AnnonceCard({ property }: { property: Property }) {
  const photo = property.photos?.[0] ?? null

  return (
    <Link href={`/annonces/${property.id}`} className="card-immo overflow-hidden block group">
      <div className="relative h-52 bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white text-[#1B2A4A] text-xs font-semibold px-2.5 py-1 rounded-full shadow">
          {typeLabel[property.property_type] ?? property.property_type}
        </span>
      </div>

      <div className="p-5">
        <p className="font-bold text-[#1B2A4A] text-lg leading-tight mb-1 line-clamp-1">{property.title}</p>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{property.city ?? 'France'}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-[#1B2A4A]">
            {Number(property.price).toLocaleString('fr-FR')} €
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {property.surface && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5" />
                {property.surface} m²
              </span>
            )}
            {property.rooms && (
              <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
