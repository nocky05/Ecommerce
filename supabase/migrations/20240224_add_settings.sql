-- ============================================
-- MusicMarket - Table des Paramètres
-- ============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings: public read" ON public.site_settings;
DROP POLICY IF EXISTS "Settings: admin update" ON public.site_settings;

CREATE POLICY "Settings: public read" ON public.site_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Settings: admin update" ON public.site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO public.site_settings (id, data)
VALUES ('general', '{
    "name": "MusicMarket Côte d''Ivoire", 
    "email": "contact@musicmarket.ci",
    "phone": "+225 07 77 000 000",
    "whatsapp": "+225 07 77 000 000",
    "address": "Abidjan, Cocody Riviera, Boulevard de la Glisse",
    "facebook": "#",
    "instagram": "#",
    "twitter": "#"
}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;
