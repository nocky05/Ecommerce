import { NextResponse } from 'next/server';

const GENIUSPAY_API_URL = 'https://pay.genius.ci/api/v1/merchant/payments';
const GENIUSPAY_API_KEY = process.env.GENIUSPAY_API_KEY || '';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { order, customer, amount } = body;

        // Build the base URL for redirects
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const GENIUSPAY_PUBLIC_KEY = process.env.GENIUSPAY_PUBLIC_KEY;
        const GENIUSPAY_SECRET_KEY = process.env.GENIUSPAY_SECRET_KEY;

        if (!GENIUSPAY_PUBLIC_KEY || !GENIUSPAY_SECRET_KEY) {
            console.error('Missing GeniusPay keys');
            return NextResponse.json(
                { error: 'Configuration de paiement incomplète (Clés API manquantes)' },
                { status: 500 }
            );
        }

        // Create payment session on GeniusPay
        const response = await fetch(GENIUSPAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': GENIUSPAY_PUBLIC_KEY,
                'X-API-Secret': GENIUSPAY_SECRET_KEY,
            },
            body: JSON.stringify({
                amount: Math.round(Number(amount)), // Ensure integer for XOF
                currency: 'XOF',
                customer: {
                    name: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email || 'client@musicmarket.ci',
                    phone: customer.phone,
                },
                description: `Commande MusicMarket - ${order.id}`,
                metadata: {
                    order_id: order.id,
                    shop: 'MusicMarket',
                },
                success_url: `${baseUrl}/checkout/success?order_id=${encodeURIComponent(order.id)}&payment=success`,
                error_url: `${baseUrl}/checkout/payment-error?order_id=${encodeURIComponent(order.id)}&payment=failed`,
                cancel_url: `${baseUrl}/checkout?cancelled=true`,
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Payment initiation failed';
            try {
                const errBody = await response.json();
                errorMessage = errBody.message || errBody.error || JSON.stringify(errBody);
            } catch (e) {
                // If not JSON, try text
                const errText = await response.text().catch(() => '');
                if (errText) errorMessage = errText;
            }

            console.error('GeniusPay API error:', errorMessage);
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('GeniusPay Success Response:', JSON.stringify(data, null, 2));

        // GeniusPay peut renvoyer l'URL directement ou imbriquée dans 'data'
        const checkout_url = data.checkout_url || data.data?.checkout_url || data.payment_url || data.data?.payment_url;

        if (!checkout_url) {
            console.error('No checkout_url found in GeniusPay response:', data);
            return NextResponse.json(
                { error: 'URL de redirection manquante dans la réponse de GeniusPay' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            checkout_url: checkout_url,
            transaction_id: data.transaction_id || data.id || data.data?.transaction_id,
        });
    } catch (error) {
        console.error('Payment route error:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur de paiement' },
            { status: 500 }
        );
    }
}
