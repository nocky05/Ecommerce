import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createServerClient();
        const { data, error } = await supabase
            .from('promotions')
            .select('*, products(*, reviews(rating))')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('API GET Promotions ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, promotion } = body;
        const supabase = createServerClient();

        if (action === 'add') {
            const { data, error } = await supabase
                .from('promotions')
                .insert([{
                    product_id: promotion.product_id,
                    discount_percent: promotion.discount_percent,
                    label: promotion.label,
                    expires_at: promotion.expires_at || null,
                    active: promotion.active
                }])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }

        if (action === 'add_category') {
            // Retrieve all products first to do flexible filtering
            const { data: allProducts, error: prodErr } = await supabase
                .from('products')
                .select('id, category');

            if (prodErr) throw prodErr;

            // Normalize search strings (e.g. "PIANOS & CLAVIERS" -> "piano")
            const searchTerms = promotion.category
                .toLowerCase()
                .replace(/&/g, '')
                .split(' ')
                .filter((w: string) => w.length > 3)
                .map((w: string) => w.replace(/s$/, '')); // basic singularize

            const matchingProducts = allProducts?.filter(p => {
                if (!p.category) return false;
                const cat = p.category.toLowerCase();
                return searchTerms.some((term: string) => cat.includes(term));
            }) || [];

            if (matchingProducts.length === 0) {
                return NextResponse.json({ error: 'Aucun produit trouvé dans cette catégorie' }, { status: 400 });
            }

            // Generate an insert payload for each product
            const promosToInsert = matchingProducts.map(p => ({
                product_id: p.id,
                discount_percent: promotion.discount_percent,
                label: promotion.label,
                expires_at: promotion.expires_at || null,
                active: promotion.active
            }));

            const { data, error } = await supabase
                .from('promotions')
                .insert(promosToInsert)
                .select();

            if (error) throw error;
            return NextResponse.json(data);
        }

        if (action === 'delete') {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', promotion.id);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('API POST Promotions ERROR:', error);
        return NextResponse.json({ error: 'Failed to process promotion' }, { status: 500 });
    }
}
