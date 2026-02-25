"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <main className="bg-white min-h-screen">
            {/* Page Header */}
            <div style={{ background: '#111111', color: 'white', padding: '60px 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '64px', fontWeight: '800', margin: 0, letterSpacing: '-2px' }}>Mes Coups de Cœur</h1>
                    <nav style={{ fontSize: '14px', color: '#999', marginTop: '20px', fontWeight: '500' }}>
                        <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>Accueil</Link>
                        <span style={{ margin: '0 10px' }}>/</span>
                        <span style={{ color: 'white', fontWeight: '700' }}>Ma Liste</span>
                    </nav>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>
                {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.2 }}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>Votre liste est vide</h2>
                        <p style={{ color: '#666', marginBottom: '30px' }}>Vous n'avez pas encore ajouté de produits à vos favoris.</p>
                        <Link href="/shop" className="btn btn-primary" style={{ padding: '12px 30px', textDecoration: 'none', borderRadius: '4px', fontWeight: '700' }}>
                            Découvrir la boutique
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map((product, index) => (
                            <div key={product.id || index} className="card p-4 relative group" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
                                {/* Remove button */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        border: '1px solid #eee',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#999',
                                        zIndex: 10,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#b22222'; e.currentTarget.style.borderColor = '#b22222'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#eee'; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                </button>

                                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ height: '220px', background: '#f8f8f8', borderRadius: '4px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' }}>
                                        {product.promo && (
                                            <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#b22222', color: 'white', fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '2px' }}>
                                                {product.promo}% PROMO
                                            </div>
                                        )}
                                        <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image'} />
                                    </div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', minHeight: '40px', lineHeight: '1.4' }}>{product.name}</h3>
                                </Link>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    {product.oldPrice && (
                                        <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>{(Number(product.oldPrice) || 0).toLocaleString()}F</span>
                                    )}
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#b22222' }}>{(Number(product.price) || 0).toLocaleString()}F <span style={{ color: '#111', fontSize: '12px' }}>CFA</span></span>
                                </div>

                                <button
                                    onClick={() => addToCart(product)}
                                    className="btn-add-cart"
                                    style={{
                                        width: '100%',
                                        background: 'black',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                    AJOUTER AU PANIER
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />

            <style jsx>{`
                .wishlist-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                }
                @media (max-width: 991px) {
                    .wishlist-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                }
                @media (max-width: 480px) {
                    .wishlist-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                }
            `}</style>
        </main>
    );
}
