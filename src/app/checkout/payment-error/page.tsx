"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";

function PaymentErrorContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    return (
        <div className="bg-[#fff8f8] min-h-screen">
            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '60px 40px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                    border: '1px solid #fee2e2'
                }}>
                    {/* Error Icon */}
                    <div style={{
                        width: '100px', height: '100px',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 40px',
                        boxShadow: '0 15px 30px rgba(239, 68, 68, 0.3)'
                    }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>

                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#b91c1c', marginBottom: '15px', letterSpacing: '-1px' }}>
                        PAIEMENT ÉCHOUÉ
                    </h1>
                    <p style={{ fontSize: '17px', color: '#6b7280', fontWeight: '500', marginBottom: '10px', lineHeight: '1.6' }}>
                        Votre paiement n'a pas pu être traité.
                    </p>
                    {orderId && (
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '40px' }}>
                            Référence commande : <strong style={{ color: '#111' }}>#{orderId}</strong>
                        </p>
                    )}

                    {/* Reasons box */}
                    <div style={{
                        background: '#fef9f9', borderRadius: '12px',
                        padding: '25px 30px', textAlign: 'left',
                        marginBottom: '40px', border: '1px solid #fee2e2'
                    }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#b91c1c', marginBottom: '15px', letterSpacing: '1px' }}>
                            Raisons possibles :
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
                            {[
                                "Solde insuffisant sur votre compte Mobile Money",
                                "Transaction annulée ou délai expiré",
                                "Numéro de téléphone incorrect",
                                "Problème de connexion temporaire"
                            ].map((reason, i) => (
                                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: '#4b5563' }}>
                                    <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '16px' }}>·</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/checkout" style={{
                            background: '#007BFF', color: 'white',
                            padding: '16px 35px', borderRadius: '10px',
                            fontWeight: '800', textDecoration: 'none',
                            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            🔄 Réessayer le paiement
                        </Link>
                        <Link href="/cart" style={{
                            background: '#f3f4f6', color: '#374151',
                            padding: '16px 35px', borderRadius: '10px',
                            fontWeight: '800', textDecoration: 'none',
                            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            Retour au panier
                        </Link>
                    </div>

                    {/* Support */}
                    <p style={{ marginTop: '40px', fontSize: '13px', color: '#9ca3af' }}>
                        Besoin d'aide ?{" "}
                        <Link href="/contact" style={{ color: '#007BFF', fontWeight: '700', textDecoration: 'none' }}>
                            Contactez notre support
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>}>
            <PaymentErrorContent />
        </Suspense>
    );
}
