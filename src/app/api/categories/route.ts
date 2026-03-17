import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch all categories and counts
        const { data, error } = await supabase
            .from('products')
            .select('category')
            .eq('is_active', true);

        if (error) throw error;

        // Count occurrences
        const counts: Record<string, number> = {};
        data.forEach((p: any) => {
            if (p.category) {
                counts[p.category] = (counts[p.category] || 0) + 1;
            }
        });

        return NextResponse.json(counts);
    } catch (error: any) {
        console.error('API GET Categories ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
