import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PaiementContent from './PaiementContent'

export default function PaiementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <p className="text-gray-500">Chargement...</p>
          </div>
        }>
          <PaiementContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
