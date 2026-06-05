import { NextRequest, NextResponse } from 'next/server'

const PRIX_MEDIANS_NATIONAUX: Record<string, number> = {
  maison: 2800,
  appartement: 3500,
  studio: 3800,
  loft: 4200,
  duplex: 3900,
  villa: 4500,
  terrain: 150,
}

const COEFFICIENTS = {
  etat: { neuf: 1.15, tres_bon: 1.05, bon: 1.0, rafraichir: 0.9, travaux: 0.75 },
  dpe: { A: 1.08, B: 1.05, C: 1.02, D: 1.0, E: 0.95, F: 0.88, G: 0.82, nr: 1.0 },
  parking: { aucun: 1.0, place: 1.03, box: 1.06, garage: 1.08, double_garage: 1.12 },
  standing: { standard: 1.0, confort: 1.08, haut_de_gamme: 1.18, luxe: 1.35 },
  vue: { vis_a_vis: 0.95, cour: 0.97, degagee: 1.0, mer_lac_montagne: 1.12, exceptionnelle: 1.2 },
  chauffage: { electrique: 0.97, fioul: 0.95, collectif: 0.98, gaz: 1.0, pac: 1.03, bois: 1.0 },
  parties_communes: { mauvais: 0.95, moyen: 1.0, bon: 1.03, excellent: 1.06 },
  orientation: { nord: 0.95, est: 0.98, ouest: 1.0, sud: 1.05, sudouest: 1.07, sudest: 1.07, estouest: 1.0 },
}

async function getPrixM2ViaStreamEstate(lat: number, lon: number, radius: number) {
  const key = process.env.STREAM_ESTATE_API_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://api.stream-estate.com/transactions?lat=${lat}&lon=${lon}&radius=${radius}&limit=50`,
      { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const transactions = data?.transactions ?? []
    if (transactions.length < 5) return null
    const prices = transactions.map((t: any) => t.price_per_sqm).filter(Boolean)
    prices.sort((a: number, b: number) => a - b)
    const mid = Math.floor(prices.length / 2)
    return { prixM2: prices[mid], nbTransactions: prices.length }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    type_bien = 'appartement',
    surface,
    lat,
    lon,
    etat = 'bon',
    standing = 'standard',
    dpe = 'nr',
    chauffage = 'gaz',
    parking = 'aucun',
    orientation = 'est',
    vue = 'degagee',
    parties_communes = 'moyen',
    balcon_m2 = 0,
    terrasse_m2 = 0,
    jardin_m2 = 0,
    terrain_m2 = 0,
    piscine = false,
    cave = false,
    annee_construction,
    etage,
    ascenseur = false,
  } = body

  if (!surface || surface <= 0) {
    return NextResponse.json({ error: 'Surface requise' }, { status: 400 })
  }

  let prixM2Base: number
  let nbTransactions = 0
  let source = 'national'

  if (lat && lon) {
    for (const radius of [500, 2000, 5000]) {
      const result = await getPrixM2ViaStreamEstate(lat, lon, radius)
      if (result) {
        prixM2Base = result.prixM2
        nbTransactions = result.nbTransactions
        source = `stream-estate-${radius}m`
        break
      }
    }
  }

  prixM2Base ??= PRIX_MEDIANS_NATIONAUX[type_bien] ?? 3000

  let coeff = 1
  coeff *= COEFFICIENTS.etat[etat as keyof typeof COEFFICIENTS.etat] ?? 1
  coeff *= COEFFICIENTS.dpe[dpe as keyof typeof COEFFICIENTS.dpe] ?? 1
  coeff *= COEFFICIENTS.parking[parking as keyof typeof COEFFICIENTS.parking] ?? 1
  coeff *= COEFFICIENTS.standing[standing as keyof typeof COEFFICIENTS.standing] ?? 1
  coeff *= COEFFICIENTS.vue[vue as keyof typeof COEFFICIENTS.vue] ?? 1
  coeff *= COEFFICIENTS.chauffage[chauffage as keyof typeof COEFFICIENTS.chauffage] ?? 1
  coeff *= COEFFICIENTS.parties_communes[parties_communes as keyof typeof COEFFICIENTS.parties_communes] ?? 1
  coeff *= COEFFICIENTS.orientation[orientation as keyof typeof COEFFICIENTS.orientation] ?? 1

  if (annee_construction) {
    const age = new Date().getFullYear() - Number(annee_construction)
    if (age < 5) coeff *= 1.1
    else if (age < 20) coeff *= 1.02
    else if (age > 50) coeff *= 0.95
  }

  if (etage !== undefined && etage > 0) {
    coeff *= ascenseur ? 1.03 : etage > 3 ? 0.97 : 1.01
  }

  const prixM2Final = prixM2Base * coeff
  let prixBase = prixM2Final * surface

  prixBase += balcon_m2 * prixM2Final * 0.08
  prixBase += terrasse_m2 * prixM2Final * 0.12
  prixBase += jardin_m2 * prixM2Final * 0.05
  prixBase += terrain_m2 * prixM2Final * 0.03
  if (piscine) prixBase += 15000
  if (cave) prixBase += 3000

  const median = Math.round(prixBase / 1000) * 1000
  const low = Math.round(median * 0.93 / 1000) * 1000
  const high = Math.round(median * 1.07 / 1000) * 1000

  return NextResponse.json({
    fourchette_basse: low,
    prix_median: median,
    fourchette_haute: high,
    prix_m2: Math.round(prixM2Final),
    nb_transactions: nbTransactions,
    source,
  })
}
