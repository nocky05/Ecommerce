"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Typed Product Interface based on database schema
interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    old_price: number | null;
    oldPrice?: number | null; // Compatibility
    promo: number | null;
    image: string;
    description: string;
    availability: string;
    delivery_time: string;
    deliveryTime?: string; // Compatibility
    brand: string | null;
    rating?: number;
    reviewCount?: number;
}


// Top Nav Icons Mapping
const topNavCategories = [
    { name: "ÉQUIPEMENT DJ", count: 5, icon: <><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><circle cx="12" cy="12" r="3" /></> },
    { name: "NOUVEL ARRIVAGE", count: 52, icon: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></> },
    { name: "PROMO FIN D'ANNEE", count: 49, icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></> },
    { name: "VIOLONS & ORCHESTRE", count: 2, icon: <path d="M9 18V5l12-2v13M9 10l12-2" /> },
    { name: "BATTERIES & PERCUSSIONS", count: 114, icon: <><path d="M4 10h16v8H4z" /><path d="M7 10V7h10v3" /><path d="M9 18v3" /><path d="M15 18v3" /></> },
    { name: "ACCESSOIRES", count: 16, icon: <><circle cx="12" cy="12" r="3" /><path d="M3 12h1v10h1v-10h1" /><path d="M18 12h1v10h1v-10h1" /></> },
    { name: "GUITARES & BASSES", count: 83, icon: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></> },
    { name: "INSTRUMENTS À VENT", count: 2, icon: <><path d="M7 10h10v4H7z" /><path d="M5 12h2" /><path d="M17 12h2" /><path d="M19 10l2 4" /></> },
    { name: "PIANOS & CLAVIERS", count: 29, icon: <rect x="2" y="9" width="20" height="6" rx="1" /> },
    { name: "SONORISATION", count: 105, icon: <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" /> },
    { name: "STUDIO & ENREGISTREMENT", count: 50, icon: <><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="17" x2="12" y2="22" /></> }
];

const ITEMS_PER_PAGE = 9;

const CATEGORY_GROUPS: Record<string, string[]> = {
    "GUITARES & BASSES": ["Guitares & basses", "Guitares acoustique", "Basses électriques", "Amplificateurs", "Amplificateurs basses", "Amplificateurs guitares électriques", "Combo Guitare et Basse", "Effets guitares et basses", "Cordes", "Cordes pour basse", "Cordes pour guitare acoustique", "Cordes pour guitare classique", "Cordes pour guitare électrique", "Accessoires guitares"],
    "PIANOS & CLAVIERS": ["Piano & Clavier", "Claviers initiation", "Accessoires pour claviers", "Claviers maîtres"],
    "BATTERIES & PERCUSSIONS": ["Batteries & percussions", "Batteries Électroniques", "Caisse Claire", "Cajon", "Cymbales", "Peaux de Grosse Caisse", "Peaux de Toms", "Peaux de batterie", "Peaux de frappe pour Caisse claire", "Peaux de résonance pour grosses caisses", "Accessoires pour batteurs"],
    "SONORISATION": ["Sonorisation", "Enceintes de sonorisation", "Caissons de Basse Actifs", "Ensemble sono complets", "Crossover", "TABLES DE MIXAGE", "Mesure audio"],
    "STUDIO & ENREGISTREMENT": ["Studio & Enregistrement", "Enceintes de monitoring", "Interfaces Audio", "Casques"],
    "MICROPHONES": ["Microphones", "Microphones pour instruments", "Micros", "Pack vocal"],
    "ÉQUIPEMENT DJ": ["Équipement DJ"],
    "INSTRUMENTS À VENT": ["Instruments à vent", "Accessoires vent"],
    "VIOLONS & ORCHESTRE": ["Violons"],
    "ACCESSOIRES": ["Accessoires", "Accessoires pour musiciens", "Autres accessoires", "/Autres accessoires"],
    "OFFRES SPÉCIALES": ["NOUVEL ARRIVAGE", "Nouveauté", "PROMO FIN D'ANNEE"]
};

export default function ShopContent() {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000000);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQueryFromUrl = searchParams.get('search') || "";
    const selectedCategory = searchParams.get('category');

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQueryFromUrl) params.set('q', searchQueryFromUrl);
            if (selectedCategory) params.set('category', selectedCategory);
            if (minPrice > 0) params.set('min', minPrice.toString());
            if (maxPrice < 5000000) params.set('max', maxPrice.toString());
            params.set('page', currentPage.toString());
            params.set('limit', ITEMS_PER_PAGE.toString());

            const res = await fetch(`/api/products?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();

            const mappedProducts = data.products.map((p: any) => ({
                ...p,
                oldPrice: p.old_price,
                deliveryTime: p.delivery_time
            }));

            setProducts(mappedProducts);
            setTotalCount(data.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (category: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        params.delete('search');
        params.set('page', '1'); // Reset pagination in URL
        router.push(`/shop?${params.toString()}`);
    };

    // Reset page and fetch when URL or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQueryFromUrl]);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQueryFromUrl, minPrice, maxPrice, currentPage]);

    const fetchCategoryCounts = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategoryCounts(data);
            }
        } catch (error) {
            console.error("Error fetching category counts:", error);
        }
    };

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const featuredProducts = products.slice(0, 3);

    return (
        <div className="animate-fade-in" style={{ background: 'white', minHeight: '100vh' }}>
            <div style={{ background: '#111111', color: 'white', padding: '60px 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '60px', fontWeight: '800', margin: '0 0 40px 0', letterSpacing: '-2px' }}>{selectedCategory || "Boutique"}</h1>
                    <div className="top-nav-categories" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                        {topNavCategories.map((cat, i) => {
                            // Sum counts if it's a group, or just get single count
                            const groupCats = CATEGORY_GROUPS[cat.name.toUpperCase()];
                            const count = groupCats
                                ? groupCats.reduce((acc, c) => acc + (categoryCounts[c] || 0), 0)
                                : (categoryCounts[cat.name] || 0);

                            return (
                                <div key={i} onClick={() => { handleCategoryClick(cat.name); setCurrentPage(1); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', opacity: selectedCategory === cat.name ? 1 : 0.7 }}>
                                    <div style={{ background: selectedCategory === cat.name ? 'white' : 'transparent', padding: selectedCategory === cat.name ? '10px' : '0', borderRadius: '10px', color: selectedCategory === cat.name ? 'var(--primary)' : 'white' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{cat.icon}</svg>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{cat.name}</div>
                                        <div style={{ fontSize: '9px', opacity: 0.5 }}>{count} produits</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                <div className="d-block-mobile mb-6">
                    <button onClick={() => setShowMobileFilters(true)} className="btn btn-dark w-full d-flex items-center justify-center gap-2" style={{ padding: '1rem', width: '100%', background: '#111', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        FILTRER LES RÉSULTATS
                    </button>
                </div>

                <div className="shop-layout-grid">
                    {showMobileFilters && <div className="shop-sidebar-overlay d-block-mobile" onClick={() => setShowMobileFilters(false)}></div>}
                    <aside className={`shop-sidebar ${showMobileFilters ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div className="d-block-mobile mb-4" style={{ textAlign: 'right' }}>
                            <button onClick={() => setShowMobileFilters(false)} style={{ background: '#f3f4f6', border: 'none', padding: '10px 15px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Fermer ✕</button>
                        </div>
                        <section>
                            <h2 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>CATÉGORIES</h2>
                            {Object.entries(CATEGORY_GROUPS).map(([groupName, subCategories]) => {
                                const groupTotal = subCategories.reduce((acc, sub) => acc + (categoryCounts[sub] || 0), 0);
                                if (groupTotal === 0 && groupName !== "OFFRES SPÉCIALES") return null;

                                return (
                                    <div key={groupName} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <div onClick={() => setExpandedGroups(prev => prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName])} style={{ padding: '12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                                            <span>{groupName} <span style={{ color: '#999', fontSize: '11px', fontWeight: '400' }}>({groupTotal})</span></span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expandedGroups.includes(groupName) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                        {expandedGroups.includes(groupName) && (
                                            <div style={{ paddingLeft: '15px', paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {subCategories.map(subCat => {
                                                    const subCount = categoryCounts[subCat] || 0;
                                                    if (subCount === 0 && groupName !== "OFFRES SPÉCIALES") return null;

                                                    return (
                                                        <div key={subCat} onClick={() => { handleCategoryClick(subCat); setCurrentPage(1); }} style={{ fontSize: '12px', color: selectedCategory === subCat ? '#b22222' : '#666', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>{subCat}</span>
                                                            <span style={{ opacity: 0.5 }}>{subCount}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </section>

                        <section>
                            <h2 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>FILTRER PAR PRIX</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '10px', color: '#999', display: 'block', marginBottom: '5px' }}>MIN (F CFA)</label>
                                        <input
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(Number(e.target.value))}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #eee', fontSize: '12px', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '10px', color: '#999', display: 'block', marginBottom: '5px' }}>MAX (F CFA)</label>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #eee', fontSize: '12px', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setCurrentPage(1); fetchProducts(); setShowMobileFilters(false); }}
                                    style={{ background: 'black', color: 'white', border: 'none', padding: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    APPLIQUER LE FILTRE
                                </button>
                            </div>
                        </section>

                        {featuredProducts.length > 0 && (
                            <section>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>EN VEDETTE</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {featuredProducts.map(fp => (
                                        <Link key={fp.id} href={`/product/${fp.id}`} style={{ display: 'flex', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ width: '75px', height: '75px', background: '#f9f9f9', position: 'relative', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                                <Image src={fp.image} alt={fp.name} fill style={{ objectFit: 'contain', padding: '8px' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <h3 style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0', lineHeight: '1.4', color: '#333' }} className="line-clamp-2">{fp.name}</h3>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#b22222' }}>{fp.price.toLocaleString()}F CFA</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>

                    <main>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '20px' }}>
                                <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #b22222', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Chargement des produits...</div>
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: '#fff5f5', borderRadius: '10px', color: '#c53030' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                                <div style={{ fontWeight: '700' }}>Erreur de chargement</div>
                                <div style={{ fontSize: '14px' }}>{error}</div>
                                <button onClick={() => fetchProducts()} style={{ marginTop: '20px', padding: '10px 20px', background: '#c53030', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Réessayer</button>
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>Aucun produit trouvé</h3>
                                <p style={{ color: '#666' }}>Essayez d'ajuster vos filtres ou votre recherche.</p>
                                <button onClick={() => { setMinPrice(0); setMaxPrice(5000000); router.push('/shop'); }} style={{ marginTop: '30px', padding: '12px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '30px', fontWeight: '700', cursor: 'pointer' }}>VOIR TOUS LES PRODUITS</button>
                            </div>
                        ) : (
                            <>
                                <div className="product-grid">
                                    {products.map((product) => (
                                        <div key={product.id} className="shop-card">
                                            <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                                <div className="shop-card-image-wrapper">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="shop-card-image"
                                                        style={{ objectFit: 'contain', padding: '15px' }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleWishlist(product);
                                                        }}
                                                        className="btn-like"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '15px',
                                                            right: '15px',
                                                            zIndex: 10,
                                                            background: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '35px',
                                                            height: '35px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            color: isInWishlist(product.id) ? '#e63946' : '#999'
                                                        }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </Link>
                                            <div className="shop-card-content">
                                                <h3 className="line-clamp-2" style={{ fontSize: '14px', fontWeight: '600', minHeight: '40px', marginBottom: '8px' }}>{product.name}</h3>
                                                <div style={{ display: 'flex', color: '#fbc02d', fontSize: '11px', marginBottom: '8px', gap: '2px' }}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s}>{s <= Math.round(product.rating || 0) ? "★" : "☆"}</span>
                                                    ))}
                                                    <span style={{ color: '#999', marginLeft: '5px', fontSize: '10px' }}>({product.reviewCount || 0})</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#b22222' }}>{product.price.toLocaleString()}F CFA</span>
                                                    {product.old_price && (
                                                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#999' }}>{product.old_price.toLocaleString()}F</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shop-card-actions">
                                                <button onClick={() => addToCart(product)} className="btn-add-cart">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-2.61L23 6H6" />
                                                    </svg>
                                                    AJOUTER AU PANIER
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {Number(totalCount) > ITEMS_PER_PAGE && (
                                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            style={{ padding: '10px 15px', border: '1px solid #eee', background: 'white', color: currentPage === 1 ? '#ccc' : '#111', cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 'bold' }}
                                        >
                                            &lt;
                                        </button>
                                        {Array.from({ length: Math.ceil(Number(totalCount) / ITEMS_PER_PAGE) }).map((_, i) => {
                                            const pageNum = i + 1;
                                            if (
                                                pageNum === 1 ||
                                                pageNum === Math.ceil(Number(totalCount) / ITEMS_PER_PAGE) ||
                                                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: 'none',
                                                            background: currentPage === pageNum ? '#b22222' : 'transparent',
                                                            color: currentPage === pageNum ? 'white' : '#111',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                                                if (pageNum < currentPage) return <span key="dots-prev">...</span>;
                                                return <span key="dots-next">...</span>;
                                            }
                                            return null;
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / ITEMS_PER_PAGE)))}
                                            disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                                            style={{ padding: '10px 15px', border: '1px solid #eee', background: 'white', color: currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) ? '#ccc' : '#111', cursor: currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'default' : 'pointer', fontWeight: 'bold' }}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>

                </div>
            </div>
            <Footer />
        </div >
    );
}
