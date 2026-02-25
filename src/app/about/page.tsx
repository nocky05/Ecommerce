"use client";

import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Professional Hero Section */}
            <section className="bg-primary py-20 text-white text-center animate-fade-in" style={{ background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)' }}>
                <div className="container">
                    <h1 className="text-5xl font-black mb-4 uppercase tracking-widest animate-fade-up delay-100">À PROPOS DE MUSICMARKET</h1>
                </div>
            </section>

            {/* Qui sommes-nous Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="about-intro-grid" style={{ alignItems: 'center' }}>
                        <div className="animate-fade-up delay-200">
                            <h2 className="text-3xl font-black mb-6 uppercase">Qui sommes-nous ?</h2>
                            <div style={{ width: '60px', height: '4px', backgroundColor: '#FFD200', marginBottom: '2.5rem' }}></div>
                            <div className="space-y-6 text-gray-700 leading-relaxed" style={{ fontSize: '1.1rem' }}>
                                <p>
                                    <strong className="text-primary">MusicMarket</strong> est une plateforme leader spécialisée dans la vente d’instruments et équipements de musique, matériel de sonorisation et équipements pour studio d’enregistrement.
                                </p>
                                <p>
                                    Basés à Abidjan, nous accompagnons les artistes, les églises, les salles de concert et les passionnés de musique à travers toute la Côte d'Ivoire et la sous-région.
                                </p>
                                <p>
                                    Notre mission est de fournir le meilleur matériel sonore avec une expertise et une passion inégalées.
                                </p>
                            </div>
                        </div>
                        <div className="animate-fade-up delay-300" style={{
                            background: '#F8F9FA',
                            borderRadius: '30px',
                            padding: '3rem',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                        }}>
                            <h3 className="text-xl font-black mb-4 uppercase text-primary">Un service d'importation unique</h3>
                            <p className="mb-6 text-gray-600 leading-relaxed">
                                Vous cherchez une pièce rare ou un modèle spécifique non disponible sur le marché local ? MusicMarket importe vos équipements en seulement <span className="font-bold text-black text-lg">10 JOURS</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="container">
                    <div className="text-center mb-16 animate-fade-up delay-400">
                        <h2 className="text-3xl font-black uppercase mb-4">Notre Mission</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Rendre la musique accessible à tous avec les meilleurs équipements du marché mondial.</p>
                    </div>

                    <div className="grid-3 gap-8">
                        <div className="card p-12 text-center animate-fade-up delay-500" style={{ borderRadius: '20px' }}>
                            <div style={{ color: '#007BFF', marginBottom: '1.5rem' }}>
                                <svg width="48" height="48" className="mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 8v4l3 3"></path>
                                </svg>
                            </div>
                            <h4 className="text-xl font-black mb-4 uppercase">Meilleurs Prix</h4>
                            <p className="text-sm text-gray leading-relaxed">
                                Nous négocions directement avec les fabricants pour vous offrir des tarifs ultra-compétitifs sans compromis sur la qualité.
                            </p>
                        </div>

                        <div className="card p-12 text-center" style={{ borderRadius: '20px' }}>
                            <div style={{ color: '#007BFF', marginBottom: '1.5rem' }}>
                                <svg width="48" height="48" className="mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h4 className="text-xl font-black mb-4 uppercase">Qualité Garantie</h4>
                            <p className="text-sm text-gray leading-relaxed">
                                Bénéficiez d’une garantie allant jusqu’à <span className="font-bold text-black">6 MOIS</span> sur tous nos produits électroniques neufs.
                            </p>
                        </div>

                        <div className="card p-12 text-center" style={{ borderRadius: '20px' }}>
                            <div style={{ color: '#007BFF', marginBottom: '1.5rem' }}>
                                <svg width="48" height="48" className="mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            </div>
                            <h4 className="text-xl font-black mb-4 uppercase">Livraison Record</h4>
                            <p className="text-sm text-gray leading-relaxed">
                                Nous vous livrons partout en Côte d'Ivoire avec une indication claire et précise des délais de livraison.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Buy Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="bg-dark text-white p-12 md:p-20" style={{ borderRadius: '40px', background: '#1A1A1A' }}>
                        <div className="about-why-grid" style={{ alignItems: 'center' }}>
                            <div>
                                <h2 className="text-4xl font-black mb-8 uppercase tracking-tight">Pourquoi choisir <span className="text-primary">MusicMarket</span> ?</h2>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[
                                        "Importation express en 10 jours",
                                        "Garantie réelle de 6 mois sur l'électronique",
                                        "Assistance client disponible 6 jours sur 7",
                                        "Sélection des plus grandes marques mondiales"
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', backgroundColor: '#FFD200', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span style={{ fontSize: '1.1rem', opacity: 0.9 }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-center">
                                <a href="/shop" className="btn btn-primary" style={{ padding: '2rem 4rem', fontSize: '1.1rem', borderRadius: '15px' }}>
                                    ACHETER UN PRODUIT
                                </a>
                                <p className="mt-6 text-muted text-sm">Qualité Premium - Service Expert</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 border-t border-gray-100">
                <div className="container">
                    <div className="grid-3 gap-12">
                        <div className="d-flex items-center gap-6">
                            <div className="text-primary">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="3" width="15" height="13"></rect>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-bold uppercase mb-1">Livraison Rapide</h5>
                                <p className="text-xs text-muted">Temps record en Côte d'Ivoire</p>
                            </div>
                        </div>
                        <div className="d-flex items-center gap-6">
                            <div className="text-primary">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-bold uppercase mb-1">Assistance 6j/7</h5>
                                <p className="text-xs text-muted">À votre écoute du Lundi au Samedi</p>
                            </div>
                        </div>
                        <div className="d-flex items-center gap-6">
                            <div className="text-primary">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-bold uppercase mb-1">Qualité Garantie</h5>
                                <p className="text-xs text-muted">La qualité est notre emblème</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .about-intro-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5rem;
                }
                .about-why-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 4rem;
                }
                
                @media (max-width: 991px) {
                    .about-intro-grid, .about-why-grid {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                }
                @media (max-width: 768px) {
                    .about-intro-grid, .about-why-grid {
                        gap: 2rem;
                    }
                }
            `}</style>
        </main>
    );
}
