-- ============================================
-- Chez le musicien - Schéma de base de données Complet
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

DROP POLICY IF EXISTS "Profiles: own read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: own update" ON public.profiles;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

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

DROP POLICY IF EXISTS "Orders: own read" ON public.orders;
DROP POLICY IF EXISTS "Orders: public insert" ON public.orders;
DROP POLICY IF EXISTS "Orders: admin all" ON public.orders;

CREATE POLICY "Orders: own read" ON public.orders
    FOR SELECT USING ((SELECT auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Orders: public insert" ON public.orders
    FOR INSERT WITH CHECK (
        ((SELECT auth.uid()) IS NULL AND user_id IS NULL)
        OR 
        ((SELECT auth.uid()) = user_id)
    );

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
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

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

DROP POLICY IF EXISTS "Products: public read" ON public.products;
DROP POLICY IF EXISTS "Products: admin write" ON public.products;

CREATE POLICY "Products: public read" ON public.products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Products: admin write" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );


-- ============================
-- 4. TABLE PROMOTIONS
-- ============================
CREATE TABLE IF NOT EXISTS public.promotions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    label TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promotions: public read" ON public.promotions;
DROP POLICY IF EXISTS "Promotions: admin write" ON public.promotions;

CREATE POLICY "Promotions: public read" ON public.promotions FOR SELECT USING (TRUE);
CREATE POLICY "Promotions: admin write" ON public.promotions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
);


-- ============================
-- 5. TABLE BANNERS (Accueil / Posts)
-- ============================
CREATE TABLE IF NOT EXISTS public.banners (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    button_link TEXT DEFAULT '/shop',
    active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners: public read" ON public.banners;
DROP POLICY IF EXISTS "Banners: admin write" ON public.banners;

CREATE POLICY "Banners: public read" ON public.banners FOR SELECT USING (TRUE);
CREATE POLICY "Banners: admin write" ON public.banners FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
);


-- ============================
-- 6. TABLE SITE_SETTINGS
-- ============================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings: public read" ON public.site_settings;
DROP POLICY IF EXISTS "Settings: admin update" ON public.site_settings;

CREATE POLICY "Settings: public read" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Settings: admin update" ON public.site_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
);


-- ============================
-- 7. TABLE REVIEWS (avis clients)
-- ============================
CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews: public read" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: authenticated insert" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: own delete" ON public.reviews;

CREATE POLICY "Reviews: public read" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Reviews: authenticated insert" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Reviews: own delete" ON public.reviews FOR DELETE USING ((SELECT auth.uid()) = user_id);


-- ============================
-- 8. TABLE WISHLISTS (favoris)
-- ============================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wishlists: own" ON public.wishlists;

CREATE POLICY "Wishlists: own" ON public.wishlists
    FOR ALL USING ((SELECT auth.uid()) = user_id);


-- ============================
-- 9. TABLE NEWSLETTER (Abonnés)
-- ============================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Newsletter: admin read" ON public.newsletter_subscribers;

CREATE POLICY "Newsletter: admin read" ON public.newsletter_subscribers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );


-- ============================
-- 10. GRANTS & PERMISSIONS
-- ============================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated;

GRANT ALL ON public.orders TO anon, authenticated;

GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO authenticated;

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO authenticated;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated;

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO authenticated;

GRANT ALL ON public.wishlists TO authenticated;

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
