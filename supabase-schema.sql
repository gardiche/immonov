-- ============================================================
-- IMMONOV — Supabase Schema
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('seller', 'buyer', 'admin');
CREATE TYPE property_type AS ENUM ('appartement', 'maison', 'terrain', 'autre');
CREATE TYPE property_status AS ENUM ('draft', 'pending_payment', 'active', 'sold', 'archived');
CREATE TYPE visit_status AS ENUM ('pending', 'confirmed', 'declined', 'done');

-- Profiles (liés à auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'buyer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  surface numeric,
  rooms integer,
  property_type property_type NOT NULL DEFAULT 'appartement',
  status property_status NOT NULL DEFAULT 'draft',
  address text,
  city text,
  postal_code text,
  department text,
  photos jsonb NOT NULL DEFAULT '[]',
  views_count integer NOT NULL DEFAULT 0,
  visit_price numeric NOT NULL DEFAULT 0,
  stripe_payment_id text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Favorites
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, property_id)
);

-- Conversations
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, buyer_id)
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Visits
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_date timestamptz NOT NULL,
  message text,
  status visit_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Trigger : crée le profil automatiquement à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    'buyer'
  );
  RETURN new;
EXCEPTION WHEN others THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles: lecture publique" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: update self" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties
CREATE POLICY "properties: lecture active ou owner" ON properties FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "properties: create owner" ON properties FOR INSERT
  WITH CHECK (seller_id = auth.uid());
CREATE POLICY "properties: update owner" ON properties FOR UPDATE
  USING (seller_id = auth.uid());

-- Favorites
CREATE POLICY "favorites: CRUD buyer" ON favorites
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Conversations
CREATE POLICY "conversations: lecture participant" ON conversations FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "conversations: create buyer" ON conversations FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Messages
CREATE POLICY "messages: lecture participant" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  ));
CREATE POLICY "messages: insert participant" ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  ));

-- Visits
CREATE POLICY "visits: lecture buyer ou seller" ON visits FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );
CREATE POLICY "visits: create buyer" ON visits FOR INSERT
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "visits: update buyer ou seller" ON visits FOR UPDATE
  USING (
    buyer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

-- ============================================================
-- Storage bucket property-photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "photos: upload authenticated" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

CREATE POLICY "photos: lecture publique" ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "photos: delete owner" ON storage.objects FOR DELETE
  USING (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
