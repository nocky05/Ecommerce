import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createServerClient();
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(orders || []);
    } catch (error) {
        console.error('API GET Orders Error:', error);
        return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, orderId, status } = body;
        const supabase = createServerClient();

        // Update order status (from admin panel)
        if (action === 'updateStatus') {
            const { error } = await supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;
            return NextResponse.json({ success: true, status });
        }

        // Create new order (from checkout)
        const { customer, items, total, user_id } = body;

        console.log('API POST Order Body:', { customer_name: customer?.firstName, items_count: items?.length, total, user_id });

        if (!customer || !items || !total) {
            return NextResponse.json({
                error: 'Missing order information',
                details: 'Customer, items, or total is missing'
            }, { status: 400 });
        }

        const orderId_new = `#CMD-${Date.now().toString().slice(-7)}`;

        const newOrder = {
            id: orderId_new,
            user_id: user_id || null,
            customer_name: `${customer.firstName || 'Client'} ${customer.lastName || ''}`.trim(),
            customer_email: customer.email || null,
            customer_phone: customer.phone || 'Non spécifié',
            customer_city: customer.city || 'Abidjan',
            customer_address: customer.address || '',
            payment_method: customer.paymentMethod || 'momo',
            payment_status: 'pending',
            status: 'En Cours',
            items: items,
            total: total,
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, order: data });
    } catch (error: any) {
        console.error('API POST Order ERROR:', error);
        return NextResponse.json({
            error: 'Failed to process order',
            details: error?.message || (typeof error === 'string' ? error : 'Unknown error'),
            code: error?.code || null
        }, { status: 500 });
    }
}
