import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IMMONOV — Vendez sans commission',
  description: "Vendez votre bien immobilier entre particuliers pour 250€ fixes. Économisez jusqu'à 15 000€ de commission.",
  keywords: ['immobilier', 'vente', 'particuliers', 'sans commission', 'annonces'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
