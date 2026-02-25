"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import Footer from "@/components/Footer";

const faqCategories = [
    {
        title: "🛒 Commandes & Livraison",
        faqs: [
            {
                q: "Quels sont les délais de livraison ?",
                a: "Pour Abidjan, la livraison est effectuée sous 24 à 48h après confirmation de la commande. Pour les autres villes de Côte d'Ivoire, comptez 2 à 5 jours ouvrables selon la localité."
            },
            {
                q: "La livraison est-elle gratuite ?",
                a: "Oui ! Toutes nos livraisons sont gratuites pour l'ensemble du territoire ivoirien. Aucun frais supplémentaire ne sera appliqué à votre commande."
            },
            {
                q: "Comment suivre ma commande ?",
                a: "Après confirmation, un conseiller MusicMarket vous contactera directement par téléphone ou WhatsApp pour coordonner la livraison. Vous pouvez également consulter votre espace profil sur notre site."
            },
            {
                q: "Puis-je modifier ou annuler ma commande ?",
                a: "Vous pouvez modifier ou annuler votre commande dans les 2 heures suivant sa passation en nous contactant au +225 07 77 000 000. Après ce délai, si la commande est en cours de traitement, des frais peuvent s'appliquer."
            }
        ]
    },
    {
        title: "💳 Paiement",
        faqs: [
            {
                q: "Quels modes de paiement acceptez-vous ?",
                a: "Nous acceptons le paiement à la livraison (espèces), ainsi que les paiements par Mobile Money (Orange Money, MTN MoMo, Moov Money) et Wave via notre partenaire GeniusPay."
            },
            {
                q: "Le paiement en ligne est-il sécurisé ?",
                a: "Absolument. Nos paiements en ligne sont traités par GeniusPay, une solution de paiement africaine certifiée avec chiffrement de bout en bout. Vos données bancaires ne sont jamais stockées sur nos serveurs."
            },
            {
                q: "Puis-je payer en plusieurs fois ?",
                a: "Nous offrons la possibilité de payer en 2 ou 3 fois pour les commandes supérieures à 300 000 F CFA. Contactez-nous pour en savoir plus sur les modalités."
            }
        ]
    },
    {
        title: "🎸 Produits & Disponibilité",
        faqs: [
            {
                q: "Les produits affichés sont-ils en stock ?",
                a: "La disponibilité est indiquée sur chaque fiche produit. Si un article est marqué \"En stock\", il est disponible immédiatement. Les articles \"Sur commande\" nécessitent un délai d'approvisionnement de 7 à 10 jours."
            },
            {
                q: "Proposez-vous des démonstrations de produits ?",
                a: "Oui ! Vous pouvez venir tester nos instruments et équipements dans notre showroom à Abidjan, Cocody Riviera. Une démonstration privée peut également être organisée sur rendez-vous."
            },
            {
                q: "Importez-vous des produits spécifiques sur demande ?",
                a: "Absolument. Notre service d'importation express vous permet de commander tout instrument ou équipement non disponible localement. Le délai d'importation est généralement de 10 jours ouvrables."
            },
            {
                q: "Vos produits sont-ils garantis ?",
                a: "Tous nos équipements électroniques neufs bénéficient d'une garantie de 6 mois couvrant les défauts de fabrication. Les accessoires sont garantis 3 mois. Conservez votre facture pour toute demande de garantie."
            }
        ]
    },
    {
        title: "🔄 Retours & SAV",
        faqs: [
            {
                q: "Quelle est votre politique de retour ?",
                a: "Vous disposez de 7 jours après réception pour retourner un produit non conforme ou défectueux. Le produit doit être dans son emballage d'origine et en parfait état. Contactez-nous d'abord pour initier la procédure."
            },
            {
                q: "Que faire si mon produit est endommagé à la livraison ?",
                a: "Vérifiez l'état du colis à la réception en présence du livreur. Si vous constatez des dommages, refusez le colis et contactez-nous immédiatement au +225 07 77 000 000 ou par email à contact@musicmarket.ci."
            },
            {
                q: "Proposez-vous un service de réparation ?",
                a: "Oui, nous disposons d'un atelier de réparation pour les instruments et équipements de sonorisation. Un devis gratuit vous sera fourni avant toute intervention."
            }
        ]
    }
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            style={{
                border: '1px solid',
                borderColor: open ? '#007BFF' : '#e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                boxShadow: open ? '0 4px 20px rgba(0,123,255,0.08)' : 'none'
            }}
        >
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    padding: '20px 25px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: open ? '#f0f7ff' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '15px',
                    transition: 'background 0.2s'
                }}
            >
                <span style={{ fontSize: '15px', fontWeight: '700', color: open ? '#007BFF' : '#111', lineHeight: '1.4' }}>
                    {q}
                </span>
                <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: open ? '#007BFF' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s'
                }}>
                    <svg
                        width="14" height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={open ? 'white' : '#666'}
                        strokeWidth="2.5"
                        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>
            {open && (
                <div style={{
                    padding: '0 25px 20px',
                    background: '#f0f7ff',
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: '1.8'
                }}>
                    {a}
                </div>
            )}
        </div>
    );
}

