import { NextResponse } from 'next/server';
import { supabase, createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');
        const minPrice = searchParams.get('min');
        const maxPrice = searchParams.get('max');
        const sort = searchParams.get('sort') || 'newest';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        let supabaseQuery = supabase
            .from('products')
            .select('*, reviews(rating)', { count: 'exact' })
            .eq('is_active', true);

        // Filtre par catégorie ou groupe de catégories
        if (category && category !== 'Tous') {
            const CATEGORY_GROUPS: Record<string, string[]> = {
                "GUITARES & BASSES": ["Guitares & basses", "Guitares acoustique", "Basses électriques", "Amplificateurs", "Amplificateurs basses", "Amplificateurs guitares électriques", "Combo Guitare et Basse", "Effets guitares et basses", "Cordes", "Cordes pour basse", "Cordes pour guitare acoustique", "Cordes pour guitare classique", "Cordes pour guitare électrique", "Accessoires guitares"],
                "PIANOS & CLAVIERS": ["Piano & Clavier", "Claviers initiation", "Accessoires pour claviers", "Claviers maîtres"],
                "BATTERIES & PERCUSSIONS": ["Batteries & percussions", "Batteries Électroniques", "Caisse Claire", "Cajon", "Cymbales", "Peaux de Grosse Caisse", "Peaux de Toms", "Peaux de batterie", "Peaux de frappe pour Caisse claire", "Peaux de résonance pour grosses caisses", "Accessoires pour batteurs"],
                "SONORISATION": ["Sonorisation", "Enceintes de sonorisation", "Caissons de Basse Actifs", "Ensemble sono complets", "Crossover", "TABLES DE MIXAGE", "Mesure audio"],
                "STUDIO & ENREGISTREMENT": ["Studio & Enregistrement", "Enceintes de monitoring", "Interfaces Audio", "Casques"],
                "MICROPHONES": ["Microphones", "Microphones pour instruments", "Micros", "Pack vocal"],
                "ÉQUIPEMENT DJ": ["Équipement DJ"],
                "INSTRUMENTS À VENT": ["Instruments à vent", "Accessoires vent"],
                "VIOLONS & ORCHESTRE": ["Violons"],
                "ACCESSOIRES": ["Accessoires", "Accessoires pour musiciens", "Autres accessoires", "/Autres accessoires"],
                "OFFRES SPÉCIALES": ["NOUVEL ARRIVAGE", "Nouveauté", "PROMO FIN D'ANNEE"]
            };

            const groupCategories = CATEGORY_GROUPS[category.toUpperCase()];
            if (groupCategories) {
                supabaseQuery = supabaseQuery.in('category', groupCategories);
            } else {
                supabaseQuery = supabaseQuery.eq('category', category);
            }
        }

        // Filtre par recherche
        if (query) {
            supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
        }

        // Filtre par prix
        if (minPrice) {
            supabaseQuery = supabaseQuery.gte('price', parseInt(minPrice));
        }
        if (maxPrice) {
            supabaseQuery = supabaseQuery.lte('price', parseInt(maxPrice));
        }

        // Tri
        if (sort === 'price-asc') {
            supabaseQuery = supabaseQuery.order('price', { ascending: true });
        } else if (sort === 'price-desc') {
            supabaseQuery = supabaseQuery.order('price', { ascending: false });
        } else if (sort === 'name-asc') {
            supabaseQuery = supabaseQuery.order('name', { ascending: true });
        } else {
            supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        supabaseQuery = supabaseQuery.range(from, to);

        const { data, count, error } = await supabaseQuery;

        if (error) throw error;

        const productsWithMeta = data?.map((p: any) => {
            const reviews = p.reviews || [];
            const avgRating = reviews.length > 0
                ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
                : 0;

            // Remove reviews from the object to keep payload small
            const { reviews: _, ...productData } = p;

            return {
                ...productData,
                rating: avgRating,
                reviewCount: reviews.length
            };
        }) || [];

        return NextResponse.json({
            products: productsWithMeta,
            total: count,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        });

    } catch (error: any) {
        console.error('API GET Products ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, product } = body;
        const supabaseServer = createServerClient();

        if (action === 'add') {
            // Remove ID if it's auto-generated by DB, or keep it if it's specified
            // Note: AdminPage manually generates maxId + 1, so we keep it.
            const { data, error } = await supabaseServer
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, product: data });
        }

        if (action === 'update') {
            const { id, rating, reviewCount, ...updateData } = product;

            const { data, error } = await supabaseServer
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, product: data });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('API POST Products ERROR:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process product',
            details: error.details || null
        }, { status: 500 });
    }
}
