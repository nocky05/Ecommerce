const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Charger les variables d'environnement manuellement depuis .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
    const parted = line.split('=');
    if (parted.length >= 2 && !line.startsWith('#')) {
        const key = parted[0].trim();
        const value = parted.slice(1).join('=').trim();
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erreur: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Lire les produits
const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

async function migrate() {
    console.log(`Début de la migration de ${products.length} produits...`);

    // Préparer les données pour Supabase
    const mappedProducts = products.map(p => ({
        name: p.name,
        category: p.category,
        price: p.price,
        old_price: p.oldPrice || null,
        image: p.image,
        description: p.description,
        availability: p.availability === 'in_stock' ? 'En stock' : (p.availability === 'on_order' ? 'Sur commande' : p.availability),
        delivery_time: p.deliveryTime || '24-48h',
        brand: p.brand || null,
        promo: p.promo || null,
        is_active: true
    }));

    // Insérer par lots de 50 pour éviter les timeouts
    const batchSize = 50;
    for (let i = 0; i < mappedProducts.length; i += batchSize) {
        const batch = mappedProducts.slice(i, i + batchSize);
        console.log(`Insertion du lot ${Math.floor(i / batchSize) + 1}...`);

        const { error } = await supabase
            .from('products')
            .insert(batch);

        if (error) {
            console.error(`Erreur lors de l'insertion du lot:`, error);
        }
    }

    console.log('Migration terminée !');
}

migrate();
