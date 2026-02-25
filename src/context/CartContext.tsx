"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    qty: number;
    category?: string;
    deliveryTime?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQty: (id: number, delta: number) => void;
    clearCart: () => void;
    subtotal: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('musicmarket_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('musicmarket_cart', JSON.stringify(items));
    }, [items]);

    const { showNotification } = useNotification();

    const addToCart = (product: any) => {
        const existing = items.find(item => item.id === product.id);

        if (existing) {
            showNotification(`${product.name} : quantité mise à jour dans le panier`, 'success');
            setItems(prev => prev.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            showNotification(`${product.name} ajouté au panier avec succès !`, 'success');
            setItems(prev => [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1,
                category: product.category,
                deliveryTime: product.deliveryTime || product.delivery_time // Support both camelCase and snake_case
            }]);
        }
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => setItems([]);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
