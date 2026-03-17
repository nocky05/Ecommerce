import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('GeniusPay Webhook Received:', JSON.stringify(body));

        // Note: GeniusPay webhook structure usually includes "event" and "data"
        // Based on research: data contains metadata which includes our order_id

        const event = body.event;
        const paymentData = body.data;

        if (event === 'payment.success' || event === 'transaction.success') {
            const orderId = paymentData?.metadata?.order_id || paymentData?.reference;

            if (!orderId) {
                console.error('Webhook Error: No order_id found in metadata or reference');
                return NextResponse.json({ error: 'No order ID' }, { status: 400 });
            }

            const supabase = createServerClient();

            // Update order in database
            const { data, error } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    status: 'Confirmée', // Move from 'En Cours' to 'Confirmée'
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('Database Update Error:', error);
                throw error;
            }

            console.log(`Order ${orderId} successfully marked as PAID via webhook`);
            return NextResponse.json({ received: true, updated: true });
        }

        return NextResponse.json({ received: true, updated: false });
    } catch (error: any) {
        console.error('Webhook Handler ERROR:', error);
        return NextResponse.json({
            error: 'Webhook handler failed',
            details: error?.message
        }, { status: 500 });
    }
}
