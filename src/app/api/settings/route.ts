import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id') || 'general';
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Default fallbacks
        const defaults: any = {
            general: { name: "MusicMarket Côte d'Ivoire", email: "contact@musicmarket.ci" },
            homepage: {
                side_cards: [
                    { title: "Pianos Yamaha Série P", subtitle: "", image: "/images/products/product-4-yamaha-dgx-670-piano-numerique-88-touches.jpg", link: "/shop?category=PIANOS%20%26%20CLAVIERS", bg_color: "#f8f9fa", text_color: "#111" },
                    { title: "Home Studio Focusrite", subtitle: "Dès 111 000F", image: "/images/products/product-150-focusrite-scarlett-2i2-4e-g-n.jpg", link: "/shop?category=STUDIO%20%26%20ENREGISTREMENT", bg_color: "#000", text_color: "#fff" }
                ],
                promo_banner: {
                    title: "QUALITÉ & FIABILITÉ",
                    subtitle: "Le choix n°1 des professionnels",
                    discount_text: "100",
                    button_text: "DÉCOUVRIR NOS OFFRES",
                    button_link: "/shop",
                    bg_color: "#007BFF",
                    accent_color: "#FFD200"
                }
            }
        };

        return NextResponse.json(data?.data || defaults[id] || {});
    } catch (error: any) {
        console.error('API GET Settings ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id') || 'general';
        const body = await request.json();
        const { settings } = body;
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ id, data: settings, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, settings: data.data });
    } catch (error: any) {
        console.error('API POST Settings ERROR:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
