import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo max-w-3xl">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-8">Politique de confidentialité</h1>
            <div className="card-immo p-8 prose prose-sm max-w-none">
              <h2>Collecte des données</h2>
              <p>
                IMMONOV collecte les données personnelles suivantes lors de votre inscription :
                prénom, nom, adresse email, numéro de téléphone (optionnel).
              </p>

              <h2>Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Gérer votre compte et vos annonces</li>
                <li>Permettre la mise en relation entre vendeurs et acheteurs</li>
                <li>Vous envoyer des notifications liées à votre activité</li>
                <li>Traiter vos paiements (via Stripe, qui traite vos données bancaires de manière sécurisée)</li>
              </ul>

              <h2>Stockage et sécurité</h2>
              <p>
                Vos données sont stockées sur les serveurs de Supabase (hébergé chez AWS) et sont protégées
                par des mesures de sécurité conformes aux standards de l&apos;industrie.
                Vos données bancaires ne transitent jamais par nos serveurs (traitement direct par Stripe).
              </p>

              <h2>Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression
                et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@immonov.com.
              </p>

              <h2>Cookies</h2>
              <p>
                IMMONOV utilise uniquement des cookies essentiels au fonctionnement du site
                (authentification, session). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
