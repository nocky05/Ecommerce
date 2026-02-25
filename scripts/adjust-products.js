const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'product-config.json');
const INPUT_FILE = path.join(__dirname, 'products-raw.json');
const OUTPUT_FILE = path.join(__dirname, 'products-final.json');

// Charger la configuration
async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erreur chargement configuration:', error.message);
        process.exit(1);
    }
}

// Charger les produits bruts
async function loadProducts() {
    try {
        const data = await fs.readFile(INPUT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erreur chargement produits:', error.message);
        console.error('ℹ️  Assurez-vous d\'avoir exécuté le scraping d\'abord (npm run scrape)');
        process.exit(1);
    }
}

// Ajuster le prix d'un produit
function adjustPrice(product, config) {
    // Prix personnalisé ?
    if (config.customPrices && config.customPrices[product.name]) {
        return config.customPrices[product.name];
    }

    // Ajustement global
    const adjustment = config.priceAdjustment;
    if (adjustment.type === 'percentage') {
        return Math.round(product.price * (1 + adjustment.value / 100));
    } else if (adjustment.type === 'fixed') {
        return product.price + adjustment.value;
    }

    return product.price;
}

// Ajuster la description
function adjustDescription(product, config) {
    // Description personnalisée ?
    if (config.customDescriptions && config.customDescriptions[product.name]) {
        return config.customDescriptions[product.name];
    }

    return product.description;
}

// Déterminer la disponibilité et le délai de livraison
function adjustDelivery(product, config) {
    const { deliveryRules, deliveryTimes } = config;

    if (deliveryRules.local_stock.includes(product.category)) {
        return {
            availability: 'in_stock',
            deliveryTime: deliveryTimes.local_stock
        };
    } else if (deliveryRules.european_order.includes(product.category)) {
        return {
            availability: 'on_order',
            deliveryTime: deliveryTimes.european_order
        };
    }

    // Par défaut
    return {
        availability: 'in_stock',
        deliveryTime: deliveryTimes.local_stock
    };
}

// Fonction principale
async function main() {
    console.log('🔧 Ajustement des produits\n');
    console.log('='.repeat(60));

    // Charger les données
    const config = await loadConfig();
    const products = await loadProducts();

    console.log(`📦 ${products.length} produits chargés`);
    console.log(`⚙️  Configuration chargée\n`);

    // Ajuster chaque produit
    const adjustedProducts = products.map(product => {
        const newPrice = adjustPrice(product, config);
        const newDescription = adjustDescription(product, config);
        const delivery = adjustDelivery(product, config);

        return {
            ...product,
            price: newPrice,
            description: newDescription,
            ...delivery
        };
    });

    // Sauvegarder
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(adjustedProducts, null, 2));

    console.log('✅ Ajustements appliqués:');
    console.log(`   - Prix: ${config.priceAdjustment.type} ${config.priceAdjustment.value > 0 ? '+' : ''}${config.priceAdjustment.value}${config.priceAdjustment.type === 'percentage' ? '%' : 'F CFA'}`);
    console.log(`   - Délais de livraison configurés`);
    console.log(`   - Descriptions personnalisées: ${Object.keys(config.customDescriptions || {}).length - 1}`);
    console.log(`   - Prix personnalisés: ${Object.keys(config.customPrices || {}).length - 1}`);
    console.log(`\n✅ Fichier final créé: ${OUTPUT_FILE}`);
    console.log(`\n🎉 Ajustement terminé!\n`);
}

// Exécuter
main().catch(console.error);
