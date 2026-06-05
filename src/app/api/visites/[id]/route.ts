import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { status } = await request.json()

  if (!['confirmed', 'declined', 'done'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const { data: visit } = await supabase
    .from('visits')
    .select('id, buyer_id, property_id, properties(seller_id)')
    .eq('id', id)
    .single()

  if (!visit) {
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }

  const sellerId = (visit as any).properties?.seller_id
  const isBuyer = visit.buyer_id === user.id
  const isSeller = sellerId === user.id

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('visits')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
