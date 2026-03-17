"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    oldPrice: number | null;
    image: string;
    description: string;
    availability: string;
    deliveryTime: string;
}

interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function ProductDetailClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState("description");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?product_id=${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setIsLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [product.id]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        : 0;

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            showNotification("Vous devez être connecté pour laisser un avis.", "info");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    user_id: user.id,
                    user_name: user.user_metadata?.full_name || user.email,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                const { review } = await res.json();
                setReviews([review, ...reviews]);
                setNewReview({ rating: 5, comment: "" });
                setShowReviewForm(false);
                showNotification("Votre avis a été publié avec succès !", "success");
            } else {
                const errorData = await res.json();
                showNotification(errorData.error || "Erreur lors de la publication de l'avis", "error");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            showNotification("Impossible de publier l'avis. Vérifiez votre connexion.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="border-bottom border-gray-100 py-4 mb-8">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: '#999' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
                        <span>/</span>
                        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category}</Link>
                        <span>/</span>
                        <span style={{ color: '#111', fontWeight: '500' }}>{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', marginBottom: '80px' }}>
                    {/* Left: Image Gallery */}
                    <div>
                        <div style={{
                            background: '#f9f9f9',
                            borderRadius: '8px',
                            padding: '40px',
                            aspectRatio: '1/1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #f0f0f0',
                            position: 'relative'
                        }}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'contain', padding: '20px' }}
                                priority
                            />
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '25px' }}>
                            <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: '28px', fontWeight: '800', color: '#111', marginBottom: '10px', lineHeight: '1.2' }}>{product.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', color: '#fbc02d', fontSize: '14px' }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s}>{s <= Math.round(averageRating) ? "★" : "☆"}</span>
                                    ))}
                                </div>
                                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#999', fontWeight: '600' }}>({reviews.length} avis)</span>
                            </div>
                            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: '800', color: '#007BFF', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {product.category}
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '30px' }}>
                            <span style={{ fontSize: '32px', fontWeight: '900', color: '#b22222' }}>{Number(product.price).toLocaleString()}F CFA</span>
                            {product.oldPrice && (
                                <span style={{ fontSize: '18px', color: '#aaa', textDecoration: 'line-through', fontWeight: '500' }}>{Number(product.oldPrice).toLocaleString()}F CFA</span>
                            )}
                        </div>

                        {/* Description Short */}
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '25px', marginBottom: '40px' }}>
                            <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {product.description.split('\n').slice(0, 4).join('\n')}...
                            </div>
                        </div>

                        {/* Add to Cart Area */}
                        <div className="product-actions-mobile" style={{ display: 'flex', gap: '15px', marginBottom: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', height: '52px', background: '#fff' }}>
                                <button
                                    className="qty-btn"
                                    style={{ width: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
                                >-</button>
                                <div style={{ width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', textAlign: 'center' }}>1</div>
                                <button
                                    className="qty-btn"
                                    style={{ width: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
                                >+</button>
                            </div>
                            <button
                                onClick={() => addToCart(product)}
                                className="btn-add-cart force-visible"
                                style={{ minWidth: '240px', flex: 1 }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-2.61L23 6H6" />
                                </svg>
                                <strong>AJOUTER AU PANIER</strong>
                            </button>
                            <button
                                onClick={() => toggleWishlist(product)}
                                className="btn-like force-visible"
                                style={{
                                    background: isInWishlist(product.id) ? '#b22222' : 'white',
                                    color: isInWishlist(product.id) ? 'white' : '#666'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            </button>
                        </div>

                        {/* Delivery Info Box */}
                        <div style={{ background: '#f8f8f8', padding: '20px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ fontSize: '24px' }}>🚚</div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#111' }}>Livraison Rapide</p>
                                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Expédition en {product.deliveryTime} partout en Côte d'Ivoire.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                    <div className="product-tabs-mobile" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        borderBottom: '1px solid #eee',
                        marginBottom: '40px'
                    }}>
                        {["description", "delivery", "reviews"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    paddingBottom: '15px',
                                    fontSize: '13px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    color: activeTab === tab ? '#007BFF' : '#bbb',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'color 0.3s ease'
                                }}
                            >
                                {tab === "description" ? "Description" : tab === "delivery" ? "Expédition et livraison" : `Avis (${reviews.length})`}
                                {activeTab === tab && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#007BFF' }}></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto', color: '#555', lineHeight: '1.8' }}>
                        {activeTab === "description" && (
                            <div>
                                <h3 style={{ color: '#111', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>DÉTAILS DU PRODUIT</h3>
                                <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
                            </div>
                        )}
                        {activeTab === "delivery" && (
                            <div>
                                <h3 style={{ color: '#111', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>POLITIQUE DE LIVRAISON</h3>
                                <p>Nous offrons plusieurs modes de livraison adaptés à vos besoins :</p>
                                <ul style={{ paddingLeft: '20px', marginTop: '15px' }}>
                                    <li>Abidjan : Livraison express en 24h.</li>
                                    <li>Intérieur : Livraison via transporteurs en 48h-72h.</li>
                                    <li>Point de retrait : Gratuit dans nos agences partenaires.</li>
                                </ul>
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h3 style={{ borderBottom: 'none', margin: 0, fontSize: '18px', fontWeight: '800', color: '#111' }}>AVIS CLIENTS</h3>
                                    {!showReviewForm && (
                                        <button
                                            className="btn btn-dark"
                                            onClick={() => setShowReviewForm(true)}
                                            style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '700' }}
                                        >
                                            LAISSER UN AVIS
                                        </button>
                                    )}
                                </div>

                                {showReviewForm && (
                                    <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '8px', marginBottom: '40px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px' }}>VOTRE AVIS</h4>
                                        <form onSubmit={handleSubmitReview}>
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>NOTE</label>
                                                <div style={{ display: 'flex', gap: '10px', fontSize: '24px', color: '#fbc02d', cursor: 'pointer' }}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s} onClick={() => setNewReview({ ...newReview, rating: s })}>
                                                            {s <= newReview.rating ? "★" : "☆"}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>VOTRE COMMENTAIRE</label>
                                                <textarea
                                                    style={{ width: '100%', padding: '15px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '120px', fontSize: '14px' }}
                                                    required
                                                    value={newReview.comment}
                                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                    placeholder="Partagez votre expérience avec ce produit..."
                                                ></textarea>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="btn btn-dark"
                                                    style={{ padding: '12px 30px', fontWeight: '800' }}
                                                >
                                                    {isSubmitting ? "ENVOI..." : "PUBLIER L'AVIS"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReviewForm(false)}
                                                    style={{ background: 'none', border: 'none', color: '#888', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    ANNULER
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {isLoadingReviews ? (
                                    <p>Chargement des avis...</p>
                                ) : reviews.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                        {reviews.map((rev) => (
                                            <div key={rev.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '25px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '14px', color: '#111' }}>{rev.user_name}</span>
                                                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ color: '#fbc02d', fontSize: '13px', marginBottom: '10px' }}>
                                                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#666' }}>{rev.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <p style={{ fontStyle: 'italic', color: '#999' }}>Il n'y a pas encore d'avis pour ce produit.</p>
                                        <button className="btn btn-outline-dark" onClick={() => setShowReviewForm(true)} style={{ marginTop: '20px', padding: '10px 25px' }}>Soyer le premier à donner votre avis</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div style={{ paddingBottom: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111' }}>PRODUITS SIMILAIRES</h2>
                            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} style={{ color: '#007BFF', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>Voir tout</Link>
                        </div>
                        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                            {relatedProducts.map(prod => (
                                <div key={prod.id} className="shop-card">
                                    <Link href={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="shop-card-image-wrapper">
                                            <Image
                                                src={prod.image}
                                                alt={prod.name}
                                                fill
                                                style={{ objectFit: 'contain', padding: '15px' }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleWishlist(prod);
                                                }}
                                                className="btn-like"
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    zIndex: 10,
                                                    background: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                    cursor: 'pointer',
                                                    color: isInWishlist(prod.id) ? '#e63946' : '#999'
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(prod.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </Link>
                                    <div className="shop-card-content">
                                        <Link href={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px', lineHeight: '1.4' }} className="line-clamp-2">{prod.name}</h4>
                                        </Link>
                                        <div style={{ color: '#b22222', fontWeight: '800', fontSize: '15px' }}>{prod.price.toLocaleString()}F CFA</div>
                                    </div>
                                    <div className="shop-card-actions force-visible" style={{ padding: '20px', marginTop: 'auto' }}>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addToCart(prod);
                                            }}
                                            className="btn-add-cart force-visible"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-2.61L23 6H6" />
                                            </svg>
                                            <strong>AJOUTER AU PANIER</strong>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
