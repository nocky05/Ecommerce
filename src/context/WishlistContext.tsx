"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: string;
    oldPrice?: number | null;
    promo?: number | null;
    deliveryTime?: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    toggleWishlist: (product: any) => void;
    removeFromWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    const { user } = useAuth();
    const { showNotification } = useNotification();

    // 1. Initial load from LocalStorage (for guests or quick start)
    useEffect(() => {
        const savedWishlist = localStorage.getItem('musicmarket_wishlist');
        if (savedWishlist && !user) { // Only use LS if not logged in (to avoid flashing)
            try {
                const parsed = JSON.parse(savedWishlist);
                if (Array.isArray(parsed)) {
                    setWishlist(parsed.map((item: any) => ({
                        ...item,
                        price: Number(item.price) || 0
                    })));
                }
            } catch (e) {
                console.error("Failed to parse wishlist from localStorage", e);
            }
        }
    }, []);

    // 2. Sync with Supabase if User is logged in
    useEffect(() => {
        if (user) {
            fetchWishlistFromDB();
        } else {
            // Restore from localStorage when logging out
            const savedWishlist = localStorage.getItem('musicmarket_wishlist');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            } else {
                setWishlist([]);
            }
        }
    }, [user]);

    const fetchWishlistFromDB = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('wishlists')
            .select('product_id, products(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching wishlist from DB:", error);
            return;
        }

        const formatted = data.map((item: any) => ({
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.image,
            category: item.products.category,
            oldPrice: item.products.old_price,
            promo: item.products.promo,
            deliveryTime: item.products.delivery_time
        }));
        setWishlist(formatted);
    };

    // Save to localStorage ONLY for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('musicmarket_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, user]);

    const toggleWishlist = async (product: any) => {
        if (!product || !product.id) return;

        const exists = wishlist.some(item => item.id === product.id);

        if (exists) {
            // Remove
            setWishlist(prev => prev.filter(item => item.id !== product.id));
            showNotification(`${product.name || 'Produit'} retiré des favoris`, 'info');

            if (user) {
                await supabase
                    .from('wishlists')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', product.id);
            }
        } else {
            // Add
            const newItem: WishlistItem = {
                id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.image,
                category: product.category,
                oldPrice: product.old_price || product.oldPrice,
                promo: product.promo,
                deliveryTime: product.deliveryTime || product.delivery_time
            };

            setWishlist(prev => [...prev, newItem]);
            showNotification(`${product.name || 'Produit'} ajouté aux favoris ❤`, 'success');

            if (user) {
                await supabase
                    .from('wishlists')
                    .insert({ user_id: user.id, product_id: product.id });
            }
        }
    };

    const removeFromWishlist = (id: number) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const isInWishlist = (id: number) => {
        return wishlist.some(item => item.id === id);
    };

    const totalWishlistItems = wishlist.length;

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist, totalWishlistItems }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
