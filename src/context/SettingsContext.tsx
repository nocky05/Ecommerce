"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SiteSettings {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    facebook: string;
    instagram: string;
    twitter: string;
}

interface HomepageSettings {
    side_cards: {
        title: string;
        subtitle: string;
        image: string;
        link: string;
        bg_color: string;
        text_color: string;
    }[];
    promo_banner: {
        title: string;
        subtitle: string;
        discount_text: string;
        button_text: string;
        button_link: string;
        bg_color: string;
        accent_color: string;
    };
}

interface SettingsContextType {
    settings: SiteSettings;
    homepage: HomepageSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    name: "MusicMarket Côte d'Ivoire",
    email: "contact@musicmarket.ci",
    phone: "+225 07 77 000 000",
    whatsapp: "+225 07 77 000 000",
    address: "Abidjan, Cocody Riviera, Boulevard de la Glisse",
    facebook: "#",
    instagram: "#",
    twitter: "#"
};

const defaultHomepage: HomepageSettings = {
    side_cards: [
        { title: "Pianos Yamaha Série P", subtitle: "", image: "/images/products/product-4-yamaha-dgx-670---piano-num-rique-88-touches.jpg", link: "/shop?category=PIANOS%20%26%20CLAVIERS", bg_color: "#f8f9fa", text_color: "#111" },
        { title: "Home Studio Focusrite", subtitle: "Dès 111 000F", image: "/images/products/product-150-focusrite-scarlett-2i2-4e-g-n.jpg", link: "/shop?category=STUDIO%20%26%20ENREGISTREMENT", bg_color: "#000", text_color: "#fff" }
    ],
    promo_banner: {
        title: "QUALITÉ & FIABILITÉ",
        subtitle: "Le choix n°1 des professionnels",
        discount_text: "100",
        button_text: "DÉCOUVRIR NOS OFFRES",
        button_link: "/shop",
        bg_color: "#007BFF",
        accent_color: "#FFD200"
    }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [homepage, setHomepage] = useState<HomepageSettings>(defaultHomepage);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const [genRes, homeRes] = await Promise.all([
                fetch("/api/settings?id=general", { cache: 'no-store' }),
                fetch("/api/settings?id=homepage", { cache: 'no-store' })
            ]);

            const genData = await genRes.json();
            const homeData = await homeRes.json();

            if (genData && !genData.error) {
                setSettings({ ...defaultSettings, ...genData });
            }
            if (homeData && !homeData.error) {
                setHomepage({ ...defaultHomepage, ...homeData });
            }
        } catch (error) {
            console.error("Failed to fetch site settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = async () => {
        setLoading(true);
        await fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, homepage, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
