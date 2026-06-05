import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function VendrePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <section className="bg-[#1B2A4A] text-white section">
          <div className="container-immo text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vendez votre bien{' '}
              <span className="font-serif-italic">sans commission</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              250€ fixes, paiement unique. Votre annonce reste active jusqu'à la vente.
            </p>
            <Link href="/estimation" className="btn-cta mr-4">Estimer mon bien</Link>
            <Link href="/vendre/creer" className="btn-outline-light">Publier directement</Link>
          </div>
        </section>

        <section className="section">
          <div className="container-immo max-w-2xl">
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-8 text-center">Ce qui est inclus</h2>
            <div className="space-y-4">
              {[
                "Annonce visible sur IMMONOV jusqu'à la vente",
                "Photos illimitées (jusqu'à 20)",
                'Messagerie directe avec les acheteurs',
                'Gestion des demandes de visite',
                'Tableau de bord vendeur complet',
                '0% de commission sur la vente',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 card-immo p-4">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/vendre/creer" className="btn-primary">
                Créer mon annonce — 250€ <ArrowRight className="inline ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
