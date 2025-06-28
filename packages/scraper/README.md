# Hotel Monitoring Scraper (TypeScript)

Un scraper TypeScript moderne utilisant Playwright pour extraire les données d'hôtels depuis Booking.com.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Installer Playwright browsers
npx playwright install chromium
```

## 📦 Structure

```
scraper/
├── src/
│   ├── types.ts           # Types TypeScript
│   ├── hotel-scraper.ts   # Scraper principal avec Playwright
│   ├── api-client.ts      # Client pour communiquer avec le backend
│   ├── index.ts           # Point d'entrée principal
│   └── test.ts            # Script de test
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Utilisation

### Test simple
```bash
npm run test
```

### Scraper un hôtel
```bash
npm run scrape "https://www.booking.com/hotel/fr/brach-paris.fr.html"
```

### Scraper plusieurs hôtels
```bash
npm run scrape --batch \
  "https://www.booking.com/hotel/fr/brach-paris.fr.html" \
  "https://www.booking.com/hotel/fr/bonne-nouvelle.fr.html"
```

### Utilisation programmatique
```typescript
import { HotelMonitoringScraper } from './src/index.js';

const scraper = new HotelMonitoringScraper();
await scraper.initialize();

const result = await scraper.scrapeSingleHotel('https://www.booking.com/hotel/fr/brach-paris.fr.html');
console.log(result);

await scraper.close();
```

## 🔧 Configuration

Le scraper se connecte automatiquement au backend Python sur `http://localhost:8000`. Si le backend n'est pas disponible, les données ne seront pas sauvegardées mais le scraping fonctionnera quand même.

## 📊 Données extraites

- **Informations hôtel** : nom, adresse, note, nombre d'avis, description, équipements, images
- **Prix** : tarifs par date, disponibilité, devise, type de chambre
- **Métadonnées** : date de scraping, URL source

## 🛠️ Avantages vs Python

✅ **Plus simple** : Pas de problèmes d'environnement Python  
✅ **Plus robuste** : TypeScript avec types stricts  
✅ **Plus moderne** : Playwright avec support ES modules  
✅ **Plus maintenable** : Code structuré et typé  
✅ **Plus fiable** : Gestion d'erreurs améliorée  

## 🔄 Intégration avec le backend

Le scraper TypeScript communique avec le backend Python via HTTP :
- `POST /api/hotels` : Sauvegarder les données d'hôtel
- `GET /api/hotels` : Récupérer la liste des hôtels
- `GET /health` : Tester la connexion

## 🚨 Notes importantes

- Le scraper utilise un délai de 2 secondes entre les requêtes pour être respectueux
- Les images sont bloquées pour améliorer les performances
- Le scraper gère automatiquement les différents formats de réponse GraphQL
- En cas d'échec du GraphQL, il tente d'extraire les prix depuis le contenu de la page 