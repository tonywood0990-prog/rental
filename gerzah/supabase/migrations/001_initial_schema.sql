-- ─────────────────────────────────────────────────────────────────────────────
-- GerZah (Гэр Зах) — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums (safe create) ───────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE listing_type_enum AS ENUM ('rent', 'sale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM ('apartment', 'house', 'land', 'office');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE price_period_enum AS ENUM ('month', 'total');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Listings ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  listing_type  listing_type_enum NOT NULL DEFAULT 'rent',
  property_type property_type_enum NOT NULL DEFAULT 'apartment',
  price         INTEGER NOT NULL CHECK (price > 0),
  price_period  price_period_enum NOT NULL DEFAULT 'month',
  bedrooms      INTEGER CHECK (bedrooms >= 0),
  bathrooms     INTEGER CHECK (bathrooms >= 0),
  area_sqm      INTEGER CHECK (area_sqm > 0),
  floor         INTEGER CHECK (floor >= 0),
  total_floors  INTEGER CHECK (total_floors >= 0),
  district      TEXT,
  address       TEXT,
  lat           FLOAT8,
  lng           FLOAT8,
  images        TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_listings_updated_at ON listings;
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE USING (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
