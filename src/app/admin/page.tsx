"use client";

import { useState, useMemo, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";
import { useSettings } from "@/context/SettingsContext";


const CATEGORIES = [
    "PIANOS & CLAVIERS",
    "GUITARES & BASSES",
    "BATTERIES & PERCUSSIONS",
    "STUDIO & ENREGISTREMENT",
    "SONORISATION",
    "BOUTIQUE"
];

export default function AdminPage() {
    const { settings, homepage, refreshSettings } = useSettings();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Tous les rayons");
    const [managedProducts, setManagedProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [shopSettings, setShopSettings] = useState(settings);
    const [homepageSettings, setHomepageSettings] = useState(homepage);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [newBanner, setNewBanner] = useState({
        title: "NOUVELLE BANNIÈRE",
        description: "Description de la bannière...",
        image_url: "/images/products/placeholder.jpg",
        button_link: "/shop",
        active: true
    });
    const [promoType, setPromoType] = useState<"product" | "category">("product");
    const [newPromo, setNewPromo] = useState({
        product_id: "",
        category: "",
        discount_percent: 15,
        label: "",
        expires_at: "",
        active: true
    });
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: CATEGORIES[0],
        price: 0,
        description: "",
        image: "/images/products/placeholder.jpg",
        availability: "En Stock",
        delivery_time: "24-48h"
    });

    useEffect(() => {
        // Fetch Products
        fetch('/api/products?limit=100') // Higher limit for admin view
            .then(res => res.json())
            .then(data => {
                if (data.products && Array.isArray(data.products)) {
                    setManagedProducts(data.products);
                } else if (Array.isArray(data)) {
                    setManagedProducts(data);
                }
            })
            .catch(err => console.error("Failed to load products:", err));

        // Fetch Orders
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
            })
            .catch(err => console.error("Failed to load orders:", err));

        // Fetch Promotions
        fetch('/api/promotions')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPromotions(data);
            })
            .catch(err => console.error("Failed to load promotions:", err));

        // Fetch Banners
        fetch('/api/banners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBanners(data);
                    if (data.length > 0) {
                        setNewBanner(data[0]);
                    }
                }
            })
            .catch(err => console.error("Failed to load banners:", err));

        // Fetch Homepage Settings
        fetch('/api/settings?id=homepage')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setHomepageSettings(data);
                }
            })
            .catch(err => console.error("Failed to load homepage settings:", err));
    }, []);

    // Stats dynamiques calculées
    const stats = useMemo(() => {
        const totalSales = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
        const uniqueCustomers = new Set(orders.map(order => order.customer_email)).size;
        return {
            sales: totalSales.toLocaleString() + "F",
            orders: orders.length,
            customers: uniqueCustomers,
            products: managedProducts.length
        };
    }, [managedProducts, orders]);

    // Filtrage des produits
    const filteredProducts = useMemo(() => {
        return managedProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "Tous les rayons" || p.category.toUpperCase().includes(categoryFilter.toUpperCase());
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, categoryFilter, managedProducts]);

    const handleUpdateProduct = async (product: any) => {
        // Optimistic update
        setManagedProducts(prev => prev.map(p => p.id === product.id ? product : p));

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', product })
            });

            if (!response.ok) throw new Error("Update failed");
            showNotification(`${product.name} mis à jour`, "success");
        } catch (error) {
            console.error(error);
            showNotification("Erreur de sauvegarde", "error");
        }
    };


    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;

        const productWithNumberPrice = {
            ...newProduct,
            price: Number(newProduct.price),
            availability: newProduct.availability || "En Stock"
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', product: productWithNumberPrice })
            });

            if (!response.ok) throw new Error("Add failed");
            const result = await response.json();

            if (result.product) {
                setManagedProducts([result.product, ...managedProducts]);
                setIsAddModalOpen(false);
                showNotification(`${newProduct.name} ajouté au catalogue`, "success");
                setNewProduct({ name: "", category: CATEGORIES[0], price: 0, description: "", image: "/images/products/placeholder.jpg", availability: "En Stock", delivery_time: "24-48h" });
            }
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors de l'ajout", "error");
        }
    };

    const handleDeleteProduct = async (product: any) => {
        if (!confirm(`Voulez-vous vraiment supprimer ${product.name} ? Cette action est irréversible.`)) return;

        // Optimistic update
        setManagedProducts(prev => prev.map(p => p.id === product.id ? { ...p, _hidden: true } : p));

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', product })
            });

            if (!response.ok) throw new Error("Delete failed");

            setManagedProducts(prev => prev.filter(p => p.id !== product.id));
            showNotification(`${product.name} supprimé`, "info");
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors de la suppression", "error");
            setManagedProducts(prev => prev.map(p => p.id === product.id ? { ...p, _hidden: false } : p));
        }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (target === 'new') {
                    setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                } else {
                    setEditingProduct((prev: any) => ({ ...prev, image: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHomepageImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'banner' | number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (target === 'banner') {
                    setNewBanner(prev => ({ ...prev, image_url: result }));
                } else if (typeof target === 'number') {
                    const newCards = [...homepageSettings.side_cards];
                    newCards[target].image = result;
                    setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSave = () => {
        if (editingProduct) {
            handleUpdateProduct(editingProduct);
            setEditingProduct(null);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateStatus', orderId, status: newStatus })
            });

            if (!response.ok) throw new Error("Status update failed");

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            showNotification(`Statut de la commande mis à jour : ${newStatus}`, "success");
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors du changement de statut", "error");
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: shopSettings })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur serveur");
            }

            await refreshSettings();
            showNotification("Paramètres de la boutique enregistrés et appliqués", "success");
        } catch (error: any) {
            console.error(error);
            showNotification(`${error.message} (Assurez-vous d'avoir exécuté le script SQL)`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveHomepageSettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings?id=homepage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: homepageSettings })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur serveur");
            }

            await refreshSettings();
            showNotification("Configuration de l'accueil enregistrée et appliquée", "success");
        } catch (error: any) {
            console.error(error);
            showNotification(`${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddPromo = async () => {
        if (promoType === "product" && !newPromo.product_id) {
            showNotification("Veuillez sélectionner un produit", "error");
            return;
        }
        if (promoType === "category" && !newPromo.category) {
            showNotification("Veuillez sélectionner une catégorie", "error");
            return;
        }
        if (!newPromo.discount_percent) {
            showNotification("Veuillez saisir une remise valide", "error");
            return;
        }

        try {
            const action = promoType === "category" ? 'add_category' : 'add';
            const response = await fetch('/api/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, promotion: newPromo })
            });

            if (!response.ok) throw new Error("Failed to add promo");
            const data = await response.json();

            // Reload promos to get product details
            const res = await fetch('/api/promotions');
            const updatedPromos = await res.json();
            setPromotions(updatedPromos);

            showNotification("Promotion activée !", "success");
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors de l'activation", "error");
        }
    };

    const handleDeletePromo = async (promo: any) => {
        try {
            const response = await fetch('/api/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', promotion: promo })
            });

            if (!response.ok) throw new Error("Failed to delete promo");
            setPromotions(prev => prev.filter(p => p.id !== promo.id));
            showNotification("Promotion arrêtée", "info");
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors de l'arrêt", "error");
        }
    };

    const handleUpdateBanner = async () => {
        try {
            const response = await fetch('/api/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', banner: newBanner })
            });

            if (!response.ok) throw new Error("Failed to update banner");
            const data = await response.json();

            setBanners(prev => {
                const exists = prev.find(b => b.id === data.id);
                if (exists) return prev.map(b => b.id === data.id ? data : b);
                return [...prev, data];
            });

            setNewBanner(data);

            showNotification("Bannière mise à jour !", "success");
        } catch (error) {
            console.error(error);
            showNotification("Erreur lors de la mise à jour", "error");
        }
    };

    const sidebarItems = [
        { id: "dashboard", label: "Tableau de Bord", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
        { id: "products", label: "Catalogue / Prix", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3.5 11 8.5 8.5 8.5-8.5M12 19V3" /></svg> },
        { id: "history", label: "Historique", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></svg> },
        { id: "promotions", label: "Promotions", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 12 10 10 10-10L12 2Z" /><path d="m12 16 4-4-4-4" /></svg> },
        { id: "banners", label: "Accueil / Posts", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
        { id: "settings", label: "Paramètres", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg> },
    ];

    return (
        <div className="admin-base">
            {/* Barre Latérale Fixe */}
            <aside className="fixed-sidebar">
                <div className="sb-header">
                    <div className="sb-logo">M</div>
                    <span className="sb-name">MusicMarket<span className="dot">.</span></span>
                </div>

                <nav className="sb-nav">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`sb-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="txt">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sb-footer">
                    <div className="admin-pill">
                        <div className="av">A</div>
                        <div className="info">
                            <p className="n">Directeur</p>
                            <p className="r">Administrateur</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Zone de Contenu */}
            <main className="content-main">
                <header className="content-topbar">
                    {activeTab === "products" ? (
                        <div className="search-pill">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                placeholder="Recherche dans le catalogue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="search-pill-empty"></div>
                    )}
                    <div className="topbar-actions">
                        <div className="notif">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </div>
                    </div>
                </header>

                <div className="content-view">
                    {activeTab === "dashboard" && (
                        <div className="tab-fade">
                            <div className="v-head">
                                <h1>Tableau de Bord</h1>
                                <p>Suivi en temps réel de votre activité sourcing.</p>
                            </div>

                            <div className="grid-4">
                                <div className="c-stat">
                                    <div className="i-box green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                    <div className="d"><span>TOTAL VENTES</span><h3>{stats.sales}</h3></div>
                                </div>
                                <div className="c-stat">
                                    <div className="i-box blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /></svg></div>
                                    <div className="d"><span>COMMANDES</span><h3>{stats.orders}</h3></div>
                                </div>
                                <div className="c-stat">
                                    <div className="i-box orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg></div>
                                    <div className="d"><span>CLIENTS</span><h3>{stats.customers}</h3></div>
                                </div>
                                <div className="c-stat">
                                    <div className="i-box purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8z" /></svg></div>
                                    <div className="d"><span>INSTRUMENTS</span><h3>{stats.products}</h3></div>
                                </div>
                            </div>

                            <div className="section-card shadow">
                                <div className="sc-head"><h2>Dernières Commandes</h2><button className="txt-btn">VOIR HISTORIQUE</button></div>
                                <table className="elite-table">
                                    <thead><tr><th>ID</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th></tr></thead>
                                    <tbody>
                                        {orders.slice(0, 5).map(order => (
                                            <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                                <td>{order.id}</td>
                                                <td className="bold">{order.customer_name || 'Client'}</td>
                                                <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td className="bold">{(Number(order.total) || 0).toLocaleString()}F</td>
                                                <td><span className={`pill ${order.status === 'Livré' ? 'green' : 'gold'}`}>{order.status}</span></td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Aucune commande récente.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div className="tab-fade">
                            <div className="v-head with-btn">
                                <div><h1>Catalogue & Prix</h1><p>Gérez vos tarifs de revente ici.</p></div>
                                <button className="p-btn" onClick={() => setIsAddModalOpen(true)}>+ Ajouter instrument</button>
                            </div>
                            <div className="catalog-box shadow">
                                <div className="filters">
                                    <input
                                        type="text"
                                        placeholder="Filtrer par nom..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option>Tous les rayons</option>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="p-list">
                                    {filteredProducts.slice(0, 20).map(p => (
                                        <div className="p-row" key={p.id}>
                                            <div className="p-info">
                                                <div className="p-img"><img src={p.image} alt="" /></div>
                                                <div className="p-meta">
                                                    <h4>{p.name}</h4>
                                                    <div className="p-status-tags">
                                                        <span>{p.category}</span>
                                                        <select
                                                            className={`avail-select ${p.availability === 'Disponible sur commande' ? 'orange' : 'green'}`}
                                                            value={p.availability || "En Stock"}
                                                            onChange={(e) => handleUpdateProduct({ ...p, availability: e.target.value })}
                                                        >
                                                            <option>En Stock</option>
                                                            <option>Disponible sur commande</option>
                                                        </select>
                                                        <select
                                                            className="avail-select"
                                                            style={{ background: '#f0f0f0', color: '#666', border: '1px solid #ddd' }}
                                                            value={p.delivery_time || "24-48h"}
                                                            onChange={(e) => handleUpdateProduct({ ...p, delivery_time: e.target.value })}
                                                        >
                                                            <option>24-48h</option>
                                                            <option>3 semaines</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-actions">
                                                <div className="price-box">
                                                    <label>Prix CFA</label>
                                                    <div className="input-grp">
                                                        <input
                                                            type="text"
                                                            value={p.price.toLocaleString()}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value.replace(/\D/g, ''));
                                                                if (!isNaN(val)) handleUpdateProduct({ ...p, price: val });
                                                            }}
                                                        />
                                                        <span>CFA</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="icon-btn"
                                                    title="Modifier description"
                                                    onClick={() => setEditingProduct(p)}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    title="Supprimer l'instrument"
                                                    onClick={() => handleDeleteProduct(p)}
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" strokeWidth="2.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="tab-fade">
                            <div className="v-head"><h1>Historique Complet</h1><p>Archive de toutes vos ventes passées.</p></div>
                            <div className="section-card shadow">
                                <table className="elite-table">
                                    <thead><tr><th>Date</th><th>Référence</th><th>Nom Client</th><th>Total Cash</th><th>Statut</th></tr></thead>
                                    <tbody>
                                        {orders.length > 0 ? (
                                            orders.map(order => (
                                                <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                                    <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                                    <td style={{ fontWeight: '800', color: '#007BFF' }}>{order.id}</td>
                                                    <td>{order.customer_name}</td>
                                                    <td style={{ fontWeight: '800' }}>{(Number(order.total) || 0).toLocaleString()}F CFA</td>
                                                    <td><span className={`pill ${order.status === 'Livré' ? 'green' : 'orange'}`}>{order.status}</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#707EAE' }}>Aucune commande enregistrée.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "promotions" && (
                        <div className="tab-fade">
                            <div className="v-head"><h1>Ventes Flash & Promotions</h1><p>Configurez vos offres spéciales et réductions globales.</p></div>

                            <div className="promo-grid">
                                {/* Formulaire de Création */}
                                <div className="promo-form shadow">
                                    <h3 className="mb-6">Nouvelle Promotion</h3>

                                    <div className="field mb-6">
                                        <label>Type de Promotion</label>
                                        <select
                                            className="elite-select w-full"
                                            value={promoType}
                                            onChange={(e) => setPromoType(e.target.value as "product" | "category")}
                                        >
                                            <option value="product">Vente Flash (Produit unique)</option>
                                            <option value="category">Réduction par Catégorie</option>
                                        </select>
                                    </div>

                                    {promoType === "product" ? (
                                        <div className="field mb-6">
                                            <label>Sélectionner le Produit</label>
                                            <select
                                                className="elite-select w-full"
                                                value={newPromo.product_id}
                                                onChange={(e) => setNewPromo({ ...newPromo, product_id: e.target.value })}
                                            >
                                                <option value="">-- Choisir un produit --</option>
                                                {managedProducts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({(Number(p.price) || 0).toLocaleString()}F)</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="field mb-6">
                                            <label>Sélectionner la Catégorie</label>
                                            <select
                                                className="elite-select w-full"
                                                value={newPromo.category}
                                                onChange={(e) => setNewPromo({ ...newPromo, category: e.target.value })}
                                            >
                                                <option value="">-- Choisir une catégorie --</option>
                                                {CATEGORIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex-row gap-6 mb-6">
                                        <div className="field flex-1">
                                            <label>Remise (%)</label>
                                            <input
                                                type="number"
                                                className="elite-input w-full"
                                                value={newPromo.discount_percent || ""}
                                                onChange={(e) => setNewPromo({ ...newPromo, discount_percent: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="field flex-1">
                                            <label>Expire le (Optionnel)</label>
                                            <input
                                                type="datetime-local"
                                                className="elite-input w-full"
                                                value={newPromo.expires_at}
                                                onChange={(e) => setNewPromo({ ...newPromo, expires_at: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="field mb-8">
                                        <label>Libellé de l'offre (ex: "BLACK FRIDAY")</label>
                                        <input
                                            type="text"
                                            className="elite-input w-full"
                                            placeholder="Libellé optionnel..."
                                            value={newPromo.label}
                                            onChange={(e) => setNewPromo({ ...newPromo, label: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        className="p-btn gold w-full shadow-gold"
                                        onClick={handleAddPromo}
                                    >
                                        ACTIVER LA PROMOTION
                                    </button>
                                </div>

                                {/* Liste des promos actives */}
                                <div className="promo-active shadow">
                                    <div className="panel-header">
                                        <h3>Offres Actives</h3>
                                        <span className="badge-count">{promotions.length} EN COURS</span>
                                    </div>

                                    <div className="active-items-list">
                                        {promotions.map(promo => (
                                            <div className="active-card" key={promo.id}>
                                                <div className="ac-main">
                                                    <div className="ac-info">
                                                        <span className="tag-flash">{promo.label || 'PROMO'}</span>
                                                        <h4>{promo.products?.name || 'Produit inconnu'}</h4>
                                                        <p className="timer">
                                                            {promo.expires_at
                                                                ? `Expire le: ${new Date(promo.expires_at).toLocaleDateString()}`
                                                                : 'Permanent'}
                                                        </p>
                                                    </div>
                                                    <div className="ac-value">-{promo.discount_percent}%</div>
                                                </div>
                                                <button
                                                    className="stop-btn"
                                                    onClick={() => handleDeletePromo(promo)}
                                                >
                                                    Arrêter
                                                </button>
                                            </div>
                                        ))}

                                        {promotions.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '40px', color: '#707EAE' }}>
                                                Aucune promotion active pour le moment.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "banners" && (
                        <div className="tab-fade">
                            <div className="v-head"><h1>Gestion Accueil & Publicité</h1><p>Créez et modifiez les bannières qui apparaissent en page d'accueil.</p></div>
                            <div className="split-view">
                                <div className="editor shadow">
                                    <h3 className="mb-6">Configuration de la Bannière</h3>

                                    <div className="field mb-6">
                                        <label>Image du Post</label>
                                        <div className="img-upload-zone" style={{ height: '150px', marginBottom: '0.5rem' }}>
                                            {newBanner.image_url ? (
                                                <div className="img-preview-cont">
                                                    <img src={newBanner.image_url} alt="Preview" className="img-preview-actual" />
                                                    <button className="change-img-btn" onClick={() => setNewBanner({ ...newBanner, image_url: "" })}>Changer</button>
                                                </div>
                                            ) : (
                                                <div className="img-placeholder">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3AED0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                                                    <span>Cliquez pour choisir une photo</span>
                                                    <input type="file" className="hidden-file" accept="image/*" onChange={(e) => handleHomepageImageUpload(e, 'banner')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="field mb-6">
                                        <label>Titre Principal (Hero Title)</label>
                                        <input
                                            type="text"
                                            className="elite-input w-full"
                                            value={newBanner.title}
                                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="field mb-6">
                                        <label>Sous-Titre / Description</label>
                                        <textarea
                                            rows={4}
                                            className="elite-textarea w-full"
                                            value={newBanner.description}
                                            onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="field mb-8">
                                        <label>Lien du Bouton (CTA)</label>
                                        <input
                                            type="text"
                                            className="elite-input w-full"
                                            value={newBanner.button_link}
                                            onChange={(e) => setNewBanner({ ...newBanner, button_link: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        className="p-btn dark w-full shadow-lg mb-10"
                                        onClick={handleUpdateBanner}
                                    >
                                        PUBLIER SUR L'ACCUEIL
                                    </button>

                                    <div className="h-divider my-10" style={{ borderTop: '1px solid #eee' }}></div>

                                    <h3 className="mb-6">Cartes Latérales (Promotion)</h3>
                                    {homepageSettings.side_cards.map((card, idx) => (
                                        <div key={idx} className="bg-light p-4 rounded-lg mb-6" style={{ border: '1px solid #ddd' }}>
                                            <p className="font-bold mb-4">Carte {idx + 1}</p>
                                            <div className="field mb-4">
                                                <label>Titre</label>
                                                <input
                                                    type="text"
                                                    className="elite-input w-full"
                                                    value={card.title}
                                                    onChange={(e) => {
                                                        const newCards = [...homepageSettings.side_cards];
                                                        newCards[idx].title = e.target.value;
                                                        setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                                                    }}
                                                />
                                            </div>
                                            <div className="field mb-4">
                                                <label>Sous-titre (Optionnel)</label>
                                                <input
                                                    type="text"
                                                    className="elite-input w-full"
                                                    value={card.subtitle}
                                                    onChange={(e) => {
                                                        const newCards = [...homepageSettings.side_cards];
                                                        newCards[idx].subtitle = e.target.value;
                                                        setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-2 gap-4">
                                                <div className="field mb-4">
                                                    <label>Couleur Fond</label>
                                                    <input
                                                        type="color"
                                                        className="w-full h-10"
                                                        value={card.bg_color}
                                                        onChange={(e) => {
                                                            const newCards = [...homepageSettings.side_cards];
                                                            newCards[idx].bg_color = e.target.value;
                                                            setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                                                        }}
                                                    />
                                                </div>
                                                <div className="field mb-4">
                                                    <label>Couleur Texte</label>
                                                    <input
                                                        type="color"
                                                        className="w-full h-10"
                                                        value={card.text_color}
                                                        onChange={(e) => {
                                                            const newCards = [...homepageSettings.side_cards];
                                                            newCards[idx].text_color = e.target.value;
                                                            setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="field mb-4">
                                                <label>Image Promotionnelle</label>
                                                <div className="img-upload-zone" style={{ height: '120px', marginBottom: '0.5rem' }}>
                                                    {card.image ? (
                                                        <div className="img-preview-cont">
                                                            <img src={card.image} alt="Preview" className="img-preview-actual" style={{ objectFit: 'contain' }} />
                                                            <button
                                                                className="change-img-btn"
                                                                onClick={() => {
                                                                    const newCards = [...homepageSettings.side_cards];
                                                                    newCards[idx].image = "";
                                                                    setHomepageSettings({ ...homepageSettings, side_cards: newCards });
                                                                }}
                                                            >
                                                                Changer
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="img-placeholder">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3AED0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                                                            <span style={{ fontSize: '12px' }}>Choisir une photo</span>
                                                            <input type="file" className="hidden-file" accept="image/*" onChange={(e) => handleHomepageImageUpload(e, idx)} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="h-divider my-10" style={{ borderTop: '1px solid #eee' }}></div>

                                    <h3 className="mb-6">Bannière de Fiabilité (100%)</h3>
                                    <div className="bg-light p-4 rounded-lg mb-6" style={{ border: '1px solid #ddd' }}>
                                        <div className="field mb-4">
                                            <label>Titre</label>
                                            <input
                                                type="text"
                                                className="elite-input w-full"
                                                value={homepageSettings.promo_banner.title}
                                                onChange={(e) => setHomepageSettings({
                                                    ...homepageSettings,
                                                    promo_banner: { ...homepageSettings.promo_banner, title: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="field mb-4">
                                            <label>Slogan</label>
                                            <input
                                                type="text"
                                                className="elite-input w-full"
                                                value={homepageSettings.promo_banner.subtitle}
                                                onChange={(e) => setHomepageSettings({
                                                    ...homepageSettings,
                                                    promo_banner: { ...homepageSettings.promo_banner, subtitle: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="grid grid-2 gap-4">
                                            <div className="field mb-4">
                                                <label>Couleur Fond</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-10"
                                                    value={homepageSettings.promo_banner.bg_color}
                                                    onChange={(e) => setHomepageSettings({
                                                        ...homepageSettings,
                                                        promo_banner: { ...homepageSettings.promo_banner, bg_color: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <div className="field mb-4">
                                                <label>Couleur Accent (Jaune)</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-10"
                                                    value={homepageSettings.promo_banner.accent_color}
                                                    onChange={(e) => setHomepageSettings({
                                                        ...homepageSettings,
                                                        promo_banner: { ...homepageSettings.promo_banner, accent_color: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="p-btn gold w-full shadow-gold"
                                        onClick={handleSaveHomepageSettings}
                                    >
                                        ENREGISTRER TOUTE LA CONFIG ACCUEIL
                                    </button>
                                </div>

                                <div className="preview shadow">
                                    <div className="preview-header">
                                        <h3>Aperçu en Direct</h3>
                                        <span className="badge-live">LIVE PREVIEW</span>
                                    </div>
                                    <div className="phone-mockup">
                                        <div className="mock-screen">
                                            <div className="mock-banner">
                                                <div className="mock-overlay"></div>
                                                <img src={newBanner.image_url || "/images/products/placeholder.jpg"} alt="" />
                                                <div className="mock-content">
                                                    <h4>{newBanner.title}</h4>
                                                    <p>{newBanner.description}</p>
                                                    <div className="mock-btn">VOIR LA BOUTEILLE</div>
                                                </div>
                                            </div>
                                            <div className="mock-dots">
                                                <div className="dot active"></div>
                                                <div className="dot"></div>
                                                <div className="dot"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="tab-fade">
                            <div className="v-head">
                                <h1>Paramètres du Système</h1>
                                <p>Gérez la configuration de votre console et la sécurité.</p>
                            </div>

                            <div className="settings-container shadow">
                                <section className="settings-group">
                                    <div className="group-title">Configuration Boutique</div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Nom de la Boutique</span>
                                            <span className="sub-lab">Utilisé pour les factures et emails.</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.name}
                                            onChange={(e) => setShopSettings({ ...shopSettings, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">URL du Site</span>
                                            <span className="sub-lab">Adresse publique de votre boutique.</span>
                                        </div>
                                        <div className="val-box">musicmarket.ci</div>
                                    </div>
                                </section>

                                <section className="settings-group">
                                    <div className="group-title">Informations de Contact</div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Email Administrateur</span>
                                            <span className="sub-lab">Pour les notifications critiques.</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.email}
                                            onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Numéro de Téléphone</span>
                                            <span className="sub-lab">Affiché sur le header et contact.</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.phone}
                                            onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Lien WhatsApp</span>
                                            <span className="sub-lab">Numéro pour le chat direct.</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.whatsapp}
                                            onChange={(e) => setShopSettings({ ...shopSettings, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Adresse Physique</span>
                                            <span className="sub-lab">Localisation du showroom.</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.address}
                                            onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                                        />
                                    </div>
                                </section>

                                <section className="settings-group">
                                    <div className="group-title">Réseaux Sociaux</div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Facebook (URL)</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.facebook}
                                            onChange={(e) => setShopSettings({ ...shopSettings, facebook: e.target.value })}
                                        />
                                    </div>
                                    <div className="f-row">
                                        <div className="label-box">
                                            <span className="main-lab">Instagram (URL)</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="elite-input"
                                            value={shopSettings.instagram}
                                            onChange={(e) => setShopSettings({ ...shopSettings, instagram: e.target.value })}
                                        />
                                    </div>
                                </section>

                                <div className="save-bar">
                                    <button
                                        className="p-btn dark shadow-lg"
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "ENREGISTREMENT..." : "SAUVEGARDER LES PARAMÈTRES"}
                                    </button>
                                </div>

                                <section className="settings-group last">
                                    <div className="group-title">Session & Sécurité</div>
                                    <p className="danger-text">Attention : La déconnexion fermera votre session de pilotage actuelle.</p>
                                    <button className="logout-btn-elite">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                                        SE DÉCONNECTER DE LA CONSOLE
                                    </button>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Détails Commande */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="m-ref">{selectedOrder.id}</span>
                                <h2>Détails de la Commande</h2>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="m-section">
                                <label>ARTICLES COMMANDÉS</label>
                                {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                                    selectedOrder.items.map((item: any, idx: number) => (
                                        <div className="m-item" key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                            <div className="m-img"><img src={item.image} alt="" /></div>
                                            <div className="m-info">
                                                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{item.name}</h4>
                                                <p style={{ fontSize: '12px' }}>Qté: <strong>{item.qty}</strong> | Prix: <strong>{item.price.toLocaleString()}F CFA</strong></p>
                                                {item.deliveryTime && <p style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>🚚 {item.deliveryTime}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="m-item">
                                        <div className="m-img"><img src={selectedOrder.image} alt="" /></div>
                                        <div className="m-info">
                                            <h4>{selectedOrder.item}</h4>
                                            <p>Prix: <strong>{selectedOrder.price?.toLocaleString()}F CFA</strong></p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="m-grid-2">
                                <div className="m-section">
                                    <label>INFORMATIONS CLIENT</label>
                                    <p className="m-val">{selectedOrder.customer_name}</p>
                                    <p className="m-sub">{selectedOrder.customer_email}</p>
                                </div>
                                <div className="m-section">
                                    <label>MOYEN DE PAIEMENT</label>
                                    <div className="m-pay">
                                        <span className="p-icon">💳</span>
                                        <p className="m-val">{selectedOrder.payment_method}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="m-grid-2">
                                <div className="m-section">
                                    <label>STATUT PAIEMENT</label>
                                    <div className={`pill ${selectedOrder.payment_status === 'paid' ? 'green' : 'gold'}`} style={{ width: 'fit-content', marginTop: '5px' }}>
                                        {selectedOrder.payment_status === 'paid' ? 'PAYÉ (GENIUSPAY)' : 'EN ATTENTE'}
                                    </div>
                                </div>
                                <div className="m-section">
                                    <label>STATUT ACTUEL</label>
                                    <div className="m-status-row">
                                        <select
                                            className="m-select"
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                                        >
                                            <option>En Cours</option>
                                            <option>Confirmée</option>
                                            <option>En Préparation</option>
                                            <option>En Transit</option>
                                            <option>Prêt pour livraison</option>
                                            <option>Livré</option>
                                            <option>Annulée</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajouter Produit */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="m-ref">NOUVEL INSTRUMENT</span>
                                <h2>Ajouter au Catalogue</h2>
                            </div>
                            <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="m-section">
                                <label>PHOTO DE L'INSTRUMENT</label>
                                <div className="img-upload-zone" style={{ height: '150px', marginBottom: '1.5rem' }}>
                                    {newProduct.image && newProduct.image !== "/images/products/placeholder.jpg" ? (
                                        <div className="img-preview-cont">
                                            <img src={newProduct.image} alt="Preview" className="img-preview-actual" />
                                            <button className="change-img-btn" onClick={() => setNewProduct({ ...newProduct, image: "/images/products/placeholder.jpg" })}>Changer</button>
                                        </div>
                                    ) : (
                                        <div className="img-placeholder">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3AED0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                                            <span>Cliquez pour choisir une photo</span>
                                            <input type="file" className="hidden-file" accept="image/*" onChange={(e) => handleImageUpload(e, 'new')} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="m-section">
                                <label>NOM DE L'INSTRUMENT</label>
                                <input
                                    className="elite-input w-full"
                                    placeholder="Ex: Fender Stratocaster..."
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>

                            <div className="m-grid-2">
                                <div className="m-section">
                                    <label>CATÉGORIE</label>
                                    <select
                                        className="m-select"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="m-section">
                                    <label>STATUT DISPO.</label>
                                    <select
                                        className="m-select"
                                        value={newProduct.availability}
                                        onChange={e => setNewProduct({ ...newProduct, availability: e.target.value })}
                                    >
                                        <option>En Stock</option>
                                        <option>Disponible sur commande</option>
                                    </select>
                                </div>
                                <div className="m-section">
                                    <label>DÉLAI ESTIMÉ</label>
                                    <select
                                        className="m-select"
                                        value={newProduct.delivery_time}
                                        onChange={e => setNewProduct({ ...newProduct, delivery_time: e.target.value })}
                                    >
                                        <option>24-48h</option>
                                        <option>3 semaines</option>
                                    </select>
                                </div>
                            </div>

                            <div className="m-section">
                                <label>PRIX (CFA)</label>
                                <input
                                    type="number"
                                    className="m-select w-full"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="m-section">
                                <label>DESCRIPTION</label>
                                <textarea
                                    className="elite-textarea w-full"
                                    rows={4}
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button className="p-btn dark w-full" onClick={handleAddProduct}>AJOUTER MAINTENANT</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Modifier Produit */}
            {editingProduct && (
                <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="m-ref">MODIFICATION PRODUIT</span>
                                <h2>{editingProduct.name}</h2>
                            </div>
                            <button className="close-btn" onClick={() => setEditingProduct(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="m-section">
                                <label>PHOTO DE L'INSTRUMENT</label>
                                <div className="img-upload-zone" style={{ height: '150px', marginBottom: '1.5rem' }}>
                                    <div className="img-preview-cont">
                                        <img src={editingProduct.image} alt="Preview" className="img-preview-actual" />
                                        <div className="img-overlay-edit">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                            <input type="file" className="hidden-file" accept="image/*" onChange={(e) => handleImageUpload(e, 'edit')} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="m-section">
                                <label>NOM DE L'INSTRUMENT</label>
                                <input
                                    className="elite-input w-full"
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>

                            <div className="m-grid-2">
                                <div className="m-section">
                                    <label>CATÉGORIE</label>
                                    <select
                                        className="m-select"
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="m-section">
                                    <label>STATUT DISPO.</label>
                                    <select
                                        className="m-select"
                                        value={editingProduct.availability}
                                        onChange={e => setEditingProduct({ ...editingProduct, availability: e.target.value })}
                                    >
                                        <option>En Stock</option>
                                        <option>Disponible sur commande</option>
                                    </select>
                                </div>
                                <div className="m-section">
                                    <label>DÉLAI ESTIMÉ</label>
                                    <select
                                        className="m-select"
                                        value={editingProduct.delivery_time}
                                        onChange={e => setEditingProduct({ ...editingProduct, delivery_time: e.target.value })}
                                    >
                                        <option>24-48h</option>
                                        <option>3 semaines</option>
                                    </select>
                                </div>
                            </div>

                            <div className="m-section">
                                <label>PRIX (CFA)</label>
                                <input
                                    type="number"
                                    className="m-select w-full"
                                    value={editingProduct.price}
                                    onChange={e => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="m-section">
                                <label>DESCRIPTION</label>
                                <textarea
                                    className="elite-textarea w-full"
                                    rows={6}
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button className="p-btn gold w-full" onClick={handleEditSave}>ENREGISTRER LES MODIFICATIONS</button>
                        </div>
                    </div>
                </div>
            )}



            <style jsx>{`
                .admin-base {
                    display: flex;
                    min-height: 100vh;
                    background-color: #F4F7FE;
                    color: #2B3674;
                    font-family: 'DM Sans', 'Inter', sans-serif;
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
                }

                /* Sidebar Version Restaurée & Polie */
                .fixed-sidebar {
                    width: 290px;
                    background-color: #111;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    padding: 3rem 0;
                    flex-shrink: 0;
                    box-shadow: 10px 0 30px rgba(0,0,0,0.1);
                }

                .sb-header { padding: 0 2.5rem 4rem; display: flex; align-items: center; gap: 0.8rem; }
                .sb-logo { width: 42px; height: 42px; background: #D4AF37; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: black; font-size: 1.3rem; }
                .sb-name { font-size: 1.5rem; font-weight: 900; font-family: 'Outfit', sans-serif; letter-spacing: -1px; }
                .dot { color: #D4AF37; }

                .sb-nav { flex: 1; padding: 0 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
                .sb-item { display: flex; align-items: center; gap: 1.2rem; padding: 1.2rem 1.8rem; background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; border-radius: 16px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); text-align: left; }
                .sb-item:hover { color: white; background: rgba(255,255,255,0.05); }
                .sb-item.active { color: white; background: #D4AF37; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.25); }
                .sb-item .txt { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }

                .sb-footer { padding: 2.5rem 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.08); }
                .admin-pill { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 18px; }
                .av { width: 36px; height: 36px; background: #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: black; font-size: 0.9rem; }
                .info .n { font-size: 0.8rem; font-weight: 800; margin: 0; color: white; }
                .info .r { font-size: 0.65rem; color: rgba(255,255,255,0.4); font-weight: 700; margin: 0; text-transform: uppercase; }

                /* Contenu Principal */
                .content-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background-color: #F4F7FE; }
                .content-topbar { height: 100px; padding: 0 3.5rem; display: flex; align-items: center; justify-content: space-between; background: transparent; }
                .search-pill { background: white; padding: 0.8rem 1.8rem; border-radius: 30px; display: flex; align-items: center; gap: 1rem; width: 400px; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .search-pill input { border: none; outline: none; background: transparent; font-size: 0.9rem; font-weight: 500; color: #2B3674; width: 100%; }
                .search-pill-empty { width: 400px; }

                .topbar-actions { display: flex; align-items: center; gap: 1.5rem; }
                .notif { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #707EAE; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); cursor: pointer; }

                .content-view { padding: 0 3.5rem 3.5rem; }
                .v-head { margin-bottom: 3rem; }
                .v-head.with-btn { display: flex; justify-content: space-between; align-items: flex-end; }
                .v-head h1 { font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 900; letter-spacing: -2px; margin-bottom: 0.5rem; color: #1B2559; font-style: italic; }
                .v-head p { color: #707EAE; font-size: 1.1rem; font-weight: 600; }

                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
                .c-stat { background: white; padding: 2rem; border-radius: 20px; display: flex; align-items: center; gap: 1.5rem; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .i-box { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .i-box.green { background: #E6F8F0; color: #01B574; }
                .i-box.blue { background: #E9EDF7; color: #422AFB; }
                .i-box.orange { background: #FFF9F4; color: #FFB547; }
                .i-box.purple { background: #F4F7FE; color: #A855F7; }
                .c-stat .d span { font-size: 0.75rem; color: #A3AED0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .c-stat .d h3 { font-size: 1.6rem; font-weight: 800; margin: 0; color: #1B2559; }

                .section-card { background: white; border-radius: 20px; padding: 2.5rem; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .sc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .sc-head h2 { font-size: 1.4rem; font-weight: 800; color: #1B2559; }

                .elite-table { width: 100%; border-collapse: collapse; }
                .elite-table th { text-align: left; padding: 1rem 1.5rem; color: #A3AED0; font-size: 0.7rem; font-weight: 800; border-bottom: 1px solid #F4F7FE; text-transform: uppercase; letter-spacing: 0.1em; }
                .elite-table td { padding: 1.5rem 1.5rem; font-size: 0.9rem; border-bottom: 1px solid #F4F7FE; color: #1B2559; font-weight: 600; }

                .pill { padding: 0.4rem 1.2rem; border-radius: 30px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                .pill.green { background: #E6F8F0; color: #01B574; }
                .pill.gold { background: #FFF9F4; color: #FFB547; }
                .bold { font-weight: 900; }

                .p-btn { border: none; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; color: white; cursor: pointer; transition: 0.3s; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
                .p-btn.dark { background: #1B2559; }
                .p-btn.gold { background: #D4AF37; color: black; }
                .p-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(27, 37, 89, 0.15); }

                .catalog-box { background: white; border-radius: 24px; padding: 2.5rem; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .filters { display: flex; gap: 1.5rem; margin-bottom: 3rem; }
                .filters input, .filters select { flex: 1; padding: 1rem 1.5rem; border: none; background: #F4F7FE; border-radius: 14px; outline: none; font-weight: 700; color: #1B2559; }

                .p-row { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid #F4F7FE; }
                .p-info { display: flex; align-items: center; gap: 2rem; }
                .p-img { width: 70px; height: 70px; border: 1px solid #F4F7FE; border-radius: 14px; padding: 8px; background: white; }
                .p-img img { width: 100%; height: 100%; object-fit: contain; }
                .p-meta h4 { margin: 0; font-size: 1.2rem; font-weight: 900; color: #1B2559; margin-bottom: 0.3rem; }
                .p-status-tags { display: flex; align-items: center; gap: 0.8rem; }
                .p-status-tags span { font-size: 0.8rem; color: #707EAE; font-weight: 700; text-transform: uppercase; }
                
                .avail-select { 
                    border: none; background: transparent; font-size: 0.7rem; font-weight: 900; 
                    text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; outline: none;
                    padding: 4px 10px; border-radius: 6px;
                }
                .avail-select.green { background: #E6F8F0; color: #01B574; }
                .avail-select.orange { background: #FFF9E6; color: #FFB547; }

                .p-actions { display: flex; align-items: center; gap: 2.5rem; }
                .price-box label { display: block; font-size: 0.65rem; color: #A3AED0; font-weight: 800; margin-bottom: 0.5rem; text-transform: uppercase; }
                .input-grp { display: flex; align-items: center; gap: 0.8rem; }
                .input-grp input { width: 120px; padding: 0.6rem 1rem; border: 1px solid #E9EDF7; border-radius: 10px; text-align: right; font-weight: 900; color: #1B2559; }
                .icon-btn { width: 48px; height: 48px; background: white; border: 1px solid #E9EDF7; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

                .tile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
                .tile { padding: 4rem; border-radius: 30px; text-align: center; }
                .tile.dark { background: #1B2559; color: white; }
                .tile.white { background: white; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .tile h3 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; margin-bottom: 1.2rem; }
                .tile p { color: #A3AED0; font-size: 1.1rem; margin-bottom: 2.5rem; font-weight: 500; }

                .split-view { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
                .editor, .preview { padding: 3rem; border-radius: 30px; background: white; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                /* PROMOTIONS STYLING */
                .promo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
                .promo-form, .promo-active { background: white; border-radius: 30px; padding: 3rem; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                
                .elite-select { 
                    padding: 1rem 1.5rem; 
                    background: #F4F7FE; 
                    border: none; 
                    border-radius: 14px; 
                    outline: none; 
                    font-weight: 700; 
                    color: #1B2559; 
                    font-size: 1rem; 
                    appearance: none;
                }

                .badge-count { background: #E9EDF7; color: #422AFB; padding: 0.4rem 1rem; border-radius: 30px; font-size: 0.7rem; font-weight: 800; }
                
                .active-items-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .active-card { background: #F4F7FE; border-radius: 20px; padding: 1.5rem; border: 1.5px solid #E9EDF7; }
                .ac-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .ac-info h4 { margin: 0.5rem 0; font-size: 1.1rem; font-weight: 800; color: #1B2559; }
                .ac-value { font-size: 1.8rem; font-weight: 900; color: #01B574; }
                .timer { font-size: 0.8rem; color: #707EAE; margin: 0; }
                .timer strong { color: #1B2559; }

                .tag-flash { background: #E6F8F0; color: #01B574; padding: 0.3rem 0.8rem; border-radius: 30px; font-size: 0.55rem; font-weight: 900; }
                .tag-cat { background: #E9EDF7; color: #422AFB; padding: 0.3rem 0.8rem; border-radius: 30px; font-size: 0.55rem; font-weight: 900; }
                
                .stop-btn { background: white; border: 1px solid #E9EDF7; color: #FF3B30; padding: 0.5rem 1rem; border-radius: 10px; font-weight: 800; font-size: 0.7rem; cursor: pointer; transition: 0.3s; }
                .stop-btn:hover { background: #FF3B30; color: white; border-color: #FF3B30; }

                .flex-row { display: flex; }
                .gap-6 { gap: 1.5rem; }
                .flex-1 { flex: 1; }

                .shadow-gold { box-shadow: 0 10px 20px rgba(212, 175, 55, 0.25); }

                .field label { display: block; font-size: 0.75rem; font-weight: 800; color: #A3AED0; margin-bottom: 0.8rem; text-transform: uppercase; }
                .field input, .field textarea { width: 100%; padding: 1.2rem; border: none; background: #F4F7FE; border-radius: 16px; outline: none; font-weight: 600; color: #1B2559; font-family: inherit; }
                
                .img-upload-zone { 
                    background: #F4F7FE; 
                    border: 2px dashed #E9EDF7; 
                    border-radius: 20px; 
                    height: 180px; 
                    position: relative; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer;
                    transition: 0.3s;
                }
                .img-upload-zone:hover { border-color: #D4AF37; background: #FFF; }
                .img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
                .img-placeholder span { font-size: 0.75rem; color: #A3AED0; font-weight: 700; }
                .hidden-file { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                .img-preview-cont { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; background: white; border-radius: 18px; overflow: hidden; }
                .img-preview-actual { height: 100%; width: auto; max-width: 100%; object-fit: contain; }
                .change-img-btn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; cursor: pointer; }

                .elite-textarea { resize: none; }

                /* Live Preview Styling */
                .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .badge-live { background: #E6F8F0; color: #01B574; padding: 0.4rem 0.8rem; border-radius: 30px; font-size: 0.6rem; font-weight: 900; }

                .phone-mockup { 
                    background: #111; 
                    padding: 1rem; 
                    border-radius: 40px; 
                    width: 320px; 
                    margin: 0 auto; 
                    border: 8px solid #222; 
                    box-shadow: 0 40px 80px rgba(0,0,0,0.1); 
                }
                .mock-screen { background: white; border-radius: 30px; overflow: hidden; height: 500px; position: relative; }
                .mock-banner { height: 100%; position: relative; }
                .mock-banner img { width: 100%; height: 100%; object-fit: cover; }
                .mock-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 60%); }
                .mock-content { position: absolute; bottom: 40px; left: 20px; right: 20px; color: white; }
                .mock-content h4 { font-size: 1.1rem; font-weight: 900; margin-bottom: 0.5rem; font-family: 'Outfit'; }
                .mock-content p { font-size: 0.75rem; opacity: 0.8; margin-bottom: 1.2rem; }
                .mock-btn { background: #D4AF37; color: black; font-size: 0.6rem; font-weight: 900; padding: 0.8rem 1.2rem; border-radius: 8px; width: fit-content; }
                
                .mock-dots { position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
                .mock-dots .dot { width: 6px; height: 6px; background: rgba(255,255,255,0.3); border-radius: 50%; }
                .mock-dots .dot.active { background: #D4AF37; width: 15px; border-radius: 10px; }

                .mb-6 { margin-bottom: 1.5rem; }
                .mb-8 { margin-bottom: 2rem; }
                .settings-container { background: white; border-radius: 30px; padding: 3rem; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); }
                .settings-group { margin-bottom: 4rem; }
                .group-title { font-size: 1rem; font-weight: 900; color: #1B2559; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #F4F7FE; padding-bottom: 1rem; margin-bottom: 2.5rem; }
                .f-row { display: flex; align-items: center; justify-content: space-between; padding: 2rem 0; border-bottom: 1px solid #F4F7FE; }
                .label-box { display: flex; flex-direction: column; gap: 0.3rem; }
                .main-lab { font-size: 1rem; font-weight: 800; color: #1B2559; }
                .sub-lab { font-size: 0.85rem; color: #A3AED0; font-weight: 500; }
                .val-box { font-weight: 900; color: #1B2559; font-size: 1.1rem; }
                .elite-input { width: 350px; padding: 1rem 1.5rem; background: #F4F7FE; border: none; border-radius: 14px; outline: none; font-weight: 700; color: #1B2559; font-size: 1rem; }
                .danger-text { color: #FF3B30; font-weight: 700; font-size: 0.9rem; margin-bottom: 1.5rem; }
                .logout-btn-elite { display: flex; align-items: center; gap: 1rem; background: #FFF5F4; border: 1.5px solid #FFEBE9; color: #FF3B30; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; width: fit-content; font-size: 0.85rem; letter-spacing: 0.5px; }
                .logout-btn-elite:hover { background: #FF3B30; color: white; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255, 59, 48, 0.15); }

                .save-bar { 
                    padding: 2.5rem; 
                    background: #F4F7FE; 
                    margin: 0 -3rem 4rem -3rem; 
                    display: flex; 
                    justify-content: center;
                    border-top: 1px solid #E9EDF7;
                    border-bottom: 1px solid #E9EDF7;
                }
                .p-btn.success { background: #01B574; color: white; }

                .shadow { box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
                .tab-fade { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* MODAL STYLES */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 20000;
                    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
                }
                .modal-card {
                    background: white; border-radius: 30px; width: 600px; padding: 2.5rem;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.2); animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    max-height: 90vh; overflow-y: auto;
                }
                /* Custom Scrollbar for Modal */
                .modal-card::-webkit-scrollbar { width: 8px; }
                .modal-card::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .modal-card::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 10px; }
                .modal-card::-webkit-scrollbar-thumb:hover { background: #A3AED0; }
                
                @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .m-ref { display: block; font-size: 0.75rem; font-weight: 800; color: #D4AF37; margin-bottom: 0.4rem; letter-spacing: 1px; }
                .modal-header h2 { font-size: 1.8rem; font-weight: 900; color: #1B2559; margin: 0; }
                
                .close-btn { background: transparent; border: none; font-size: 2rem; color: #A3AED0; cursor: pointer; }
                
                .m-section { margin-bottom: 2rem; }
                .m-section label { display: block; font-size: 0.7rem; font-weight: 900; color: #A3AED0; margin-bottom: 1rem; letter-spacing: 1px; }
                
                .m-item { display: flex; align-items: center; gap: 1.5rem; background: #F4F7FE; padding: 1.5rem; border-radius: 18px; }
                .m-img { width: 80px; height: 80px; background: white; border-radius: 12px; padding: 10px; border: 1px solid #E9EDF7; }
                .m-img img { width: 100%; height: 100%; object-fit: contain; }
                .m-info h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 800; color: #1B2559; }
                .m-info p { margin: 0; font-size: 0.9rem; color: #707EAE; }
                
                .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .m-val { font-size: 1.1rem; font-weight: 800; color: #1B2559; margin-bottom: 0.3rem; }
                .m-sub { font-size: 0.8rem; color: #A3AED0; font-weight: 600; }
                
                .m-pay { display: flex; align-items: center; gap: 1rem; }
                .p-icon { font-size: 1.5rem; }
                
                .m-status-row { display: flex; gap: 1rem; }
                .m-select { flex: 1; padding: 1rem; background: #F4F7FE; border: none; border-radius: 12px; font-weight: 700; color: #1B2559; outline: none; }
                .m-save-btn { background: #1B2559; color: white; border: none; padding: 0 2rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
                .m-save-btn:hover { background: #422AFB; }

                .border { border: 1px solid #E2E8F0; }
                .w-full { width: 100%; }

                @media (max-width: 991px) {
                  .admin-base { flex-direction: column; position: static; min-height: 100vh; overflow: visible; display: block; }
                  .fixed-sidebar { width: 100%; padding: 1rem 0; display: block; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                  .sb-header { padding: 0 1rem 1rem; }
                  .sb-nav { flex-direction: row; flex-wrap: wrap; padding: 0 0.5rem; gap: 0.3rem; }
                  .sb-item { flex: 1 1 auto; padding: 0.8rem; justify-content: center; border-radius: 12px; }
                  .sb-item .txt { display: none; }
                  .sb-footer { display: none; }

                  .content-main { overflow: visible; display: block; }
                  .content-topbar { padding: 1rem; height: auto; flex-wrap: wrap; gap: 1rem; justify-content: flex-start; }
                  .search-pill, .search-pill-empty { width: 100%; display: flex; }
                  .topbar-actions { margin-left: auto; }

                  .content-view { padding: 0 1rem 2rem; }
                  .v-head { margin-bottom: 2rem; }
                  .v-head h1 { font-size: 2rem; }
                  .v-head.with-btn { flex-direction: column; align-items: flex-start; gap: 1rem; }

                  .grid-4 { grid-template-columns: 1fr; gap: 1rem; }
                  .section-card, .catalog-box, .promo-form, .promo-active, .editor, .preview { padding: 1.5rem; overflow-x: auto; }
                  .elite-table { min-width: 600px; }

                  .split-view, .promo-grid, .m-grid-2 { grid-template-columns: 1fr; }
                  .p-row { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                  .p-info { width: 100%; }
                  .p-actions { width: 100%; flex-wrap: wrap; justify-content: flex-start; gap: 1rem; }
                  .p-actions .price-box { margin-right: auto; }
                }
            `}</style>
        </div >
    );
}
