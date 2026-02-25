"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        city: "Abidjan",
        address: "",
        paymentMethod: "momo"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const cities = ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Divo"];

    return (
        <div className="bg-[#fbfcff] min-h-screen animate-fade-in">
            {/* Breadcrumbs */}
            <div className="border-bottom border-gray-100 py-4 mb-10 bg-white">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: '#999' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
                        <span>/</span>
                        <Link href="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>Panier</Link>
                        <span>/</span>
                        <span style={{ color: '#111', fontWeight: '500' }}>Vérification</span>
                    </nav>
                </div>
            </div>

            <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#111', marginBottom: '40px', textAlign: 'center' }}>VÉRIFICATION DE LA COMMANDE</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '50px', alignItems: 'start' }} className="checkout-grid">

                    {/* Left: Billing Details Form */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '40px', border: '1px solid #eee', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #007BFF', display: 'inline-block', paddingBottom: '5px' }}>DÉTAILS DE FACTURATION</h2>

                        <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Prénom <span style={{ color: '#b22222' }}>*</span></label>
                                <input
                                    type="text" name="firstName" required
                                    value={formData.firstName} onChange={handleInputChange}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Nom de famille <span style={{ color: '#b22222' }}>*</span></label>
                                <input
                                    type="text" name="lastName" required
                                    value={formData.lastName} onChange={handleInputChange}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Numéro de téléphone <span style={{ color: '#b22222' }}>*</span></label>
                            <input
                                type="tel" name="phone" required placeholder="07 00 00 00 00"
                                value={formData.phone} onChange={handleInputChange}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc' }}
                            />
                            <p style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>Utilisé pour la coordination de la livraison.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Adresse e-mail <span style={{ color: '#b22222' }}>*</span></label>
                            <input
                                type="email" name="email" required
                                value={formData.email} onChange={handleInputChange}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Ville / Commune <span style={{ color: '#b22222' }}>*</span></label>
                            <select
                                name="city" value={formData.city} onChange={handleInputChange}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc', cursor: 'pointer' }}
                            >
                                {cities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>Indication d'adresse (Quartier, Précisions) <span style={{ color: '#b22222' }}>*</span></label>
                            <textarea
                                name="address" rows={3} required placeholder="Ex: Cocody Angré, Rue L12, Appt 4"
                                value={formData.address} onChange={handleInputChange}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', border: '1px solid #eee', fontSize: '14px', background: '#fcfcfc', resize: 'none' }}
                            />
                        </div>

                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #007BFF', display: 'inline-block', paddingBottom: '5px' }}>PAIEMENT</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', border: `2px solid #007BFF`, borderRadius: '10px', cursor: 'default', background: '#f0f7ff' }}>
                                <input type="radio" name="paymentMethod" value="momo" checked={true} readOnly />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>Mobile Money / Wave</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>Orange Money, MTN MoMo, Moov, Wave — via GeniusPay</div>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {['🟠 Orange', '🟡 MTN', '🔵 Moov', '💙 Wave'].map(op => (
                                            <span key={op} style={{ fontSize: '11px', fontWeight: '700', background: '#f0f0f0', padding: '2px 8px', borderRadius: '20px', color: '#444' }}>{op}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ background: '#007BFF', color: 'white', fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.5px' }}>GeniusPay</div>
                                    <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>🔒 Sécurisé</div>
                                </div>
                            </label>
                        </div>

                        <div style={{ marginTop: '15px', padding: '12px 15px', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '12px', color: '#1e40af' }}>
                            ℹ️ Vous serez redirigé vers la page de paiement sécurisée <strong>GeniusPay</strong> pour finaliser votre règlement.
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div style={{ position: 'sticky', top: '120px' }}>
                        <div style={{ background: '#111', borderRadius: '12px', padding: '35px', color: 'white', boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #007BFF', display: 'inline-block', paddingBottom: '5px' }}>VOTRE COMMANDE</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', background: 'white', border: '1px solid #333', borderRadius: '4px', padding: '3px' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }}>{item.name}</h4>
                                            <div style={{ fontSize: '11px', color: '#aaa' }}>{item.qty} x {item.price.toLocaleString()}F CFA</div>
                                            {item.deliveryTime && (
                                                <div style={{ fontSize: '10px', color: item.deliveryTime.includes('semaine') ? '#ffcc00' : '#90ee90', marginTop: '2px', fontWeight: '600' }}>
                                                    🚚 {item.deliveryTime}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFD200' }}>{(item.qty * item.price).toLocaleString()}F</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ fontSize: '14px', color: '#aaa', fontWeight: '500' }}>Sous-total</span>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{subtotal.toLocaleString()}F CFA</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '14px', color: '#aaa', fontWeight: '500' }}>Livraison</span>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#28a745' }}>GRATUIT</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <span style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>TOTAL</span>
                                <span style={{ fontSize: '28px', fontWeight: '900', color: '#FFD200' }}>{subtotal.toLocaleString()}F CFA</span>
                            </div>

                            <button style={{
                                width: '100%',
                                background: '#007BFF',
                                color: 'white',
                                border: 'none',
                                padding: '18px',
                                borderRadius: '6px',
                                fontWeight: '900',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 10px 25px rgba(0, 123, 255, 0.3)'
                            }}
                                className="btn-order"
                                onClick={async () => {
                                    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
                                        showNotification("Veuillez remplir tous les champs obligatoires", "error");
                                        return;
                                    }
                                    if (items.length === 0) {
                                        showNotification("Votre panier est vide.", "error");
                                        return;
                                    }

                                    setIsSubmitting(true);
                                    try {
                                        // Step 1: Save order to DB
                                        const orderRes = await fetch('/api/orders', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                customer: formData,
                                                items,
                                                total: subtotal,
                                                user_id: user?.id || null
                                            })
                                        });
                                        if (!orderRes.ok) {
                                            const errorData = await orderRes.json();
                                            const detailedError = errorData.details ? `${errorData.error}: ${errorData.details}` : (errorData.error || "Order submission failed");
                                            throw new Error(detailedError);
                                        }
                                        const { order } = await orderRes.json();

                                        // Step 2: Redirect to GeniusPay
                                        showNotification("Redirection vers GeniusPay...", "success");
                                        const payRes = await fetch('/api/payment', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                order,
                                                customer: formData,
                                                amount: subtotal
                                            })
                                        });

                                        if (!payRes.ok) {
                                            const payData = await payRes.json().catch(() => ({}));
                                            // Extraire le message de manière sécurisée
                                            const payError = typeof payData.error === 'string'
                                                ? payData.error
                                                : (payData.message || JSON.stringify(payData) || "Erreur de paiement");
                                            throw new Error(payError);
                                        }

                                        const data = await payRes.json();
                                        const checkout_url = data.checkout_url;

                                        if (!checkout_url) {
                                            throw new Error("L'URL de paiement n'a pas été générée. Veuillez contacter le support.");
                                        }

                                        clearCart();
                                        // Redirection vers la page de paiement sécurisée
                                        window.location.href = checkout_url;
                                    } catch (error: any) {
                                        console.error("Détails de l'erreur:", error);
                                        const displayMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
                                        showNotification(displayMessage, "error");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "REDIRECTION VERS GENIUSPAY..."
                                    : "💳 PAYER AVEC GENIUSPAY"
                                }
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '10px', color: '#777', marginTop: '20px', lineHeight: '1.6' }}>
                                Vos données personnelles seront utilisées pour traiter votre commande et pour d'autres usages décrits dans notre politique de confidentialité.
                            </p>
                        </div>
                    </div>
                </div>
            </main >
            <Footer />

            <style jsx>{`
                .checkout-grid {
                    display: grid;
                }
                @media (max-width: 991px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 768px) {
                    .checkout-form-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 10px;
                }
                .btn-order:hover {
                    background: #0056b3 !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div >
    );
}
