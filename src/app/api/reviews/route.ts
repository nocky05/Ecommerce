import { NextResponse } from 'next/server';
import { supabase, createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API GET Reviews ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product_id, user_id, user_name, rating, comment } = body;

        if (!product_id || !rating || !user_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const serverClient = createServerClient();
        const { data, error } = await serverClient
            .from('reviews')
            .insert([
                {
                    product_id,
                    user_id: user_id || null,
                    user_name,
                    rating,
                    comment
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ review: data });
    } catch (error: any) {
        console.error('API POST Reviews ERROR:', error);
        return NextResponse.json({
            error: error.message || 'Failed to submit review',
            details: error.details || null
        }, { status: 500 });
    }
}
