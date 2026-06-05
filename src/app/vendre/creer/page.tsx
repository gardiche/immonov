'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

type Step = 1 | 2 | 3 | 4

interface FormData {
  property_type: string
  surface: string
  rooms: string
  address: string
  city: string
  postal_code: string
  title: string
  description: string
  price: string
  visit_price: string
  photos: string[]
}

const INITIAL: FormData = {
  property_type: 'appartement',
  surface: '',
  rooms: '',
  address: '',
  city: '',
  postal_code: '',
  title: '',
  description: '',
  price: '',
  visit_price: '50',
  photos: [],
}

export default function CreerAnnoncePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('immonov_estimation')
    if (saved) {
      try {
        const est = JSON.parse(saved)
        setForm((f) => ({
          ...f,
          surface: est.surface ?? f.surface,
          property_type: est.type_bien ?? f.property_type,
          address: est.address ?? f.address,
          city: est.city ?? f.city,
          postal_code: est.postal_code ?? f.postal_code,
          price: est.prix_median ? String(est.prix_median) : f.price,
        }))
      } catch {}
    }
  }, [])

  function set(key: keyof FormData, value: string | string[]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function uploadPhotos(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Non authentifié'); setUploading(false); return }

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('property-photos').upload(path, file)
      if (error) { toast.error(`Erreur upload: ${error.message}`); continue }
      const { data } = supabase.storage.from('property-photos').getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    set('photos', [...form.photos, ...urls])
    setUploading(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Non authentifié'); setSubmitting(false); return }

    const { data, error } = await supabase
      .from('properties')
      .insert({
        seller_id: user.id,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        surface: form.surface ? Number(form.surface) : null,
        rooms: form.rooms ? Number(form.rooms) : null,
        property_type: form.property_type,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        photos: form.photos,
        visit_price: Number(form.visit_price),
        status: 'pending_payment',
      })
      .select('id')
      .single()

    if (error || !data) {
      toast.error('Erreur lors de la création')
      setSubmitting(false)
      return
    }

    router.push(`/vendre/paiement?property_id=${data.id}`)
  }

  const typeOptions = [
    { value: 'appartement', label: 'Appartement' },
    { value: 'maison', label: 'Maison' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'autre', label: 'Autre' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--off-white)]">
      <Navbar />
      <main className="flex-1">
        <div className="section">
          <div className="container-immo max-w-2xl">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-10">
              {([1, 2, 3, 4] as Step[]).map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${s <= step ? 'bg-[#1B2A4A] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-[#1B2A4A]' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="card-immo p-8">
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Votre bien</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de bien</label>
                    <select className="input" value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
                      {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Surface (m²)</label>
                      <input className="input" type="number" value={form.surface} onChange={(e) => set('surface', e.target.value)} placeholder="75" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pièces</label>
                      <input className="input" type="number" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} placeholder="3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                    <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="12 rue de la Paix" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                      <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Paris" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Code postal</label>
                      <input className="input" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="75001" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Titre & Prix</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre de l'annonce</label>
                    <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Bel appartement 3 pièces lumineux..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description <span className="text-gray-400">(min. 100 caractères)</span>
                    </label>
                    <textarea
                      className="input min-h-[140px] resize-none"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Décrivez votre bien en détail : exposition, rénovations, atouts du quartier..."
                    />
                    <p className={`text-xs mt-1 ${form.description.length < 100 ? 'text-orange-500' : 'text-green-600'}`}>
                      {form.description.length} / 100 caractères minimum
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix de vente (€)</label>
                      <input className="input" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="280000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix de visite (€ min. 10)</label>
                      <input className="input" type="number" value={form.visit_price} onChange={(e) => set('visit_price', e.target.value)} min="10" placeholder="50" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Photos</h2>
                  <p className="text-sm text-gray-500">Minimum 3 photos, maximum 20.</p>

                  <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#4A6FD4] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && uploadPhotos(e.target.files)}
                    />
                    {uploading ? (
                      <p className="text-sm text-gray-500">Upload en cours...</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#1B2A4A]">Cliquez pour ajouter des photos</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 10 Mo par photo</p>
                      </>
                    )}
                  </label>

                  {form.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {form.photos.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500">{form.photos.length} photo(s) ajoutée(s)</p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Récapitulatif</h2>

                  <div className="bg-[color:var(--off-white)] rounded-xl p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{form.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Surface</span>
                      <span className="font-medium">{form.surface} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ville</span>
                      <span className="font-medium">{form.city} {form.postal_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prix</span>
                      <span className="font-bold text-[#1B2A4A]">{Number(form.price).toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Photos</span>
                      <span className="font-medium">{form.photos.length} photo(s)</span>
                    </div>
                  </div>

                  <div className="border border-[#1B2A4A]/10 rounded-xl p-5 bg-[#1B2A4A]/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#1B2A4A]">Frais de publication</p>
                        <p className="text-xs text-gray-500">Forfait unique, sans commission</p>
                      </div>
                      <p className="text-2xl font-bold text-[#1B2A4A]">250€</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-[color:var(--border)]">
                {step > 1 ? (
                  <button onClick={() => setStep((s) => (s - 1) as Step)} className="btn-outline-dark text-sm px-6 py-2.5">
                    Retour
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    onClick={() => {
                      if (step === 2 && form.description.length < 100) {
                        toast.error('La description doit faire au moins 100 caractères')
                        return
                      }
                      if (step === 3 && form.photos.length < 3) {
                        toast.error('Ajoutez au moins 3 photos')
                        return
                      }
                      setStep((s) => (s + 1) as Step)
                    }}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    {submitting ? 'Création...' : 'Publier — 250€'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
