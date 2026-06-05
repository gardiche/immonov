import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, CheckCircle, MessageSquare, Home, TrendingDown } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white section">
          <div className="container-immo text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-8">
              <TrendingDown className="h-4 w-4 text-[#4A6FD4]" />
              Économisez jusqu'à <strong>15 000€</strong> sur votre vente
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
              Vendez votre bien{' '}
              <span className="font-serif-italic">sans commission</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              250€ fixes au lieu de 5% de commission. Publiez votre annonce, contactez les acheteurs en direct.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/vendre/creer" className="btn-cta">
                Publier mon annonce — 250€
              </Link>
              <Link href="/annonces" className="btn-outline-light">
                Voir les annonces
              </Link>
            </div>

            {/* Comparatif */}
            <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-6 text-left">
                <p className="text-white/50 text-sm mb-1">Agence traditionnelle</p>
                <p className="text-3xl font-bold text-red-400">~15 000€</p>
                <p className="text-white/40 text-sm mt-1">5% de commission</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-left">
                <p className="text-white/70 text-sm mb-1">IMMONOV</p>
                <p className="text-3xl font-bold text-green-400">250€</p>
                <p className="text-white/60 text-sm mt-1">Forfait fixe — c'est tout</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="section bg-[color:var(--off-white)]">
          <div className="container-immo">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
                Comment ça <span className="font-serif-italic">marche</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Simple, transparent, efficace. Trois étapes pour vendre votre bien.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: Home,
                  title: 'Créez votre annonce',
                  desc: 'Renseignez les infos de votre bien, ajoutez vos photos, fixez votre prix.',
                },
                {
                  step: '02',
                  icon: CheckCircle,
                  title: 'Payez 250€',
                  desc: 'Un forfait fixe unique. Votre annonce est publiée immédiatement.',
                },
                {
                  step: '03',
                  icon: MessageSquare,
                  title: 'Échangez en direct',
                  desc: 'Les acheteurs vous contactent directement. Planifiez vos visites.',
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="card-immo p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#4A6FD4] font-bold text-sm">{step}</span>
                    <div className="h-10 w-10 rounded-full bg-[#4A6FD4]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#4A6FD4]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="section bg-[#1B2A4A] text-white">
          <div className="container-immo">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '98,3%', label: 'Du prix conservé' },
                { value: '250€', label: 'Forfait unique' },
                { value: '0€', label: 'De commission' },
                { value: '100%', label: 'Transparent' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-4xl font-bold text-white mb-2">{value}</p>
                  <p className="text-white/60 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section bg-[color:var(--off-white)]">
          <div className="container-immo text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Prêt à vendre <span className="font-serif-italic">sans frais</span> ?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Rejoignez les milliers de particuliers qui ont déjà économisé sur leur vente immobilière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vendre/creer" className="btn-primary">
                Créer mon annonce <ArrowRight className="inline ml-2 h-4 w-4" />
              </Link>
              <Link href="/estimation" className="btn-outline-dark">
                Estimer mon bien
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
