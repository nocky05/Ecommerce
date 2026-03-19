"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useNotification } from "@/context/NotificationContext";

export default function RegisterPage() {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) { setError("Veuillez accepter les conditions d'utilisation."); return; }
        if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }

        setError(""); setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } }
            });
            if (error) throw error;
            showNotification('Compte créé avec succès ! Vous êtes maintenant connecté.', 'success');
            router.push('/');
        } catch (err: any) {
            if (err.message.includes("already registered")) {
                setError("Cet email est déjà utilisé. Connectez-vous.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Professional Black Banner */}
            <div style={{ background: '#111111', color: 'white', padding: '60px 0', marginBottom: '40px' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
                    <h1 className="auth-banner-title font-black mb-4 uppercase tracking-widest animate-fade-up">Inscription</h1>
                    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#999' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
                        <span>/</span>
                        <span style={{ color: 'white', fontWeight: '700' }}>Inscription</span>
                    </nav>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px' }}>
                    
                    {/* Refined Register Card */}
                    <div style={{
                        background: 'white', 
                        borderRadius: '30px',
                        padding: '50px',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.04)',
                        border: '1px solid #f0f4f8', 
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Rejoignez-nous
                            </h2>
                            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                                Créez votre compte <strong style={{ color: '#111' }}>Chez le musicien</strong>
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '25px', fontSize: '13px', color: '#b91c1c', textAlign: 'left' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }} onSubmit={handleRegister}>
                            {[
                                { label: 'Nom complet', type: 'text', placeholder: 'Ex: Jean Kouassi', value: name, onChange: setName },
                                { label: 'Adresse e-mail', type: 'email', placeholder: 'votre@email.com', value: email, onChange: setEmail },
                                { label: 'Mot de passe', type: 'password', placeholder: '••••••••', value: password, onChange: setPassword },
                            ].map(({ label, type, placeholder, value, onChange }) => (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px', marginLeft: '5px' }}>{label}</label>
                                    <input
                                        type={type} required placeholder={placeholder}
                                        style={{ width: '100%', padding: '16px 20px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                                        value={value} onChange={(e) => onChange(e.target.value)}
                                        className="auth-input"
                                    />
                                </div>
                            ))}

                            <div style={{ padding: '15px 18px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'start', gap: '12px', border: '1px solid #edf2f7' }}>
                                <input
                                    type="checkbox" id="terms"
                                    style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#111' }}
                                    checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <label htmlFor="terms" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', fontWeight: '600', cursor: 'pointer' }}>
                                    J'accepte les{" "}
                                    <Link href="#" style={{ color: '#111', fontWeight: '800', textDecoration: 'none' }}>Conditions</Link>
                                    {" "}et la{" "}
                                    <Link href="#" style={{ color: '#111', fontWeight: '800', textDecoration: 'none' }}>Confidentialité</Link>.
                                </label>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                style={{
                                    marginTop: '8px', padding: '16px',
                                    background: loading ? '#666' : '#111', color: 'white',
                                    border: 'none', borderRadius: '12px', fontSize: '13px',
                                    fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}
                            >
                                {loading ? "Création..." : "Créer mon compte"}
                            </button>
                        </form>

                        <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                                Déjà inscrit ?{" "}
                                <Link href="/login" style={{ color: '#111', fontWeight: '900', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Se connecter</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
