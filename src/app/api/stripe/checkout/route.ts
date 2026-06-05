import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { property_id } = await request.json()

  if (!property_id) {
    return NextResponse.json({ error: 'property_id requis' }, { status: 400 })
  }

  const { data: property } = await supabase
    .from('properties')
    .select('id, title, seller_id')
    .eq('id', property_id)
    .eq('seller_id', user.id)
    .single()

  if (!property) {
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Publication annonce — ${property.title}`,
            description: 'Forfait fixe IMMONOV — sans commission',
          },
          unit_amount: 25000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/vendre/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/vendre/paiement?property_id=${property_id}`,
    metadata: {
      property_id,
      seller_id: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}
