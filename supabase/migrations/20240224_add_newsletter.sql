-- ============================
-- 6. TABLE NEWSLETTER (Abonnés)
-- ============================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir la liste des abonnés
CREATE POLICY "Newsletter: admin read" ON public.newsletter_subscribers
    FOR SELECT USING (auth.role() = 'service_role');

-- Tout le monde peut s'inscrire via l'API (clé de service côté serveur)
-- Pas besoin de politique INSERT si on utilise createServerClient dans l'API

-- Grants
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
