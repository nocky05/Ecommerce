"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const STATUS_STEPS = ['En Cours', 'Confirmée', 'En Préparation', 'En Transit', 'Prêt pour livraison', 'Livré'];

function statusStep(s: string) {
    const idx = STATUS_STEPS.indexOf(s);
    return idx === -1 ? 0 : idx;
}

export default function ProfilePage() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .then(({ data }) => {
                    setOrders(data || []);
                    setOrdersLoading(false);
                });
        }
    }, [user]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666' }}>
                Chargement...
            </div>
        );
    }

    if (!user) return null;

    const displayName = profile?.full_name || user.email?.split("@")[0] || "Utilisateur";
    const joinDate = new Date(user.created_at).toLocaleDateString("fr-CI", { year: "numeric", month: "long" });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '30px', paddingBottom: '80px', fontFamily: "'Inter', system-ui" }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>

                {/* Profile Header */}
                <div style={{ background: 'linear-gradient(135deg, #007BFF, #0040cc)', borderRadius: '24px', padding: '40px 40px', color: 'white', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '38px', fontWeight: '900', border: '3px solid rgba(255,255,255,0.6)'
                    }}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 4px' }}>{displayName}</h1>
                        <p style={{ margin: '0 0 4px', opacity: 0.8, fontSize: '14px' }}>{user.email}</p>
                        <p style={{ margin: 0, opacity: 0.6, fontSize: '12px' }}>Membre depuis {joinDate}</p>
                    </div>
                    <button
                        onClick={signOut}
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', backdropFilter: 'blur(5px)' }}
                    >
                        🚪 Déconnexion
                    </button>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                    {[
                        { label: 'Commandes', value: orders.length, icon: '📦' },
                        { label: 'En cours', value: orders.filter(o => o.status === 'En Cours' || o.status === 'En Préparation').length, icon: '⏳' },
                        { label: 'Livrées', value: orders.filter(o => o.status === 'Livré').length, icon: '✅' },
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8' }}>
                            <div style={{ fontSize: '30px', marginBottom: '6px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#007BFF' }}>{stat.value}</div>
                            <div style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Orders */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '25px', color: '#111' }}>
                        📋 Mes Commandes
                    </h2>

                    {ordersLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>Chargement des commandes...</div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '60px', marginBottom: '15px' }}>📭</div>
                            <p style={{ color: '#666', fontWeight: '600', marginBottom: '20px' }}>Vous n'avez pas encore de commande.</p>
                            <Link href="/shop" style={{ background: '#007BFF', color: 'white', padding: '12px 30px', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '13px' }}>
                                Commencer mes achats →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {orders.map((order) => (
                                <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                        <div>
                                            <span style={{ fontSize: '15px', fontWeight: '900', color: '#111' }}>{order.id}</span>
                                            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#999' }}>
                                                {new Date(order.created_at).toLocaleDateString("fr-CI")}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '800', padding: '5px 12px',
                                            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                            background: order.status === 'Livré' ? '#dcfce7' : order.status === 'Annulée' ? '#fee2e2' : '#fef9c3',
                                            color: order.status === 'Livré' ? '#16a34a' : order.status === 'Annulée' ? '#dc2626' : '#b45309'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    {order.status !== 'Annulée' && (
                                        <div className="profile-timeline-container" style={{ marginBottom: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            <div style={{ minWidth: '500px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    {STATUS_STEPS.map((step, i) => (
                                                        <div key={step} style={{ textAlign: 'center', flex: 1, padding: '0 5px' }}>
                                                            <div style={{
                                                                width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 6px',
                                                                background: i <= statusStep(order.status) ? '#007BFF' : '#e5e7eb',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                {i <= statusStep(order.status) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                                            </div>
                                                            <div style={{ fontSize: '9px', lineHeight: '1.2', color: i <= statusStep(order.status) ? '#007BFF' : '#aaa', fontWeight: '800', textTransform: 'uppercase' }}>{step}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: '#007BFF', borderRadius: '999px', width: `${(statusStep(order.status) / (STATUS_STEPS.length - 1)) * 100}%`, transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div style={{ padding: '15px 0', borderTop: '0.5px solid #eee', marginBottom: '15px' }}>
                                        {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                                                <span>{item.qty} x {item.name}</span>
                                                <span style={{ fontWeight: '600' }}>{(item.qty * item.price).toLocaleString()} F</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ fontSize: '13px', color: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800' }}>
                                        <span style={{ opacity: 0.6 }}>Total Payé</span>
                                        <span style={{ color: '#007BFF', fontSize: '16px' }}>{Number(order.total).toLocaleString("fr-CI")} F CFA</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
