"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const payment = searchParams.get("payment");
    const isMomo = payment === "success"; // came back from GeniusPay

    return (
        <div className="bg-[#fbfcff] min-h-screen">
            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
                <div className="success-card animate-fade-in" style={{
                    background: 'white', borderRadius: '24px',
                    padding: '60px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f4f8'
                }}>
                    {/* Success Icon */}
                    <div style={{
                        width: '100px', height: '100px',
                        background: isMomo
                            ? 'linear-gradient(135deg, #007BFF, #0040cc)'
                            : '#007BFF',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 40px', color: 'white',
                        boxShadow: '0 15px 30px rgba(0, 123, 255, 0.3)'
                    }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1B2559', marginBottom: '12px', letterSpacing: '-1px' }}>
                        MERCI POUR VOTRE CONFIANCE !
                    </h1>

                    {orderId && (
                        <div style={{ marginBottom: '15px' }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Référence commande
                            </span>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#007BFF', marginTop: '4px' }}>
                                {orderId}
                            </div>
                        </div>
                    )}

                    <p style={{ fontSize: '17px', color: '#707EAE', fontWeight: '500', marginBottom: '35px', lineHeight: '1.7' }}>
                        {isMomo
                            ? <>Votre paiement via <strong style={{ color: '#007BFF' }}>GeniusPay</strong> a été confirmé avec succès. Votre commande est en cours de traitement.</>
                            : <>Votre commande a été enregistrée. Un conseiller de <span style={{ color: '#007BFF', fontWeight: '700' }}>MusicMarket</span> vous contactera pour confirmer la livraison.</>
                        }
                    </p>

                    {/* Info boxes */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                        <div style={{
                            flex: 1, minWidth: '200px',
                            background: '#f8fafc', borderRadius: '14px', padding: '20px',
                            textAlign: 'left', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🚚</div>
                            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2559', margin: '0 0 5px' }}>Livraison Rapide</h4>
                            <p style={{ fontSize: '13px', color: '#707EAE', margin: 0 }}>Expédition sous 24h pour les articles en stock.</p>
                        </div>
                        <div style={{
                            flex: 1, minWidth: '200px',
                            background: '#f8fafc', borderRadius: '14px', padding: '20px',
                            textAlign: 'left', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📞</div>
                            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2559', margin: '0 0 5px' }}>Suivi personnalisé</h4>
                            <p style={{ fontSize: '13px', color: '#707EAE', margin: 0 }}>Notre équipe vous contactera par WhatsApp ou appel.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/shop" style={{
                            background: '#1B2559', color: 'white',
                            padding: '16px 35px', borderRadius: '12px',
                            fontWeight: '800', textDecoration: 'none',
                            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            Continuer mes achats
                        </Link>
                        <Link href="/profile" style={{
                            background: '#f0f4f8', color: '#1B2559',
                            padding: '16px 35px', borderRadius: '12px',
                            fontWeight: '800', textDecoration: 'none',
                            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            Voir mon profil
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.7s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666' }}>Chargement...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
