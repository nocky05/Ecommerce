import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Une adresse email valide est requise' }, { status: 400 });
        }

        const serverClient = createServerClient();

        // Check if already subscribed to avoid duplicate error message being ugly
        const { data: existing } = await serverClient
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ message: 'Vous êtes déjà inscrit à notre newsletter !' });
        }

        const { error } = await serverClient
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (error) throw error;

        return NextResponse.json({ message: 'Inscription réussie ! Merci de votre confiance.' });
    } catch (error: any) {
        console.error('API POST Newsletter ERROR:', error);
        return NextResponse.json({ error: 'Une erreur est survenue lors de l\'inscription' }, { status: 500 });
    }
}
