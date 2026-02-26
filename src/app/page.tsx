"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNotification } from "@/context/NotificationContext";
import { useSettings } from "@/context/SettingsContext";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Tous les produits");
  const [discount, setDiscount] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { homepage, loading: settingsLoading } = useSettings();

  // Dynamic state
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);
  const [dynamicPromos, setDynamicPromos] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const categories_tabs = ["Tous les produits", "Guitares", "Pianos", "Batteries", "Sono", "Studio"];

  const instruments_categories = [
    { name: "Pianos", category: "PIANOS & CLAVIERS", image: "/images/products/product-4-yamaha-dgx-670-piano-num-rique-88-touches.jpg" },
    { name: "Guitares", category: "GUITARES & BASSES", image: "/images/products/product-1-harley-benton-hqs-el-10-46-jeu-de-6-cordes-pour.jpg" },
    { name: "Batteries", category: "BATTERIES & PERCUSSIONS", image: "/images/products/product-14-alesis-nitro-mesh-kit.jpg" },
    { name: "Violons", category: "VIOLONS & ORCHESTRE", image: "/images/products/product-117-ensemble-violon-sunrise-1414p-4-4.jpg" },
    { name: "Sono", category: "SONORISATION", image: "/images/products/product-213-mackie-cr3-5-3-5-enceintes-de-studio-amplifi-es.jpg" },
    { name: "Synthés", category: "PIANOS & CLAVIERS", image: "/images/products/product-9-akai-professional-mpk-mini-mk3.jpg" },
    { name: "DJ Gear", category: "ÉQUIPEMENT DJ", image: "/images/products/product-109-denon-dj-sc-live-4-standalone-dj-controller-cont.jpg" },
    { name: "Micros", category: "MICROPHONES", image: "/images/products/product-24-audio-technica-at2020-micro-condensateur-cardi.jpg" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, promosRes, recentRes] = await Promise.all([
          fetch('/api/banners', { cache: 'no-store' }),
          fetch('/api/promotions', { cache: 'no-store' }),
          fetch('/api/products?limit=64&sort=newest', { cache: 'no-store' })
        ]);

        if (bannersRes.ok) {
          const bannersData = await bannersRes.json();
          setDynamicBanners(bannersData);
        }

        if (promosRes.ok) {
          const promosData = await promosRes.json();
          setDynamicPromos(promosData);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentProducts(recentData.products || []);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map promotions to products for the Best Deals section
  const promoProducts = dynamicPromos.map(promo => {
    const reviews = promo.products.reviews || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
      : 0;

    return {
      id: promo.products.id,
      name: promo.products.name,
      price: Math.round(promo.products.price * (1 - promo.discount_percent / 100)),
      oldPrice: promo.products.price,
      discount: promo.discount_percent,
      rating: avgRating,
      reviewCount: reviews.length,
      category: promo.products.category,
      image: promo.products.image || "/images/products/placeholder.jpg",
      promoLabel: promo.label || "PROMO",
      delivery_time: promo.products.delivery_time
    };
  });

  // Fallback to recent products if no promotions exist
  const displayProducts = promoProducts.length > 0
    ? promoProducts
    : recentProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.old_price || Math.round(p.price * 1.15),
      discount: p.promo || 0,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      category: p.category,
      image: p.image || "/images/products/placeholder.jpg",
      promoLabel: "NOUVEAUTÉ",
      delivery_time: p.delivery_time
    }));

  const filteredProducts = activeTab === "Tous les produits"
    ? displayProducts.slice(0, 8)
    : displayProducts.filter(p => {
      const cat = (p.category || "").toLowerCase();
      const tab = activeTab.toLowerCase();
      if (tab === "guitares") return cat === "guitares & basses" || cat.includes("guitare") || cat.includes("basse");
      if (tab === "pianos") return cat === "piano & clavier" || cat.includes("piano") || cat.includes("clavier");
      if (tab === "batteries") return cat === "batteries & percussions" || cat.includes("batterie") || cat.includes("percussion");
      if (tab === "sono") return cat === "sonorisation" || cat.includes("enceinte") || cat.includes("mixage");
      if (tab === "studio") return cat === "studio & enregistrement" || cat === "microphones" || cat.includes("studio") || cat.includes("micro") || cat.includes("interface");
      return cat.includes(tab);
    }).slice(0, 8);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsBannerVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (bannerRef.current) observer.observe(bannerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isBannerVisible) {
      let current = 0;
      const target = 100;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / target));

      const timer = setInterval(() => {
        current += 1;
        setDiscount(current);
        if (current === target) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isBannerVisible]);

  // Use the first active banner or fallback to static
  const heroBanner = dynamicBanners.length > 0
    ? dynamicBanners[0]
    : {
      title: "Importation Express 10J",
      description: "Besoin d'un instrument spécifique ? Nous l'importons pour vous en un temps record. Devis gratuit et livraison sécurisée garantie partout en Côte d'Ivoire.",
      image_url: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=800",
      button_link: "/about"
    };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubmittingNewsletter(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();

      if (res.ok) {
        showNotification(data.message, "success");
        setNewsletterEmail("");
      } else {
        showNotification(data.error || "Une erreur est survenue", "error");
      }
    } catch (error) {
      showNotification("Erreur de connexion au serveur", "error");
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const isPageLoading = loading || settingsLoading;

  return (
    <main className="bg-white min-h-screen" style={{ opacity: isPageLoading ? 0 : 1, transition: 'opacity 0.6s ease-in-out' }}>
      {/* Hero Section */}
      <section className="container py-8">
        <div className="grid-main-side">
          <div className="hero-main relative overflow-hidden text-white" style={{ background: '#0a0a0a' }}>
            <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
              <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 d-flex">PROMOTION EXCLUSIVE</span>
              <h1 className="text-5xl font-black mb-6" style={{ lineHeight: 1.1 }}>{heroBanner.title}</h1>
              <p className="text-gray-400 mb-8" style={{ fontSize: '1.1rem' }}>{heroBanner.description}</p>
              <Link href={heroBanner.button_link} className="btn btn-primary px-10 py-4 d-flex items-center gap-2 font-black uppercase tracking-widest" style={{ textDecoration: 'none', width: 'fit-content', borderRadius: '12px', fontSize: '13px', boxShadow: '0 10px 25px rgba(0, 123, 255, 0.3)' }}>
                DÉCOUVRIR LES OFFRES
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="hero-image-box d-flex justify-center items-center" style={{ left: '50%', opacity: 1 }}>
              <Image
                src={heroBanner.image_url}
                alt={heroBanner.title}
                fill
                className="img-cover"
                style={{ mixBlendMode: 'screen', opacity: 0.5, objectFit: 'cover' }}
                priority
              />
              <div className="absolute d-flex flex-column items-center justify-center font-black rounded-full"
                style={{
                  top: '20%',
                  right: '10%',
                  width: '110px',
                  height: '110px',
                  background: '#FFD200',
                  color: 'black',
                  border: '8px solid rgba(255,255,255,0.1)',
                  fontSize: '1.2rem',
                  boxShadow: '0 0 50px rgba(255, 210, 0, 0.3)',
                  zIndex: 30,
                  transform: 'rotate(12deg)'
                }}>
                <span style={{ fontSize: '2.2rem', lineHeight: '0.8' }}>SALE</span>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>HOT</span>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-6">
            {homepage.side_cards.map((card, i) => (
              <div key={i} className="side-card" style={{ background: card.bg_color, color: card.text_color }}>
                <div className="side-card-content">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'inherit' }}>{card.title}</h3>
                  {card.subtitle && <p className="font-black mb-4" style={{ fontSize: '14px', color: card.text_color === '#fff' ? 'var(--primary)' : 'inherit', opacity: 0.9 }}>{card.subtitle}</p>}
                  <Link href={card.link} className="btn btn-primary text-xs font-black uppercase tracking-widest" style={{ width: 'fit-content', padding: '0.8rem 1.5rem', textDecoration: 'none', borderRadius: '8px' }}>DÉCOUVRIR →</Link>
                </div>
                <div className="side-card-image" style={{ opacity: card.bg_color === '#000' ? 0.7 : 0.9 }}>
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="img-contain"
                    style={{ mixBlendMode: card.bg_color === '#000' ? 'normal' : 'multiply', objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="container py-16">
        <div className="mb-8">
          <span className="text-primary font-bold d-flex items-center gap-2 mb-2">
            <span className="bg-primary rounded-full" style={{ width: '4px', height: '16px' }}></span>
            Rayons
          </span>
          <h2 className="text-3xl font-black">Catégories Populaires</h2>
        </div>
        <div className="grid grid-8 gap-6">
          {instruments_categories.map((cat, i) => (
            <Link key={i} href={`/shop?category=${encodeURIComponent(cat.category)}`} className="d-flex flex-column items-center gap-4 cursor-pointer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="category-round" style={{ position: 'relative' }}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  style={{ objectFit: 'cover', padding: '15px' }}
                />
              </div>
              <span className="text-xs font-bold text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* RELIABILITY Promtional Banner */}
      <div className="container" ref={bannerRef}>
        <div className={`promo-banner ${isBannerVisible ? 'bg-active' : ''}`}>
          <div className="d-flex flex-column" style={{ flex: '2' }}>
            <div className="d-flex items-center flex-nowrap mb-4" style={{ gap: '0.2rem' }}>
              {(homepage.promo_banner.title || "").split("").map((char, i) => (
                <span
                  key={i}
                  className={isBannerVisible ? 'letter-animate' : 'opacity-0'}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                    fontWeight: '900',
                    lineHeight: 1,
                    display: 'inline-block',
                    flexShrink: 0,
                    whiteSpace: 'pre'
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            <p className={`text-xl font-bold uppercase tracking-widest ${isBannerVisible ? 'animate-fade-in delay-500' : 'opacity-0'}`} style={{ color: 'white', opacity: 0.9 }}>
              {homepage.promo_banner.subtitle}
            </p>
          </div>

          <div className="d-flex flex-column items-center gap-6" style={{ flex: '1', position: 'relative', zIndex: 12 }}>
            <div className={`discount-large ${isBannerVisible ? 'animate-slide-right' : 'opacity-0'}`} style={{ color: '#111' }}>
              {discount}<span style={{ fontSize: '3rem' }}>%</span>
            </div>
            <Link href={homepage.promo_banner.button_link} className={`buy-now-btn ${isBannerVisible ? 'animate-fade-in delay-1000' : 'opacity-0'}`} style={{ whiteSpace: 'nowrap', border: '1px solid #111', color: '#111' }}>
              {homepage.promo_banner.button_text}
            </Link>
          </div>
        </div>
      </div>

      {/* Best Deals Section */}
      <section className="container py-16">
        <div className="mb-8">
          <div className="section-badge">Meilleure Vente</div>
          <h2 className="text-3xl font-black mb-8">Meilleurs Prix</h2>

          <div className="section-header-flex">
            <div className="tabs-nav" style={{ border: 'none', marginBottom: 0 }}>
              {categories_tabs.map(tab => (
                <button
                  key={tab}
                  className={`tabs-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ fontSize: '1rem', fontWeight: activeTab === tab ? '800' : '500' }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href="/shop" className="btn btn-dark view-all-btn-mobile" style={{ fontSize: '0.9rem', background: '#333', color: 'white', textDecoration: 'none' }}>Tout voir</Link>
          </div>
        </div>

        <div className="grid grid-4 gap-6">
          {filteredProducts.map((prod, i) => (
            <div key={i} className="card p-4">
              <Link href={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="relative aspect-square mb-4 bg-light overflow-hidden p-6" style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="absolute badge badge-red font-bold px-2 py-1" style={{ top: '15px', left: '15px', zIndex: 10 }}>
                    {prod.discount > 0 ? `${prod.discount}% PROMO` : (prod.promoLabel || "NOUVEAUTÉ")}
                  </span>
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="img-contain"
                    style={{ objectFit: 'contain', padding: '20px' }}
                  />
                </div>
              </Link>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex items-center gap-1">
                  <div style={{ display: 'flex', color: '#FFB800', fontSize: '12px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>{s <= Math.round(prod.rating || 0) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">({prod.reviewCount || 0})</span>
                </div>
                <Link href={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4 className="text-sm font-bold line-clamp-2" style={{ minHeight: '42px', lineHeight: '1.4' }}>{prod.name}</h4>
                </Link>
                <div className="d-flex items-center gap-2">
                  <span className="text-gray-400 line-through text-sm">{prod.oldPrice.toLocaleString()}F</span>
                  <span className="price-now" style={{ color: '#b22222', fontSize: '1.1rem', fontWeight: '800' }}>{prod.price.toLocaleString()}F</span>
                </div>

                <div className="card-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => addToCart(prod)}
                    className="btn-add-cart"
                    style={{
                      flex: 1,
                      background: 'black',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-2.61L23 6H6" /></svg>
                    Ajouter
                  </button>
                  <button
                    onClick={() => toggleWishlist(prod)}
                    className="btn-like"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      background: isInWishlist(prod.id) ? '#b22222' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isInWishlist(prod.id) ? 'white' : '#666',
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(prod.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-dark text-white py-16 text-center" style={{ background: '#1A1A1A' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="text-4xl font-black mb-6">Inscrivez-vous à la Newsletter</h2>
          <p className="text-gray-400 mb-10">Recevez nos meilleures offres et conseils de musiciens directement par email.</p>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-input-group mt-10" style={{ maxWidth: '600px', margin: '2.5rem auto 0', height: '52px' }}>
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="newsletter-input"
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, padding: '0 1.5rem' }}
            />
            <button
              type="submit"
              disabled={isSubmittingNewsletter}
              className="btn btn-primary font-bold d-flex items-center justify-center"
              style={{ borderRadius: '0 6px 6px 0', padding: '0 2.5rem', height: '100%', minWidth: '160px' }}
            >
              {isSubmittingNewsletter ? "Envoi..." : "S'inscrire"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
