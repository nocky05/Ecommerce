import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
    try {
        const supabase = createServerClient();
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('active', true)
            .order('order', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('API GET Banners ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, banner } = body;
        const supabase = createServerClient();

        if (action === 'update') {
            const { data, error } = await supabase
                .from('banners')
                .upsert([banner])
                .select()
                .single();

            if (error) throw error;

            // Ensure only one active banner exists
            if (data && data.active) {
                await supabase
                    .from('banners')
                    .update({ active: false })
                    .neq('id', data.id);
            }

            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('API POST Banners ERROR:', error);
        return NextResponse.json({ error: 'Failed to process banner' }, { status: 500 });
    }
}
