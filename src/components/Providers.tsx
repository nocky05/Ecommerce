"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <AuthProvider>
                <NotificationProvider>
                    <WishlistProvider>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </WishlistProvider>
                </NotificationProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}
