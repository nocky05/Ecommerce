import { Suspense } from "react";
import { Metadata } from "next";
import ShopContent from "@/app/shop/ShopContent";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    const sp = await searchParams;
    const category = sp.category as string | undefined;
    const search = sp.search as string | undefined;

    let title = "Boutique | MusicMarket Côte d'Ivoire";
    let description = "Explorez notre catalogue complet d'instruments de musique et de sonorisation en Côte d'Ivoire. Qualité garantie.";

    if (category) {
        title = `${category} | MusicMarket`;
        description = `Découvrez notre sélection de ${category}. Importation express et livraison partout en Côte d'Ivoire.`;
    } else if (search) {
        title = `Résultats pour "${search}" | MusicMarket`;
        description = `Résultats de recherche pour "${search}" dans le catalogue MusicMarket.`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        }
    };
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="container py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Chargement du catalogue...</p>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
