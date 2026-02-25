import { supabase } from "@/lib/supabase";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

// Simplified mapping function for detail page compatibility
const mapProduct = (p: any) => ({
    ...p,
    oldPrice: p.old_price,
    deliveryTime: p.delivery_time
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) return { title: "Produit non trouvé | MusicMarket" };

    return {
        title: `${product.name} | MusicMarket Côte d'Ivoire`,
        description: product.description.slice(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.slice(0, 160),
            images: [product.image],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description.slice(0, 160),
            images: [product.image],
        }
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch the product from Supabase
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#111' }}>Produit non trouvé</h1>
                <p className="mb-8" style={{ color: '#666' }}>L'instrument que vous recherchez n'est plus disponible ou a été déplacé.</p>
                <div className="d-flex justify-center">
                    <a href="/shop" className="btn btn-dark" style={{ textDecoration: 'none', padding: '12px 30px' }}>Retour à la boutique</a>
                </div>
            </div>
        );
    }

    // Related products (same category)
    const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', id)
        .limit(4);

    return (
        <ProductDetailClient
            product={mapProduct(product)}
            relatedProducts={(related || []).map(mapProduct)}
        />
    );
}
