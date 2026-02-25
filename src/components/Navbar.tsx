"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/context/SettingsContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const CATEGORIES = [
  "Toutes catégories",
  "Batteries & percussions",
  "Piano & Clavier",
  "Guitares & basses",
  "Sonorisation",
  "Studio & Enregistrement",
  "Microphones",
  "Instruments à vent",
  "Violons"
];

export default function Navbar() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { totalWishlistItems } = useWishlist();
  const isHome = pathname === "/";
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCategory, setSearchCategory] = useState("Toutes catégories");
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || searchCategory !== "Toutes catégories") {
      setShowSuggestions(false);
      let url = `/shop?`;
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (searchCategory !== "Toutes catégories") params.set("category", searchCategory);

      router.push(`/shop?${params.toString()}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const params = new URLSearchParams();
          params.set('q', searchQuery.trim());
          if (searchCategory !== "Toutes catégories") {
            params.set('category', searchCategory);
          }
          params.set('limit', '6');

          const res = await fetch(`/api/products?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.products || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const mainLinks = [
    { name: "Accueil", href: "/" },
    { name: "Catalogue", href: "/shop" },
    { name: "À Propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full sticky top-0" style={{ zIndex: 1000 }}>
      {/* 1. Top Bar - Professional Blue */}
      <div className="py-2 hidden-mobile" style={{ background: '#004a99', color: 'white', fontSize: '12px' }}>
        <div className="container d-flex justify-between items-center">
          <div className="d-flex items-center gap-6">
            <div className="d-flex items-center gap-2">
              <span style={{ opacity: 0.9 }}>{settings.email}</span>
            </div>
            <div className="d-flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              <span>{settings.phone}</span>
            </div>
          </div>
          <div className="d-flex items-center gap-4">
            <div className="d-flex items-center gap-3" style={{ borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54v-2.2c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.9h-2.33v7c4.78-.75 8.44-4.9 8.44-9.9 0-5.53-4.5-10.02-10-10.02z" /></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.76.46 3.41 1.25 4.84l-1.33 4.87 5 .4-.01.01c1.51.59 3.16.88 4.85.88 5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.66 14.22c-.24.67-1.18 1.25-1.92 1.34-.14.02-.29.03-.45.03-1.48.01-5.69-2.12-6.52-2.48l-.01-.01C8.24 14.88 6.13 13.01 6.13 10.51c0-1.12.59-1.68.83-1.93.31-.32.74-.46 1.15-.46.13 0 .26 0 .37.01.42.02.63.05.91.71l.71 1.72c.11.26.17.51.01.82l-.44.55c-.13.16-.27.35-.11.64.16.29.35.61.64.91.43.43.83.74 1.35 1l.01.01c.29.17.47.16.63-.04l.58-.75c.13-.17.34-.23.51-.13l1.83.91c.29.14.47.34.42.63l-.01.01z" /></svg>
            </div>
            <Link href="/faqs" style={{ textDecoration: 'none', color: 'white' }}>QUESTIONS</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header - Blue */}
      <div className="py-6 py-4-mobile" style={{ background: '#007BFF', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container header-main-grid">
          {/* Logo & Hamburger Section */}
          <div className="d-flex items-center gap-3">
            <button
              className="d-block-mobile"
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link href="/" className="d-flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div className="bg-white rounded-full d-flex items-center justify-center logo-icon-box" style={{ width: '45px', height: '45px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BFF" strokeWidth="3">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="text-2xl font-black text-white logo-text">Music<span style={{ color: '#FFD200' }}>Market</span></span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSearch}
            className="d-flex relative search-form-container"
            style={{ height: '44px', background: 'white', borderRadius: '4px', overflow: 'visible' }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setShowSuggestions(false);
              }
            }}
          >
            <input
              type="text"
              placeholder="Rechercher un instrument..."
              className="flex-1 px-4 text-sm outline-none border-none"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-b-lg overflow-hidden animate-fade-in" style={{ top: '100%', zIndex: 1000 }}>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b border-gray-50 last:border-none"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ width: '40px', height: '40px', background: '#f8f8f8', borderRadius: '4px', padding: '4px' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }} className="line-clamp-1">{product.name}</div>
                      <div style={{ fontSize: '11px', color: '#b22222', fontWeight: '800' }}>{product.price.toLocaleString()}F CFA</div>
                    </div>
                  </Link>
                ))}
                <button
                  type="submit"
                  style={{ width: '100%', padding: '12px', background: '#fcfcfc', border: 'none', fontSize: '11px', fontWeight: '800', color: '#007BFF', cursor: 'pointer', textAlign: 'center', textTransform: 'uppercase' }}
                >
                  Voir tous les résultats pour "{searchQuery}"
                </button>
              </div>
            )}

            {/* Category Selector */}
            <div
              className="relative d-flex items-center px-4 cursor-pointer hover:bg-gray-50 transition"
              style={{ borderLeft: '1px solid #eee', color: '#666', fontSize: '11px', fontWeight: 'bold', minWidth: '150px' }}
              onClick={() => setSearchCategoryOpen(!searchCategoryOpen)}
            >
              <span className="line-clamp-1 truncate">{searchCategory.toUpperCase()}</span>
              <svg className="ml-2 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>

              {searchCategoryOpen && (
                <div
                  className="absolute right-0 bg-white shadow-2xl border border-gray-100 rounded-b-lg overflow-y-auto animate-fade-in"
                  style={{ top: '100%', zIndex: 1100, minWidth: '220px', maxWidth: '300px', maxHeight: '60vh' }}
                >
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="px-4 py-3 hover:bg-gray-50 transition text-gray-800 text-[11px] uppercase font-black"
                      style={{ borderBottom: '1px solid #f9f9f9', whiteSpace: 'normal', lineHeight: '1.4' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchCategory(cat);
                        setSearchCategoryOpen(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-5 d-flex items-center justify-center"
              style={{ background: 'black', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>

          {/* Action Zone - Right */}
          <div className="d-flex items-center justify-end user-actions-container" style={{ gap: '2rem', color: 'white' }}>
            <div className="d-flex items-center gap-3 group hidden-mobile">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <div className="text-[9px] font-black uppercase d-flex flex-row items-center gap-2 transition">
                {user ? (
                  <div className="d-flex items-center gap-3">
                    <Link href="/profile" className="hover:text-yellow-300 transition block" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {profile?.full_name || user.email?.split("@")[0]}
                    </Link>
                    <span style={{ opacity: 0.3, fontWeight: 'normal' }}>|</span>
                    <button
                      onClick={signOut}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0.5, cursor: 'pointer', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                      className="hover:text-yellow-300 transition"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-yellow-300 transition block" style={{ textDecoration: 'none', color: 'inherit' }}>Connexion</Link>
                    <span style={{ opacity: 0.3, fontWeight: 'normal' }}>|</span>
                    <Link href="/register" className="hover:text-yellow-300 transition block" style={{ textDecoration: 'none', color: 'inherit' }}>Enregistrement</Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile-only User Icon */}
            <Link href={user ? "/profile" : "/login"} className="relative cursor-pointer text-white d-block-mobile" style={{ textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </Link>

            <Link href="/wishlist" className="relative cursor-pointer text-white" style={{ textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              <span className="absolute bg-black text-white text-[9px] font-black d-flex items-center justify-center rounded-full shadow-sm"
                style={{ top: '-4px', right: '-8px', width: '16px', height: '16px', border: '1px solid #007BFF' }}>{totalWishlistItems}</span>
            </Link>
            <Link href="/cart" className="d-flex items-center gap-2 cursor-pointer text-white" style={{ textDecoration: 'none' }}>
              <div className="relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span className="absolute bg-black text-white text-[9px] font-black d-flex items-center justify-center rounded-full shadow-sm"
                  style={{ top: '-4px', right: '-8px', width: '16px', height: '16px', border: '1px solid #007BFF' }}>{totalItems}</span>
              </div>
              <span className="text-[11px] font-black uppercase ml-1 hidden-mobile">{subtotal.toLocaleString()}F CFA</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar - Professional Blue */}
      <div className="py-0 hidden-mobile" style={{ background: '#0056b3', position: 'relative', zIndex: 100 }}>
        <div className="container d-flex items-center">
          {/* Categories Button */}
          <div className="relative group" style={{ minWidth: '280px' }}>
            <div
              className="d-flex items-center gap-3 px-6 h-[56px] bg-white cursor-pointer transition"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              <span className="text-[11px] font-black uppercase text-gray-900 tracking-tight">Parcourir les catégories</span>
              <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>
            </div>

            {categoriesOpen && (
              <div className="absolute left-0 w-full bg-white shadow-xl shadow-black/10" style={{ top: '100%', zIndex: 200, border: '1px solid #e5e7eb', borderRadius: '0 0 6px 6px', overflow: 'hidden' }}>
                {[
                  { name: "Batteries & percussions", icon: <path d="M7 4a2 2 0 1 1 4 0v4H7V4zm10 0a2 2 0 1 1-4 0v4h4V4zM5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z" />, href: "/shop?category=Batteries+%26+percussions" },
                  { name: "Piano & Clavier", icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v14h-2v-7h-2v7h-2v-7h-2v7h-2v-7H7v7H5V5h14z" />, href: "/shop?category=Piano+%26+Clavier" },
                  { name: "Guitares & basses", icon: <path d="M10.85 2c-.37 0-.73.1-.99.3l-1.54 1.16c-.25.18-.32.53-.26.83l.21.94h1.74l-.2-1.09.5-.39.46 2.05h1.76l.32-2.12-.49-.37-.32 1.09h-1.2l.01-1.4zM7.5 7c-.28 0-.5.22-.5.5v11.5a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5H7.5zm1.5 9h-1v-2h1v2zm0-3h-1v-2h1v2zm0-3h-1V8h1v2zm2 6h-1v-2h1v2zm0-3h-1v-2h1v2zm0-3h-1V8h1v2zm2 6h-1v-2h1v2zm0-3h-1v-2h1v2zm0-3h-1V8h1v2z" />, href: "/shop?category=Guitares+%26+basses" },
                  { name: "Sonorisation", icon: <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />, href: "/shop?category=Sonorisation" },
                  { name: "Studio & Enregistrement", icon: <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />, href: "/shop?category=Studio+%26+Enregistrement" },
                ].map((cat, idx) => (
                  <Link
                    key={idx}
                    href={cat.href}
                    className="px-6 py-3 d-flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition"
                    style={{ textDecoration: 'none', color: '#1A1A1A', borderBottom: '1px solid #f3f4f6' }}
                  >
                    <div className="d-flex items-center justify-center text-gray-800" style={{ width: '24px', height: '24px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        {cat.icon}
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links - Centered or follow the button */}
          <nav className="d-flex items-center flex-1 ml-4 gap-2 h-[56px] justify-center">
            {mainLinks.map(link => {
              const isActive = pathname === link.href || (link.href === "/shop" && pathname.startsWith("/shop"));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-6 d-flex items-center text-[11px] font-black uppercase transition"
                  style={{
                    textDecoration: 'none',
                    height: isActive ? '36px' : 'h-full',
                    background: isActive ? 'white' : 'transparent',
                    color: isActive ? '#007BFF' : 'white',
                    borderRadius: isActive ? '8px' : '0',
                    fontWeight: '900'
                  }}
                >
                  {link.name === "Catalogue" ? "Boutique" : link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Hamburger Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 d-block-mobile" style={{ position: 'fixed', zIndex: 2000, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileMenuOpen(false)}>
          <div
            className="h-full bg-white flex-col-mobile"
            style={{ width: '80%', maxWidth: '300px', transform: 'translateX(0)', transition: 'transform 0.3s ease-in-out', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="py-4 px-6" style={{ background: '#007BFF', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-xl font-black">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ borderRight: '1px solid #eee' }}>
              <div className="py-4 px-6 border-b" style={{ borderBottom: '1px solid #f0f0f0' }}>
                {user ? (
                  <div className="d-flex items-center gap-3 text-sm">
                    <Link href="/profile" className="font-bold text-gray-900 block" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                      {profile?.full_name || user.email?.split("@")[0]}
                    </Link>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: '#b22222', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="d-flex items-center gap-4 text-sm font-bold">
                    <Link href="/login" style={{ textDecoration: 'none', color: '#007BFF' }} onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                    <Link href="/register" style={{ textDecoration: 'none', color: '#007BFF' }} onClick={() => setMobileMenuOpen(false)}>S'inscrire</Link>
                  </div>
                )}
              </div>

              <div className="py-2 flex-col-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                {mainLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="px-6 py-4 text-base font-black uppercase tracking-wide border-b"
                    style={{ textDecoration: 'none', display: 'block', color: '#111', borderBottom: '1px solid #f0f0f0' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
