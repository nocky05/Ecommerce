const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://ivoirematos.com';
const SHOP_URL = `${BASE_URL}/boutique/`;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const OUTPUT_FILE = path.join(__dirname, 'products-raw.json');

// Créer le dossier de sortie s'il n'existe pas
async function ensureOutputDir() {
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`✅ Dossier créé: ${OUTPUT_DIR}`);
    } catch (error) {
        console.error('❌ Erreur création dossier:', error.message);
    }
}

// Fonction pour télécharger une image
async function downloadImage(url, filename) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const filepath = path.join(OUTPUT_DIR, filename);
        await fs.writeFile(filepath, response.data);
        console.log(`  ✅ Image téléchargée: ${filename}`);
        return `/images/products/${filename}`;
    } catch (error) {
        console.error(`  ❌ Erreur téléchargement image ${filename}:`, error.message);
        return null;
    }
}

// Fonction pour extraire les données d'un produit
async function scrapeProduct(productUrl, index) {
    try {
        console.log(`\n📦 Scraping produit ${index}: ${productUrl}`);
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);

        // Extraire les données
        const name = $('h1.product_title').text().trim();
        const priceText = $('.woocommerce-Price-amount.amount').first().text().trim();
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

        // Image principale
        const imageUrl = $('.woocommerce-product-gallery__image img').first().attr('src') ||
            $('.wp-post-image').first().attr('src');

        // Description courte
        const description = $('.woocommerce-product-details__short-description').text().trim() ||
            $('meta[property="og:description"]').attr('content') || '';

        // Catégorie
        const category = $('.posted_in a').first().text().trim() || 'Non catégorisé';

        // Télécharger l'image
        let localImagePath = null;
        if (imageUrl) {
            const imageFilename = `product-${index}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}.jpg`;
            localImagePath = await downloadImage(imageUrl, imageFilename);
        }

        return {
            id: index,
            name,
            category,
            price,
            oldPrice: null,
            promo: null,
            image: localImagePath || imageUrl,
            description: description.substring(0, 500),
            availability: 'in_stock',
            deliveryTime: '24-48h',
            sourceUrl: productUrl
        };
    } catch (error) {
        console.error(`❌ Erreur scraping ${productUrl}:`, error.message);
        return null;
    }
}

// Fonction pour récupérer tous les liens produits
async function getAllProductLinks() {
    const productLinks = [];
    let page = 1;
    let hasMorePages = true;

    console.log('🔍 Récupération des liens produits...\n');

    while (hasMorePages && page <= 20) { // Limite à 20 pages pour sécurité
        try {
            const url = page === 1 ? SHOP_URL : `${SHOP_URL}page/${page}/`;
            console.log(`📄 Page ${page}: ${url}`);

            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            // Trouver tous les liens produits
            const links = [];
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('/product/') && !links.includes(href) && !href.includes('?')) {
                    links.push(href);
                }
            });

            if (links.length === 0) {
                hasMorePages = false;
                console.log('  ℹ️  Aucun produit trouvé, fin de pagination');
            } else {
                productLinks.push(...links);
                console.log(`  ✅ ${links.length} produits trouvés`);
                page++;
            }

            // Pause pour éviter de surcharger le serveur
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Erreur page ${page}:`, error.message);
            hasMorePages = false;
        }
    }

    return [...new Set(productLinks)]; // Supprimer les doublons
}

// Fonction principale
async function main() {
    console.log('🚀 Démarrage du scraping Ivoire Matos\n');
    console.log('='.repeat(60));

    // Créer le dossier de sortie
    await ensureOutputDir();

    // Récupérer tous les liens produits
    const productLinks = await getAllProductLinks();
    console.log(`\n📊 Total de produits trouvés: ${productLinks.length}\n`);
    console.log('='.repeat(60));

    // Scraper chaque produit
    const products = [];
    for (let i = 0; i < productLinks.length; i++) {
        const product = await scrapeProduct(productLinks[i], i + 1);
        if (product) {
            products.push(product);
        }

        // Pause entre chaque produit
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Sauvegarder les données
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2));
    console.log(`\n✅ Données sauvegardées: ${OUTPUT_FILE}`);
    console.log(`✅ ${products.length} produits scrapés avec succès!`);
    console.log('\n🎉 Scraping terminé!\n');
}

// Exécuter
main().catch(console.error);
