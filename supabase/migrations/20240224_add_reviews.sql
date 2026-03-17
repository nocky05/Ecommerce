-- ============================
-- 5. TABLE REVIEWS (avis clients)
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

-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Reviews: public read" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: authenticated insert" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: own delete" ON public.reviews;

-- Tout le monde peut lire les avis
CREATE POLICY "Reviews: public read" ON public.reviews
    FOR SELECT USING (TRUE);

-- Seuls les utilisateurs connectés peuvent laisser un avis
CREATE POLICY "Reviews: authenticated insert" ON public.reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Un utilisateur peut supprimer son propre avis
CREATE POLICY "Reviews: own delete" ON public.reviews
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Grants
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.reviews_id_seq TO authenticated;
