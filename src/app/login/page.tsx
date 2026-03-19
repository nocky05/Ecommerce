"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Persistant check: if already logged in as admin, redirect immediately
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
                    const isEmailAdmin = session.user.email?.toLowerCase().trim() === adminEmail && !!adminEmail;

                    // Also check profile role
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (isEmailAdmin || profile?.role === 'admin') {
                        window.location.href = "/admin";
                        return;
                    }
                }
            } catch (err) {
                console.error("Auth check error:", err);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkExistingSession();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            showNotification('Connexion réussie ! Bon retour.', 'success');

            // Explicitly fetch profile details for immediate redirection
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Erreur lors de la récupération de l'utilisateur.");

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const loginByEmail = email.toLowerCase().trim();
            const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
            const isAdmin = (loginByEmail === adminEmail && !!adminEmail) || profile?.role === 'admin';

            console.log('Redirecting check:', { isAdmin, role: profile?.role });

            if (isAdmin) {
                // Force immediate flush to admin dashboard
                window.location.href = "/admin";
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message === "Invalid login credentials"
                ? "Email ou mot de passe incorrect."
                : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen d-flex items-center justify-center bg-gray-50" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner mb-4 mx-auto"></div>
                    <p className="text-gray-500 font-bold">CHARGEMENT...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Professional Black Banner */}
            <div style={{ background: '#111111', color: 'white', padding: '60px 0', marginBottom: '40px' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
                    <h1 className="auth-banner-title font-black mb-4 uppercase tracking-widest animate-fade-up">Connexion</h1>
                    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#999' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
                        <span>/</span>
                        <span style={{ color: 'white', fontWeight: '700' }}>Connexion</span>
                    </nav>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px' }}>
                    
                    {/* Refined Login Card */}
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
                                Bon Retour
                            </h2>
                            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                                Connectez-vous à votre espace <strong style={{ color: '#111' }}>Chez le musicien</strong>
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '25px', fontSize: '13px', color: '#b91c1c', textAlign: 'left' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }} onSubmit={handleLogin}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px', marginLeft: '5px' }}>Email</label>
                                <input
                                    type="email" required placeholder="votre@email.com"
                                    style={{ width: '100%', padding: '16px 20px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                                    className="auth-input"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '5px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#aaa', letterSpacing: '1.5px' }}>Mot de passe</label>
                                    <Link href="#" style={{ fontSize: '11px', color: '#111', fontWeight: '800', textDecoration: 'none', opacity: 0.6 }}>Oublié ?</Link>
                                </div>
                                <input
                                    type="password" required placeholder="••••••••"
                                    style={{ width: '100%', padding: '16px 20px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                                    className="auth-input"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
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
                                {loading ? "Connexion..." : "Se Connecter"}
                            </button>
                        </form>

                        <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                                Pas encore de compte ?{" "}
                                <Link href="/register" style={{ color: '#111', fontWeight: '900', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S'inscrire</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
