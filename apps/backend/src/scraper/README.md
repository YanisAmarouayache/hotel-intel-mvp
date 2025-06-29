# Scraper Module - NestJS

Module NestJS pour le scraping de données hôtelières depuis Booking.com, inspiré du package `packages/scraper`.

## 🚀 Fonctionnalités

- **Scraping d'hôtel unique** : Extraction complète des données d'un hôtel
- **Scraping batch** : Traitement de plusieurs hôtels avec délai respectueux
- **Extraction de données** : Nom, adresse, note, avis, description, équipements, images
- **Extraction de prix** : Tarifs par date, disponibilité, devise, type de chambre
- **Gestion GraphQL** : Capture automatique des réponses GraphQL de Booking.com
- **Documentation Swagger** : API documentée et testable via `/api/docs`

## 📋 Données extraites

### Informations hôtel
- **Nom** : Nom de l'hôtel (extraction prioritaire depuis JSON-LD)
- **URL** : URL source de la page
- **Adresse** : Adresse complète de l'hôtel
- **Note** : Note utilisateur (sur 10)
- **Nombre d'avis** : Nombre total d'avis
- **Description** : Description de l'hôtel
- **Équipements** : Liste des équipements disponibles
- **Images** : URLs des images de l'hôtel

### Données de prix
- **Date** : Date de disponibilité
- **Prix** : Tarif en devise locale
- **Devise** : Devise du prix (EUR par défaut)
- **Disponibilité** : Si la chambre est disponible
- **Type de chambre** : Type de chambre (Standard par défaut)

## 🔧 Utilisation

### Scraping d'un hôtel unique

```bash
POST /scraper/hotel
Content-Type: application/json

{
  "url": "https://www.booking.com/hotel/fr/brach-paris.fr.html"
}
```

### Scraping batch

```bash
POST /scraper/batch
Content-Type: application/json

{
  "urls": [
    "https://www.booking.com/hotel/fr/brach-paris.fr.html",
    "https://www.booking.com/hotel/fr/bonne-nouvelle.fr.html"
  ]
}
```

## 📊 Réponse

### Scraping unique
```json
{
  "success": true,
  "data": {
    "hotel": {
      "name": "Brach Paris",
      "url": "https://www.booking.com/hotel/fr/brach-paris.fr.html",
      "address": "1-7 Rue Jean Richepin, 16e arr., 75016 Paris, France",
      "rating": 8.5,
      "reviewCount": 1247,
      "description": "Situé dans le 16e arrondissement...",
      "amenities": ["WiFi gratuit", "Spa", "Restaurant"],
      "images": ["https://...", "https://..."]
    },
    "pricing": [
      {
        "date": "2024-01-15",
        "price": 250,
        "currency": "EUR",
        "availability": true,
        "roomType": "Chambre Deluxe"
      }
    ],
    "scrapedAt": "2024-01-15T10:30:00.000Z"
  },
  "url": "https://www.booking.com/hotel/fr/brach-paris.fr.html"
}
```

### Scraping batch
```json
{
  "results": [...],
  "totalHotels": 2,
  "successfulScrapes": 2,
  "failedScrapes": 0,
  "duration": 5000
}
```

## 🛠️ Configuration

### Dépendances requises
- `playwright` : Navigation et extraction web
- `@nestjs/swagger` : Documentation API
- `class-validator` : Validation des données

### Variables d'environnement
Aucune variable d'environnement spécifique requise.

## 🔍 Détails techniques

### Extraction du nom d'hôtel
1. **JSON-LD** : Recherche dans les données structurées
2. **Sélecteurs CSS** : Multiple sélecteurs pour la robustesse
3. **Titre de page** : Fallback sur le titre de la page

### Extraction des prix
1. **GraphQL** : Capture des réponses GraphQL de Booking.com
2. **Contenu de page** : Extraction depuis les éléments HTML
3. **Parsing intelligent** : Gestion des différents formats de prix

### Gestion des erreurs
- **Timeout** : 30 secondes par page
- **Retry** : Gestion automatique des échecs
- **Logging** : Logs détaillés pour le debugging

## 📚 Documentation Swagger

La documentation complète de l'API est disponible à :
```
http://localhost:3000/api/docs
```

## ⚠️ Notes importantes

- **Délai respectueux** : 2 secondes entre les requêtes batch
- **Images bloquées** : Les images sont bloquées pour améliorer les performances
- **User-Agent** : Utilisation d'un User-Agent réaliste
- **Headless** : Mode headless pour la production

## 🔄 Intégration

Le module peut être facilement intégré dans d'autres services NestJS :

```typescript
import { ScraperService } from './scraper/scraper.service';

@Injectable()
export class HotelService {
  constructor(private scraperService: ScraperService) {}

  async scrapeAndSave(url: string) {
    const result = await this.scraperService.scrapeHotel(url);
    if (result.success && result.data) {
      // Sauvegarder dans la base de données
      return this.saveHotel(result.data);
    }
  }
}
``` 