"use client";

import Footer from "@/components/Footer";
import { useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import { useSettings } from "@/context/SettingsContext";

export default function ContactPage() {
    const { settings } = useSettings();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showNotification("Merci pour votre message ! Notre équipe technique vous répondra dans les plus brefs délais.", "success");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const contactItems = [
        {
            label: "Address:",
            value: settings.address,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            ),
            color: "#007BFF",
            bgColor: "#EEF6FF"
        },
        {
            label: "Email:",
            value: settings.email,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            ),
            color: "#007BFF",
            bgColor: "#EEF6FF"
        },
        {
            label: "Number Phone:",
            value: settings.phone,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
            ),
            color: "#FFD200",
            bgColor: "#FFFCEB"
        }
    ];

    const socialIcons = [
        { name: 'facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', link: settings.facebook },
        { name: 'twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z', link: settings.twitter },
        { name: 'instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01', link: settings.instagram }
    ];

    return (
        <main className="bg-white min-h-screen">
            {/* Colorful Hero Section */}
            <section className="bg-primary py-16 text-white text-center animate-fade-in" style={{ background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)' }}>
                <div className="container">
                    <span className="badge badge-yellow mb-4 animate-fade-up delay-100" style={{ display: 'inline-block' }}>SERVICE CLIENT EXPERT</span>
                    <h1 className="text-5xl font-black mb-4 uppercase tracking-widest animate-fade-up delay-200">Contactez MusicMarket</h1>
                    <p className="text-lg mx-auto animate-fade-up delay-300" style={{ maxWidth: '700px', opacity: 0.9 }}>
                        Notre équipe de passionnés est à votre écoute pour vous conseiller et vous accompagner dans votre projet musical.
                    </p>
                </div>
            </section>

            {/* Main Layout Grid */}
            <section className="py-16">
                <div className="container contact-main-grid">

                    {/* LEFT COLUMN: Information */}
                    <div className="animate-fade-up delay-400" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div>
                            <h2 className="text-3xl font-black mb-2 uppercase">Où nous trouver ?</h2>
                            <div style={{ width: '50px', height: '4px', backgroundColor: '#FFD200', marginBottom: '2rem' }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {contactItems.map((item, i) => (
                                <div key={i} className="animate-fade-up" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', animationDelay: `${0.5 + i * 0.1}s` }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: item.bgColor,
                                        color: item.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ paddingTop: '5px' }}>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-2">{item.label}</h4>
                                        <p className="text-lg font-bold" style={{ color: '#1A1A1A', lineHeight: '1.4' }}>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: '#F8F9FA', borderRadius: '15px', border: '1px solid #E5E7EB' }}>
                            <p className="text-sm text-gray" style={{ lineHeight: '1.8', fontStyle: 'italic' }}>
                                "MusicMarket s'engage à fournir le meilleur matériel sonore de la région. N'hésitez pas à nous solliciter pour des démonstrations privées au showroom."
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                {socialIcons.map((icon, i) => (
                                    <a key={i} href={icon.link} target="_blank" rel="noopener noreferrer" style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E7EB',
                                        color: '#9CA3AF',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d={icon.path}></path>
                                            {icon.name === 'instagram' && <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>}
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Form */}
                    <div className="animate-fade-up delay-500">
                        <h2 className="text-3xl font-black mb-10 uppercase">Envoyez-nous un message</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="contact-form-grid">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <label className="text-xs font-black uppercase tracking-widest text-muted">Nom COMPLET <span style={{ color: '#007BFF' }}>*</span></label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Jean Kouassi"
                                        className="input-field"
                                        style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '1.2rem' }}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <label className="text-xs font-black uppercase tracking-widest text-muted">Email <span style={{ color: '#007BFF' }}>*</span></label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="jean@email.com"
                                        className="input-field"
                                        style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '1.2rem' }}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label className="text-xs font-black uppercase tracking-widest text-muted">Sujet <span style={{ color: '#007BFF' }}>*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="De quoi s'agit-il ?"
                                    className="input-field"
                                    style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '1.2rem' }}
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label className="text-xs font-black uppercase tracking-widest text-muted">Message</label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Écrivez votre message ici..."
                                    className="input-field"
                                    style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '1.2rem', resize: 'none' }}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary font-black uppercase tracking-widest"
                                    style={{ padding: '1.5rem 3rem', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)' }}
                                >
                                    Envoyer le message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .contact-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 5rem;
                }
                .contact-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }
                
                @media (max-width: 991px) {
                    .contact-main-grid {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                }
                @media (max-width: 768px) {
                    .contact-form-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                }
            `}</style>
        </main>
    );
}
