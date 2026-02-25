"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useNotification } from "@/context/NotificationContext";

export default function LoginPage() {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showNotification('Connexion réussie ! Bon retour.', 'success');
            router.push("/");
        } catch (err: any) {
            setError(err.message === "Invalid login credentials"
                ? "Email ou mot de passe incorrect."
                : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)',
            fontFamily: "'Inter', system-ui, sans-serif",
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '480px', position: 'relative', paddingTop: '60px' }}>
                {/* Floating Icon */}
                <div style={{
                    position: 'absolute', top: '0', left: '50%',
                    transform: 'translateX(-50%)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100px', height: '100px',
                    background: 'var(--primary)', borderRadius: '30px', color: 'white',
                    boxShadow: '0 20px 40px rgba(0, 123, 255, 0.3)',
                }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
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
                        Bon retour !
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '35px', lineHeight: '1.6' }}>
                        Connectez-vous à votre compte <strong style={{ color: 'var(--primary)' }}>MusicMarket</strong>
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#b91c1c', textAlign: 'left' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }} onSubmit={handleLogin}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px', marginLeft: '5px' }}>Email</label>
                            <input
                                type="email" required placeholder="votre@email.com"
                                style={{ width: '100%', padding: '18px 22px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '16px', fontSize: '15px', outline: 'none' }}
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '5px' }}>
                                <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px' }}>Mot de passe</label>
                                <Link href="#" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Oublié ?</Link>
                            </div>
                            <input
                                type="password" required placeholder="••••••••"
                                style={{ width: '100%', padding: '18px 22px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '16px', fontSize: '15px', outline: 'none' }}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{
                                marginTop: '10px', padding: '18px',
                                background: loading ? '#93c5fd' : 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '16px', fontSize: '14px',
                                fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 15px 30px rgba(0,123,255,0.2)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? "Connexion..." : "Se Connecter"}
                        </button>
                    </form>

                    <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                            Pas encore de compte ?{" "}
                            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>S'INSCRIRE</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
