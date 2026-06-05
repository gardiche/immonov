'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MapPin, ArrowRight, ArrowLeft, TrendingUp, Home, BarChart2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ───── Types ───── */
interface AddressSuggestion {
  label: string
  context: string
  geometry: { coordinates: [number, number] }
  properties: {
    city: string
    postcode: string
    name: string
  }
}

interface EstimationResult {
  fourchette_basse: number
  prix_median: number
  fourchette_haute: number
  prix_m2: number
  nb_transactions: number
  source: string
}

/* ───── Options ───── */
const TYPES_BIEN = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'villa', label: 'Villa' },
  { value: 'terrain', label: 'Terrain' },
]

const USAGES = ['Résidence principale', 'Résidence secondaire', 'Investissement']
const OBJECTIFS = ['Vendre', 'Estimer']

const ETATS = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'tres_bon', label: 'Très bon' },
  { value: 'bon', label: 'Bon' },
  { value: 'rafraichir', label: 'À rafraîchir' },
  { value: 'travaux', label: 'Gros travaux' },
]

const STANDINGS = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_de_gamme', label: 'Haut de gamme' },
  { value: 'luxe', label: 'Luxe' },
]

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non renseigné']

const CHAUFFAGES = [
  { value: 'pac', label: 'Pompe à chaleur' },
  { value: 'gaz', label: 'Gaz' },
  { value: 'bois', label: 'Bois' },
  { value: 'collectif', label: 'Collectif' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'fioul', label: 'Fioul' },
]

const PARKINGS = [
  { value: 'aucun', label: 'Aucun' },
  { value: 'place', label: 'Place' },
  { value: 'box', label: 'Box' },
  { value: 'garage', label: 'Garage' },
  { value: 'double_garage', label: 'Double garage' },
]

const ORIENTATIONS = [
  { value: 'nord', label: 'Nord' },
  { value: 'sud', label: 'Sud' },
  { value: 'est', label: 'Est' },
  { value: 'ouest', label: 'Ouest' },
  { value: 'sudest', label: 'Sud-Est' },
  { value: 'sudouest', label: 'Sud-Ouest' },
  { value: 'estouest', label: 'Est-Ouest' },
]

const VUES = [
  { value: 'vis_a_vis', label: 'Vis-à-vis' },
  { value: 'cour', label: 'Cour' },
  { value: 'degagee', label: 'Dégagée' },
  { value: 'mer_lac_montagne', label: 'Mer / Lac / Montagne' },
  { value: 'exceptionnelle', label: 'Exceptionnelle' },
]

const PARTIES_COMMUNES = [
  { value: 'mauvais', label: 'Mauvais état' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'bon', label: 'Bon état' },
  { value: 'excellent', label: 'Excellent' },
]

