"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

export default function CartPage() {
    const { items, subtotal, updateQty, removeFromCart } = useCart();

    return (
        <div className="bg-[#fbfbfb] min-h-screen">
            {/* Breadcrumbs */}
            <div className="border-bottom border-gray-100 py-4 mb-10 bg-white">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#999' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
                        <span>/</span>
                        <span style={{ color: '#111', fontWeight: '500' }}>Mon Panier</span>
                    </nav>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
                    gap: '40px',
                    alignItems: 'start'
                }} className="cart-grid">

                    {/* Left: Cart Table Group */}
                    <div className="cart-table-container" style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflowX: 'auto', overflowY: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                                <tr>
                                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#111', letterSpacing: '0.5px' }}>Produit</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#111', letterSpacing: '0.5px', minWidth: '100px' }}>Prix</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#111', letterSpacing: '0.5px', minWidth: '120px' }}>Quantité</th>
                                    <th style={{ padding: '20px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#111', letterSpacing: '0.5px', minWidth: '120px', whiteSpace: 'nowrap' }}>Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ border: 'none', background: 'none', color: '#bbb', cursor: 'pointer', fontSize: '18px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="Supprimer"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                                </button>
                                                <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '5px' }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{ width: '60px', height: '60px', objectFit: 'contain', background: 'white' }}
                                                        onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/100?text=Gear'}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: '#111', fontWeight: '700', fontSize: '13px', lineHeight: '1.4', minWidth: '150px' }}>
                                                        {item.name}
                                                    </Link>
                                                    {item.deliveryTime && (
                                                        <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ fontSize: '14px' }}>🚚</span>
                                                            Livraison : <span style={{ fontWeight: '700', color: item.deliveryTime.includes('semaine') ? '#e67300' : '#28a745' }}>{item.deliveryTime}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#111', whiteSpace: 'nowrap' }}>{item.price.toLocaleString()}F CFA</span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', border: '1px solid #eee', margin: '0 auto', width: '90px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <button onClick={() => updateQty(item.id, -1)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '8px 0', color: '#666', fontSize: '16px' }}>-</button>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: '#111' }}>{item.qty}</div>
                                                <button onClick={() => updateQty(item.id, 1)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '8px 0', color: '#666', fontSize: '16px' }}>+</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '15px', fontWeight: '900', color: '#b22222', whiteSpace: 'nowrap' }}>{(item.price * item.qty).toLocaleString()}F CFA</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '15px', color: '#888', marginBottom: '20px' }}>Votre panier est actuellement vide.</div>
                                            <Link href="/shop" style={{ display: 'inline-block', background: 'black', color: 'white', padding: '15px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>
                                                Retour à la boutique
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {items.length > 0 && (
                            <div className="cart-actions-mobile" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfdfd' }}>
                                <div style={{ display: 'flex', gap: '10px', flex: '1 1 100%' }}>
                                    <input
                                        type="text"
                                        placeholder="Code Promo"
                                        style={{ border: '1px solid #eee', padding: '12px 20px', borderRadius: '4px', width: '100%', fontSize: '13px' }}
                                    />
                                    <button style={{ background: 'black', color: 'white', border: 'none', padding: '0 25px', borderRadius: '4px', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Appliquer
                                    </button>
                                </div>
                                <button style={{ background: '#f0f0f0', color: '#555', border: 'none', padding: '15px 30px', borderRadius: '4px', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', width: '100%' }}>
                                    Mettre à jour le panier
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Cart Totals */}
                    {items.length > 0 && (
                        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '3px solid #000', paddingBottom: '10px', display: 'inline-block' }}>Total Panier</h2>

                            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Sous-total</span>
                                <span style={{ fontSize: '14px', color: '#111', fontWeight: '800', whiteSpace: 'nowrap' }}>{subtotal.toLocaleString()}F CFA</span>
                            </div>

                            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '13px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Expédition</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', color: '#111', fontWeight: '600' }}>Livraison standard</div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Estimation pour la Côte d'Ivoire.</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '40px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Total</span>
                                <span style={{ fontSize: '30px', fontWeight: '900', color: '#b22222', letterSpacing: '-1px', whiteSpace: 'nowrap' }}>{subtotal.toLocaleString()}F CFA</span>
                            </div>

                            <Link href="/checkout" style={{
                                width: '100%',
                                background: 'black',
                                color: 'white',
                                border: 'none',
                                padding: '22px',
                                borderRadius: '6px',
                                fontWeight: '900',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                                letterSpacing: '1px',
                                display: 'block',
                                textAlign: 'center',
                                textDecoration: 'none'
                            }}>
                                Valider la commande
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
