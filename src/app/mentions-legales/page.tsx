import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo max-w-3xl">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-8">Mentions légales</h1>
            <div className="card-immo p-8 prose prose-sm max-w-none">
              <h2>Éditeur du site</h2>
              <p>
                IMMONOV<br />
                Plateforme de vente immobilière entre particuliers<br />
                Email : contact@immonov.com
              </p>

              <h2>Hébergement</h2>
              <p>
                Le site est hébergé par Vercel Inc.<br />
                440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
              </p>

              <h2>Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des contenus (textes, images, graphismes, logo, icônes) présents sur le site IMMONOV
                sont protégés par les lois en vigueur sur la propriété intellectuelle et sont la propriété exclusive
                d&apos;IMMONOV ou de ses partenaires.
              </p>

              <h2>Données personnelles</h2>
              <p>
                Les informations recueillies sur ce site sont traitées conformément au Règlement Général sur la
                Protection des Données (RGPD). Pour plus d&apos;informations, consultez notre{' '}
                <a href="/confidentialite" className="text-[#4A6FD4] hover:underline">politique de confidentialité</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