/* ───── Component ───── */
export default function EstimationPage() {
  const [step, setStep] = useState<1 | 2 | 'result'>(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EstimationResult | null>(null)

  // Étape 1
  const [addressQuery, setAddressQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)
  const [quartier, setQuartier] = useState('')
  const [typeBien, setTypeBien] = useState('appartement')
  const [usage, setUsage] = useState('Résidence principale')
  const [objectif, setObjectif] = useState('Vendre')
  const [surface, setSurface] = useState('')
  const [pieces, setPieces] = useState('')
  const [chambres, setChambres] = useState('')
  const [anneeConstruction, setAnneeConstruction] = useState('')

  // Étape 2
  const [etat, setEtat] = useState('bon')
  const [standing, setStanding] = useState('standard')
  const [dpe, setDpe] = useState('Non renseigné')
  const [chauffage, setChauffage] = useState('gaz')
  const [parking, setParking] = useState('aucun')
  const [etage, setEtage] = useState('')
  const [ascenseur, setAscenseur] = useState(false)
  const [partiesCommunes, setPartiesCommunes] = useState('moyen')
  const [orientation, setOrientation] = useState('sud')
  const [vue, setVue] = useState('degagee')
  const [balconM2, setBalconM2] = useState('')
  const [terrasseM2, setTerrasseM2] = useState('')
  const [jardinM2, setJardinM2] = useState('')
  const [terrainM2, setTerrainM2] = useState('')
  const [piscine, setPiscine] = useState(false)
  const [cave, setCave] = useState(false)

  const isAppartement = ['appartement', 'studio', 'loft', 'duplex'].includes(typeBien)

  /* ── Autocomplete adresse ── */
  const searchAddress = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`)
      const data = await res.json()
      setSuggestions(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.features ?? []).map((f: any) => ({
          label: f.properties.label,
          context: f.properties.context,
          geometry: f.geometry,
          properties: {
            city: f.properties.city,
            postcode: f.properties.postcode,
            name: f.properties.name,
          },
        }))
      )
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => searchAddress(addressQuery), 300)
    return () => clearTimeout(timeout)
  }, [addressQuery, searchAddress])

  function selectAddress(s: AddressSuggestion) {
    setSelectedAddress(s)
    setAddressQuery(s.label)
    setSuggestions([])
  }

  /* ── Submit estimation ── */
  async function submitEstimation() {
    if (!surface || Number(surface) <= 0) {
      toast.error('La surface est requise')
      return
    }
    setLoading(true)

    const dpeValue = dpe === 'Non renseigné' ? 'nr' : dpe

    try {
      const res = await fetch('/api/estimation/calcul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_bien: typeBien,
          surface: Number(surface),
          lat: selectedAddress?.geometry.coordinates[1] ?? null,
          lon: selectedAddress?.geometry.coordinates[0] ?? null,
          etat,
          standing,
          dpe: dpeValue,
          chauffage,
          parking,
          orientation,
          vue,
          parties_communes: partiesCommunes,
          balcon_m2: Number(balconM2) || 0,
          terrasse_m2: Number(terrasseM2) || 0,
          jardin_m2: Number(jardinM2) || 0,
          terrain_m2: Number(terrainM2) || 0,
          piscine,
          cave,
          annee_construction: anneeConstruction ? Number(anneeConstruction) : null,
          etage: etage ? Number(etage) : undefined,
          ascenseur,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors du calcul')
        setLoading(false)
        return
      }

      setResult(data)

      // Sauvegarder dans localStorage pour pré-remplir la création d'annonce
      localStorage.setItem('immonov_estimation', JSON.stringify({
        ...data,
        surface,
        type_bien: typeBien,
        address: selectedAddress?.properties.name ?? '',
        city: selectedAddress?.properties.city ?? '',
        postal_code: selectedAddress?.properties.postcode ?? '',
      }))

      setStep('result')
    } catch {
      toast.error('Erreur réseau')
    }

    setLoading(false)
  }

  /* ── Helpers UI ── */
  function fmt(n: number) { return n.toLocaleString('fr-FR') }

  function SelectField({ label, value, onChange, options }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }

  function NumberField({ label, value, onChange, placeholder, suffix }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
          <input className="input" type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
          {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>}
        </div>
      </div>
    )
  }

  function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? 'bg-[#1B2A4A] border-[#1B2A4A]' : 'border-gray-300 group-hover:border-gray-400'}`}>
          {checked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    )
  }

  /* ───── RENDER ───── */
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-[#1B2A4A] text-white py-14">
          <div className="container-immo">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Estimez votre bien <span className="font-serif-italic">gratuitement</span>
            </h1>
            <p className="text-white/60">Obtenez une fourchette de prix basée sur les transactions réelles de votre quartier.</p>
          </div>
        </section>

        <div className="container-immo max-w-3xl -mt-6 relative z-10 pb-20">
          {/* ─── RÉSULTAT ─── */}
          {step === 'result' && result && (
            <div className="space-y-6">
              <div className="card-immo p-8 text-center">
                <p className="text-sm font-medium text-[#4A6FD4] mb-2">Estimation de votre bien</p>
                <p className="text-5xl font-bold text-[#1B2A4A] mb-1">{fmt(result.prix_median)} €</p>
                <p className="text-gray-500 text-sm">Prix médian estimé</p>

                <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t">
                  <div>
                    <p className="text-xl font-bold text-[#1B2A4A]">{fmt(result.fourchette_basse)} €</p>
                    <p className="text-xs text-gray-500 mt-0.5">Fourchette basse</p>
                  </div>
                  <div className="h-12 w-px bg-gray-200" />
                  <div>
                    <p className="text-xl font-bold text-[#1B2A4A]">{fmt(result.fourchette_haute)} €</p>
                    <p className="text-xs text-gray-500 mt-0.5">Fourchette haute</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-immo p-5 text-center">
                  <BarChart2 className="h-5 w-5 text-[#4A6FD4] mx-auto mb-2" />
                  <p className="text-lg font-bold text-[#1B2A4A]">{fmt(result.prix_m2)} €/m²</p>
                  <p className="text-xs text-gray-500 mt-0.5">Prix au mètre carré</p>
                </div>
                <div className="card-immo p-5 text-center">
                  <TrendingUp className="h-5 w-5 text-[#4A6FD4] mx-auto mb-2" />
                  <p className="text-lg font-bold text-[#1B2A4A]">{result.nb_transactions}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Transactions analysées</p>
                </div>
              </div>

              <p className="text-xs text-center text-gray-400">
                Source : {result.source === 'national' ? 'Données nationales (médiane)' : `Transactions à proximité (${result.source})`}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/vendre/creer" className="btn-primary">
                  Publier mon annonce — 250€ <ArrowRight className="inline ml-2 h-4 w-4" />
                </Link>
                <button onClick={() => { setStep(1); setResult(null) }} className="btn-outline-dark">
                  Nouvelle estimation
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 1 ─── */}
          {step === 1 && (
            <div className="card-immo p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-bold text-[#1B2A4A]">Votre bien</p>
                  <p className="text-sm text-gray-500">Localisation et caractéristiques principales</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Adresse autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="input pl-10"
                      placeholder="Commencez à taper votre adresse..."
                      value={addressQuery}
                      onChange={(e) => { setAddressQuery(e.target.value); setSelectedAddress(null) }}
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg overflow-hidden">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            className="w-full text-left px-4 py-3 text-sm hover:bg-[#F7F8FA] transition-colors border-b last:border-b-0"
                            onClick={() => selectAddress(s)}
                          >
                            <span className="font-medium text-[#1B2A4A]">{s.label}</span>
                            <span className="block text-xs text-gray-400 mt-0.5">{s.context}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <NumberField label="Quartier (optionnel)" value={quartier} onChange={setQuartier} placeholder="Centre-ville, Presqu'île..." />

                <SelectField label="Type de bien" value={typeBien} onChange={setTypeBien} options={TYPES_BIEN} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage</label>
                    <select className="input" value={usage} onChange={(e) => setUsage(e.target.value)}>
                      {USAGES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Objectif</label>
                    <select className="input" value={objectif} onChange={(e) => setObjectif(e.target.value)}>
                      {OBJECTIFS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumberField label="Surface" value={surface} onChange={setSurface} placeholder="75" suffix="m²" />
                  <NumberField label="Pièces" value={pieces} onChange={setPieces} placeholder="3" />
                  <NumberField label="Chambres" value={chambres} onChange={setChambres} placeholder="2" />
                  <NumberField label="Année construction" value={anneeConstruction} onChange={setAnneeConstruction} placeholder="1990" />
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    if (!surface) { toast.error('La surface est requise'); return }
                    setStep(2)
                  }}
                  className="btn-primary"
                >
                  Continuer <ArrowRight className="inline ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 2 ─── */}
          {step === 2 && (
            <div className="card-immo p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-bold text-[#1B2A4A]">Caractéristiques détaillées</p>
                  <p className="text-sm text-gray-500">Plus vous êtes précis, meilleure est l&apos;estimation</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="État général" value={etat} onChange={setEtat} options={ETATS} />
                  <SelectField label="Standing" value={standing} onChange={setStanding} options={STANDINGS} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">DPE</label>
                    <select className="input" value={dpe} onChange={(e) => setDpe(e.target.value)}>
                      {DPE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <SelectField label="Chauffage" value={chauffage} onChange={setChauffage} options={CHAUFFAGES} />
                </div>

                <SelectField label="Parking" value={parking} onChange={setParking} options={PARKINGS} />

                {isAppartement && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField label="Étage" value={etage} onChange={setEtage} placeholder="2" />
                      <div className="flex items-end pb-1">
                        <CheckField label="Ascenseur" checked={ascenseur} onChange={setAscenseur} />
                      </div>
                    </div>
                    <SelectField label="Parties communes" value={partiesCommunes} onChange={setPartiesCommunes} options={PARTIES_COMMUNES} />
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Orientation" value={orientation} onChange={setOrientation} options={ORIENTATIONS} />
                  <SelectField label="Vue" value={vue} onChange={setVue} options={VUES} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Extérieurs</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NumberField label="Balcon" value={balconM2} onChange={setBalconM2} placeholder="0" suffix="m²" />
                    <NumberField label="Terrasse" value={terrasseM2} onChange={setTerrasseM2} placeholder="0" suffix="m²" />
                    <NumberField label="Jardin" value={jardinM2} onChange={setJardinM2} placeholder="0" suffix="m²" />
                    <NumberField label="Terrain" value={terrainM2} onChange={setTerrainM2} placeholder="0" suffix="m²" />
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <CheckField label="Piscine" checked={piscine} onChange={setPiscine} />
                  <CheckField label="Cave" checked={cave} onChange={setCave} />
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <button onClick={() => setStep(1)} className="btn-outline-dark">
                  <ArrowLeft className="inline mr-2 h-4 w-4" /> Retour
                </button>
                <button onClick={submitEstimation} disabled={loading} className="btn-primary">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Calcul en cours...
                    </span>
                  ) : (
                    <>Estimer mon bien <Home className="inline ml-2 h-4 w-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
