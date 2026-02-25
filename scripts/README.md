# Système de Migration des Produits

Ce dossier contient les scripts pour migrer les produits depuis **ivoirematos.com** vers votre projet MusicMarket.

## 📁 Fichiers

- **`scrape-products.js`** : Script principal de scraping
- **`adjust-products.js`** : Script d'ajustement des prix et descriptions
- **`product-config.json`** : Configuration des ajustements
- **`products-raw.json`** : Données brutes (généré après scraping)
- **`products-final.json`** : Données finales ajustées (généré après ajustement)

## 🚀 Utilisation

### 1. Installer les dépendances

```bash
npm install axios cheerio
```

### 2. Scraper les produits

```bash
npm run scrape
```

Cela va :
- Télécharger toutes les images dans `public/images/products/`
- Créer `products-raw.json` avec les données brutes

### 3. Configurer les ajustements

Éditez `product-config.json` pour :
- Ajuster les prix (pourcentage ou montant fixe)
- Définir les délais de livraison par catégorie
- Ajouter des prix personnalisés
- Ajouter des descriptions personnalisées

### 4. Appliquer les ajustements

```bash
npm run adjust
```

Cela va créer `products-final.json` avec vos ajustements.

### 5. Tout en une fois

```bash
npm run migrate
```

Exécute le scraping puis l'ajustement automatiquement.

## ⚙️ Configuration

### Ajustement global des prix

```json
{
  "priceAdjustment": {
    "type": "percentage",
    "value": 20
  }
}
```

- `type`: `"percentage"` ou `"fixed"`
- `value`: `20` = +20%, `-10` = -10%, ou montant fixe en F CFA

### Délais de livraison

```json
{
  "deliveryRules": {
    "local_stock": ["Accessoires pour musiciens"],
    "european_order": ["Piano & Clavier"]
  },
  "deliveryTimes": {
    "local_stock": "24-48h",
    "european_order": "2-3 semaines"
  }
}
```

### Prix personnalisés

```json
{
  "customPrices": {
    "A-Stand Flex Silver Millenium": 18000
  }
}
```

### Descriptions personnalisées

```json
{
  "customDescriptions": {
    "A-Stand Flex Silver Millenium": "Support de guitare professionnel ultra-stable"
  }
}
```

## 📊 Résultat

Le fichier `products-final.json` contient :

```json
[
  {
    "id": 1,
    "name": "A-Stand Flex Silver Millenium",
    "category": "Accessoires pour musiciens",
    "price": 18000,
    "image": "/images/products/product-1-a-stand-flex-silver.jpg",
    "description": "Support de guitare professionnel",
    "availability": "in_stock",
    "deliveryTime": "24-48h",
    "sourceUrl": "https://ivoirematos.com/product/..."
  }
]
```

## 🔄 Re-scraping

Vous pouvez re-scraper à tout moment pour mettre à jour les produits :

```bash
npm run scrape
npm run adjust
```

Les images existantes seront écrasées.
