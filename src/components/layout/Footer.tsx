import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-white">
      <div className="container-immo py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Image src="/images/logo.png" alt="IMMONOV" height={48} width={140} className="h-12 w-auto object-contain brightness-0 invert mb-4" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              La première plateforme de vente immobilière entre particuliers. 250€ fixes, 0% de commission.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Plateforme</h4>
            <ul className="space-y-3">
              <li><Link href="/annonces" className="text-sm text-white/60 hover:text-white transition-colors">Toutes les annonces</Link></li>
              <li><Link href="/vendre" className="text-sm text-white/60 hover:text-white transition-colors">Vendre mon bien</Link></li>
              <li><Link href="/auth/inscription" className="text-sm text-white/60 hover:text-white transition-colors">Créer un compte</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Légal</h4>
            <ul className="space-y-3">
              <li><Link href="/mentions-legales" className="text-sm text-white/60 hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="text-sm text-white/60 hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/cgu" className="text-sm text-white/60 hover:text-white transition-colors">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-white/40">
          © {new Date().getFullYear()} IMMONOV. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
