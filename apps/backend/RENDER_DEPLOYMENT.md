# 🚀 Déploiement Render - Hotel Intel Backend (Puppeteer)

## Configuration Puppeteer pour Render

### Variables d'environnement requises

Ajoutez ces variables dans votre projet Render :

```bash
# Base
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string

# Puppeteer Configuration (optionnel)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### Script de build

Dans Render, utilisez ce script de build :

```bash
npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Commandes de démarrage

- **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm run start:prod`

## Endpoints disponibles

### Service Puppeteer (Recommandé)
- `POST /scraper-puppeteer/hotel` - Scraper un hôtel avec Puppeteer
- `POST /scraper-puppeteer/batch` - Scraper plusieurs hôtels avec Puppeteer

### Service original (Axios + Cheerio) - Fallback
- `POST /scraper/hotel` - Scraper un hôtel
- `POST /scraper/batch` - Scraper plusieurs hôtels

## Avantages de Puppeteer sur Render

✅ **Compatible** - Fonctionne nativement sur Render  
✅ **Léger** - Moins de dépendances que Playwright  
✅ **Stable** - Configuration optimisée pour les environnements headless  
✅ **Rapide** - Installation et démarrage plus rapides  

## Configuration Render

### Variables d'environnement
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### Build Command
```bash
npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Start Command
```bash
npm run start:prod
```

## Dépannage

### Erreur "Browser not found"
- Puppeteer utilise automatiquement le Chrome système sur Render
- Pas besoin d'installer des navigateurs supplémentaires

### Erreur "Permission denied"
- Puppeteer gère automatiquement les permissions sur Render

### Erreur "Memory limit exceeded"
- Utilisez le plan "Starter" ou supérieur
- Puppeteer est plus léger que Playwright

### Erreur "Build timeout"
- Le build Puppeteer est plus rapide que Playwright
- Si problème, utilisez le service fallback (Axios + Cheerio)

## Monitoring

Surveillez les logs Render pour :
- 🔍 Initialisation du browser Puppeteer
- 📡 Requêtes GraphQL interceptées
- ⏱️ Temps de réponse
- ❌ Erreurs de scraping
- 🔄 Fallback vers Axios + Cheerio si nécessaire

## Test des endpoints

### Test simple
```bash
curl -X POST http://your-render-app.onrender.com/scraper-puppeteer/hotel \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.booking.com/hotel/fr/example.html"}'
```

### Test batch
```bash
curl -X POST http://your-render-app.onrender.com/scraper-puppeteer/batch \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.booking.com/hotel/fr/example1.html", "https://www.booking.com/hotel/fr/example2.html"]}'
``` 