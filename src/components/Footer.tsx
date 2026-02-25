"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
    const { settings } = useSettings();
    return (
        <footer className="bg-dark text-muted py-16" style={{ borderTop: '1px solid var(--gray-800)', background: '#1A1A1A' }}>
            <div className="container footer-grid">
                {/* Column 1: Brand & Social */}
                <div className="d-flex flex-column items-start">
                    <div className="d-flex items-center gap-2 mb-8 text-white">
                        <div className="bg-white rounded-full d-flex items-center justify-center" style={{ width: '38px', height: '38px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M9 18V5l12-2v13" /></svg>
                        </div>
                        <span className="text-2xl font-black italic tracking-tight">{settings.name.split(' ')[0]}<span style={{ color: '#FFD200' }}>{settings.name.split(' ')[1] || ""}</span></span>
                    </div>
                    <p className="text-xs text-gray-400 mb-10 leading-loose" style={{ textAlign: 'justify' }}>
                        MUSIC MARKET est une plateforme leader spécialisée dans la vente d'instruments et équipements de musique, matériel de sonorisation, et équipements pour studio d'enregistrement et de répétition.
                    </p>
                    <div className="d-flex gap-3 mt-auto">
                        <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-primary transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                        <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-primary transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg></a>
                        <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-primary transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
                    </div>
                </div>

                {/* Column 2: Useful Links */}
                <div>
                    <h4 className="text-white mb-8 text-sm font-bold uppercase tracking-widest">Liens utiles</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px 30px' }} className="text-xs">
                        <Link href="/" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Accueil</Link>
                        <Link href="/shop" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Boutique</Link>
                        <Link href="/blog" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Blog</Link>
                        <Link href="/about" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">À Propos</Link>
                        <Link href="/contact" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Contacts</Link>
                    </div>
                </div>

                {/* Column 3: Products */}
                <div>
                    <h4 className="text-white mb-8 text-sm font-bold uppercase tracking-widest">Nos Produits</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px 30px' }} className="text-xs">
                        <Link href="/shop?category=Batteries%20%26%20percussions" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Batteries & percussions</Link>
                        <Link href="/shop?category=Piano%20%26%20Clavier" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Piano & Clavier</Link>
                        <Link href="/shop?category=Guitares%20%26%20basses" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Guitares & basses</Link>
                        <Link href="/shop?category=Sonorisation" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Sonorisation</Link>
                        <Link href="/shop?category=Studio%20%26%20Enregistrement" style={{ textDecoration: 'none', color: '#999' }} className="hover:text-white transition">Studio & Enregistrement</Link>
                    </div>
                </div>
            </div>
            <div className="container text-center mt-16 text-xs" style={{ borderTop: '1px solid var(--gray-800)', paddingTop: '2.5rem' }}>
                <p>© {new Date().getFullYear()} {settings.name} - Tous droits réservés.</p>
            </div>
        </footer>
    );
}
