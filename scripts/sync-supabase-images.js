const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const imagesDir = path.join(process.cwd(), 'public/images/products');

function sanitize(filename) {
    if (!filename) return '';
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);

    return base
        .normalize('NFD') // Décompose les accents
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-zA-Z0-9]/g, '-') // Remplace TOUT ce qui n'est pas alphanum par un tiret
        .replace(/-+/g, '-') // Évite les tirets multiples
        .replace(/^-|-$/g, '') // Supprime tirets au début/fin
        .toLowerCase() + ext.toLowerCase();
}

async function sync() {
    console.log('--- Synchronisation Supabase & Images ---');

    // 1. Récupérer les produits depuis Supabase
    const { data: products, error } = await supabase
        .from('products')
        .select('id, image');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products in Supabase.`);

    // 2. Préparer le mapping et renommer les fichiers physiques
    const filesInDir = fs.readdirSync(imagesDir);
    const fileMap = {}; // mapping originalName -> sanitizedName

    filesInDir.forEach(file => {
        const sanitized = sanitize(file);
        if (file !== sanitized) {
            try {
                fs.renameSync(path.join(imagesDir, file), path.join(imagesDir, sanitized));
                console.log(`Physically renamed: ${file} -> ${sanitized}`);
            } catch (e) {
                console.warn(`Could not rename ${file}: ${e.message}`);
            }
        }
        fileMap[file] = sanitized;
    });

    // 3. Mettre à jour les produits dans Supabase
    for (const product of products) {
        if (!product.image) continue;

        const currentPath = product.image; // e.g., "/images/products/old-name.jpg"
        const filename = path.basename(currentPath);
        const folder = path.dirname(currentPath);

        const sanitizedFilename = sanitize(filename);
        const newPath = `${folder}/${sanitizedFilename}`.replace(/\\/g, '/');

        if (currentPath !== newPath) {
            console.log(`Updating DB ID ${product.id}: ${currentPath} -> ${newPath}`);
            const { error: updateError } = await supabase
                .from('products')
                .update({ image: newPath })
                .eq('id', product.id);

            if (updateError) {
                console.error(`Error updating product ${product.id}:`, updateError);
            }
        }
    }

    // 4. Mettre à jour products.json local (pour la cohérence du repo)
    const jsonPath = path.join(process.cwd(), 'src/data/products.json');
    if (fs.existsSync(jsonPath)) {
        const localProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        localProducts.forEach(p => {
            if (p.image) {
                const filename = path.basename(p.image);
                const folder = path.dirname(p.image);
                p.image = `${folder}/${sanitize(filename)}`.replace(/\\/g, '/');
            }
        });
        fs.writeFileSync(jsonPath, JSON.stringify(localProducts, null, 4));
        console.log('products.json updated.');
    }

    console.log('--- Sync Done ---');
}

sync();
