-- ============================================
-- MusicMarket - Schéma de base de données
-- À exécuter dans Supabase > SQL Editor
-- ============================================

-- ============================
-- 1. TABLE PROFILES (utilisateurs)
-- ============================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Abidjan',
    address TEXT,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Profiles: own read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: own update" ON public.profiles;

-- Un utilisateur ne peut voir et modifier que son propre profil
CREATE POLICY "Profiles: own read" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "Profiles: own update" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Auto-créer le profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================
-- 2. TABLE ORDERS (commandes)
-- ============================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    customer_city TEXT,
    customer_address TEXT,
    payment_method TEXT DEFAULT 'momo' CHECK (payment_method IN ('momo')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    status TEXT DEFAULT 'En Cours' CHECK (status IN (
        'En Cours', 'Confirmée', 'En Préparation', 'En Transit', 
        'Prêt pour livraison', 'Livré', 'Annulée'
    )),
    items JSONB NOT NULL,
    total NUMERIC(12, 0) NOT NULL,
    transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Nettoyer les anciennes politiques pour éviter les erreurs
DROP POLICY IF EXISTS "Orders: own read" ON public.orders;
DROP POLICY IF EXISTS "Orders: public insert" ON public.orders;
DROP POLICY IF EXISTS "Orders: admin all" ON public.orders;

-- Un utilisateur voit ses propres commandes (ou les commandes sans user_id pour les invités dans la même session, etc.)
CREATE POLICY "Orders: own read" ON public.orders
    FOR SELECT USING ((SELECT auth.uid()) = user_id OR user_id IS NULL);

-- Autoriser l'insertion (checkout) pour tout le monde (anon et authenticated)
CREATE POLICY "Orders: public insert" ON public.orders
    FOR INSERT WITH CHECK (TRUE);

-- Les admins voient/modifient toutes les commandes
CREATE POLICY "Orders: admin all" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================
-- 3. TABLE PRODUCTS (produits)
-- ============================
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(12, 0) NOT NULL,
    old_price NUMERIC(12, 0),
    image TEXT,
    description TEXT,
    availability TEXT DEFAULT 'En stock',
    delivery_time TEXT DEFAULT '24-48h',
    brand TEXT,
    promo INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Products: public read" ON public.products;
DROP POLICY IF EXISTS "Products: admin write" ON public.products;

-- Tout le monde peut lire les produits actifs
CREATE POLICY "Products: public read" ON public.products
    FOR SELECT USING (is_active = TRUE);

-- Seuls les admins peuvent modifier les produits
CREATE POLICY "Products: admin write" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );


-- ============================
-- 4. TABLE WISHLISTS (favoris)
-- ============================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Wishlists: own" ON public.wishlists;

CREATE POLICY "Wishlists: own" ON public.wishlists
    FOR ALL USING ((SELECT auth.uid()) = user_id);


-- ============================
-- GRANT API access
-- ============================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.orders TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.wishlists TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.products_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlists_id_seq TO authenticated;
