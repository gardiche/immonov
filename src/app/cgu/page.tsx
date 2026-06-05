import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo max-w-3xl">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-8">Conditions Générales d&apos;Utilisation</h1>
            <div className="card-immo p-8 prose prose-sm max-w-none">
              <h2>1. Objet</h2>
              <p>
                Les présentes CGU régissent l&apos;utilisation de la plateforme IMMONOV,
                service de mise en relation entre vendeurs et acheteurs immobiliers particuliers.
              </p>

              <h2>2. Inscription</h2>
              <p>
                L&apos;inscription est gratuite. Un seul compte permet d&apos;accéder aux fonctionnalités
                vendeur et acheteur. L&apos;utilisateur s&apos;engage à fournir des informations exactes.
              </p>

              <h2>3. Publication d&apos;annonces</h2>
              <p>
                La publication d&apos;une annonce est soumise au paiement d&apos;un forfait unique de 250€ TTC.
                L&apos;annonce reste active jusqu&apos;à la vente du bien ou son archivage par le vendeur.
                Aucune commission n&apos;est prélevée sur la transaction finale.
              </p>

              <h2>4. Responsabilités</h2>
              <p>
                IMMONOV agit en tant qu&apos;intermédiaire technique. La plateforme ne garantit pas
                la véracité des annonces publiées. Les transactions sont conclues directement
                entre les parties.
              </p>

              <h2>5. Paiement</h2>
              <p>
                Les paiements sont traités de manière sécurisée par Stripe.
                Le forfait de publication n&apos;est pas remboursable une fois l&apos;annonce publiée.
              </p>

              <h2>6. Résiliation</h2>
              <p>
                L&apos;utilisateur peut supprimer son compte à tout moment.
                IMMONOV se réserve le droit de suspendre un compte en cas de non-respect des CGU.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
