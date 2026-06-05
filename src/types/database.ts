export type UserRole = 'seller' | 'buyer' | 'admin'
export type PropertyType = 'appartement' | 'maison' | 'terrain' | 'autre'
export type PropertyStatus = 'draft' | 'pending_payment' | 'active' | 'sold' | 'archived'
export type VisitStatus = 'pending' | 'confirmed' | 'declined' | 'done'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  surface: number | null
  rooms: number | null
  property_type: PropertyType
  status: PropertyStatus
  address: string | null
  city: string | null
  postal_code: string | null
  department: string | null
  photos: string[]
  views_count: number
  visit_price: number
  stripe_payment_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  buyer_id: string
  property_id: string
  created_at: string
}

export interface Conversation {
  id: string
  property_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

export interface Visit {
  id: string
  property_id: string
  buyer_id: string
  requested_date: string
  message: string | null
  status: VisitStatus
  created_at: string
  updated_at: string
}