export default function FAQsPage() {
    const { settings } = useSettings();
    return (
        <main className="bg-white min-h-screen">
            {/* Hero */}
            <section style={{ background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)', padding: '70px 0', textAlign: 'center', color: 'white' }}>
                <div className="container">
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>❓</div>
                    <h1 style={{ fontSize: '52px', fontWeight: '900', marginBottom: '15px', letterSpacing: '-2px' }}>Questions Fréquentes</h1>
                    <p style={{ fontSize: '18px', opacity: 0.85, maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Toutes les réponses aux questions les plus posées sur MusicMarket.
                    </p>
                </div>
            </section>

            {/* Quick Contact Bar */}
            <div style={{ background: '#FFD200', padding: '15px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>Vous ne trouvez pas votre réponse ?</span>
                    <Link href="/contact" style={{
                        background: '#111', color: 'white', padding: '8px 20px',
                        borderRadius: '20px', textDecoration: 'none',
                        fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'
                    }}>
                        Contactez-nous →
                    </Link>
                </div>
            </div>

            {/* FAQ Categories */}
            <section style={{ maxWidth: '860px', margin: '0 auto', padding: '70px 20px 100px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                    {faqCategories.map((cat, ci) => (
                        <div key={ci}>
                            <h2 style={{
                                fontSize: '22px', fontWeight: '900',
                                marginBottom: '25px', color: '#111',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                {cat.title}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {cat.faqs.map((faq, fi) => (
                                    <FAQItem key={fi} q={faq.q} a={faq.a} index={fi} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div style={{
                    marginTop: '80px', padding: '50px 40px',
                    background: '#f8fafc', borderRadius: '20px',
                    textAlign: 'center', border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#111', marginBottom: '12px' }}>
                        Encore des questions ?
                    </h3>
                    <p style={{ fontSize: '15px', color: '#666', marginBottom: '30px' }}>
                        Notre équipe est disponible du Lundi au Samedi, de 9h à 18h.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} style={{
                            background: '#007BFF', color: 'white',
                            padding: '14px 30px', borderRadius: '10px',
                            fontWeight: '800', textDecoration: 'none', fontSize: '14px'
                        }}>
                            📞 Nous appeler
                        </a>
                        <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{
                            background: '#25D366', color: 'white',
                            padding: '14px 30px', borderRadius: '10px',
                            fontWeight: '800', textDecoration: 'none', fontSize: '14px'
                        }}>
                            💬 WhatsApp
                        </a>
                        <a href={`mailto:${settings.email}`} style={{
                            background: 'white', color: '#111',
                            padding: '14px 30px', borderRadius: '10px',
                            fontWeight: '800', textDecoration: 'none', fontSize: '14px',
                            border: '1px solid #e5e7eb'
                        }}>
                            ✉️ Email
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
