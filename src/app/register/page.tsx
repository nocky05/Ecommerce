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
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #fdf4f0 0%, #ffffff 100%)',
            fontFamily: "'Inter', system-ui, sans-serif",
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '520px', position: 'relative', paddingTop: '60px' }}>
                {/* Floating Icon */}
                <div style={{
                    position: 'absolute', top: '0', left: '50%',
                    transform: 'translateX(-50%) rotate(5deg)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100px', height: '100px',
                    background: 'var(--primary)', borderRadius: '30px', color: 'white',
                    boxShadow: '0 20px 40px rgba(0, 123, 255, 0.3)',
                }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                </div>

                {/* Card */}
                <div style={{
                    background: 'white', borderRadius: '40px',
                    padding: '80px 50px 50px 50px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.03)', textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px', color: '#1a1a1a', letterSpacing: '-1px' }}>
                        Rejoignez-nous
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '35px', lineHeight: '1.6' }}>
                        Créez votre compte <strong style={{ color: 'var(--primary)' }}>MusicMarket</strong>
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#b91c1c', textAlign: 'left' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }} onSubmit={handleRegister}>
                        {[
                            { label: 'Nom complet', type: 'text', placeholder: 'Ex: Jean Kouassi', value: name, onChange: setName },
                            { label: 'Adresse e-mail', type: 'email', placeholder: 'votre@email.com', value: email, onChange: setEmail },
                            { label: 'Mot de passe', type: 'password', placeholder: '••••••••', value: password, onChange: setPassword },
                        ].map(({ label, type, placeholder, value, onChange }) => (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px', marginLeft: '5px' }}>{label}</label>
                                <input
                                    type={type} required placeholder={placeholder}
                                    style={{ width: '100%', padding: '18px 22px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '16px', fontSize: '15px', outline: 'none' }}
                                    value={value} onChange={(e) => onChange(e.target.value)}
                                />
                            </div>
                        ))}

                        <div style={{ padding: '15px 18px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'start', gap: '12px', border: '1px solid #edf2f7' }}>
                            <input
                                type="checkbox" id="terms"
                                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                            />
                            <label htmlFor="terms" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', fontWeight: '600', cursor: 'pointer' }}>
                                J'accepte les{" "}
                                <Link href="#" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>Conditions d'Utilisation</Link>
                                {" "}et la{" "}
                                <Link href="#" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>Politique de Confidentialité</Link>.
                            </label>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{
                                marginTop: '8px', padding: '18px',
                                background: loading ? '#93c5fd' : 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '16px', fontSize: '14px',
                                fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 15px 30px rgba(0,123,255,0.2)',
                            }}
                        >
                            {loading ? "Création..." : "Créer mon compte"}
                        </button>
                    </form>

                    <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                            Déjà inscrit ?{" "}
                            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>SE CONNECTER</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
