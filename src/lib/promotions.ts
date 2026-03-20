import { supabase } from './supabase';

export async function getActivePromotions() {
    const { data: activePromos } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true);

    return activePromos?.filter(pr => {
        if (!pr.expires_at) return true;
        return new Date(pr.expires_at) > new Date();
    }) || [];
}

export function applyPromotionToProduct(product: any, activePromos: any[]) {
    // Find applicable promotion
    const productPromo = activePromos.find(pr => pr.type === 'product' && String(pr.product_id) === String(product.id));
    const categoryPromo = activePromos.find(pr => pr.type === 'category' && pr.category === product.category);
    const promo = productPromo || categoryPromo;

    let finalPrice = product.price;
    let oldPrice = product.old_price;
    let promoLabel = product.promo_label || null;

    if (promo) {
        oldPrice = product.price;
        finalPrice = Math.round(product.price * (1 - promo.discount_percent / 100));
        promoLabel = promo.label || `-${promo.discount_percent}%`;
    }

    return {
        ...product,
        price: finalPrice,
        old_price: oldPrice,
        promo_label: promoLabel
    };
}
