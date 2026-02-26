const fs = require('fs');
const path = require('path');

const imagesDir = path.join(process.cwd(), 'public/images/products');
const productsJsonPath = path.join(process.cwd(), 'src/data/products.json');

// Fonction pour nettoyer un nom de fichier
function sanitizeFilename(filename) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);

    return base
        .normalize('NFD') // Décompose les accents
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^\w\s-]/g, '') // Supprime les symboles spéciaux (garde alphanum, espaces, tirets)
        .trim()
        .replace(/\s+/g, '-') // Remplace espaces par tirets
        .replace(/-+/g, '-') // Évite les tirets doubles
        .toLowerCase() + ext.toLowerCase();
}

function run() {
    console.log('--- Nettoyage des images ---');

    // 1. Lire products.json
    if (!fs.existsSync(productsJsonPath)) {
        console.error('products.json introuvable');
        return;
    }
    const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    const nameMap = {}; // Map ancien_nom -> nouveau_nom

    // 2. Renommer les fichiers physiques
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        files.forEach(file => {
            const oldPath = path.join(imagesDir, file);
            const newName = sanitizeFilename(file);
            const newPath = path.join(imagesDir, newName);

            if (file !== newName) {
                console.log(`Renommage: "${file}" -> "${newName}"`);
                fs.renameSync(oldPath, newPath);
                nameMap[`/images/products/${file}`] = `/images/products/${newName}`;
            }
        });
    }

    // 3. Mettre à jour products.json
    let updatedCount = 0;
    products.forEach(p => {
        if (p.image && nameMap[p.image]) {
            p.image = nameMap[p.image];
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2));
        console.log(`${updatedCount} entrées mises à jour dans products.json`);
    }

    console.log('Terminé !');
}

run();
