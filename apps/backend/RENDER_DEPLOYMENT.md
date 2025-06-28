# 🚀 Déploiement Render - Hotel Intel Backend

## Configuration Playwright pour Render

### Variables d'environnement requises

Ajoutez ces variables dans votre projet Render :

```bash
# Base
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string

# Playwright Configuration
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PLAYWRIGHT_CACHE_DIR=/tmp/playwright-cache
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

### Script de build personnalisé

Dans Render, utilisez ce script de build :

```bash
npm install && npx playwright install chromium && npm run build
```

### Commandes de démarrage

- **Build Command**: `npm install && npx playwright install chromium && npm run build`
- **Start Command**: `npm run start:prod`

## Endpoints disponibles

### Service Playwright (Recommandé pour Render)
- `POST /scraper-playwright/hotel` - Scraper un hôtel
- `POST /scraper-playwright/batch` - Scraper plusieurs hôtels

### Service original (Axios + Cheerio)
- `POST /scraper/hotel` - Scraper un hôtel
- `POST /scraper/batch` - Scraper plusieurs hôtels

## Avantages de Playwright sur Render

✅ **Compatible** - Fonctionne nativement sur Render  
✅ **Stable** - Moins de problèmes de dépendances  
✅ **Performant** - Optimisé pour les environnements headless  
✅ **Robuste** - Gestion automatique des timeouts et erreurs  

## Dépannage

### Erreur "Browser not found"
- Vérifiez que `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` est correct
- Assurez-vous que le build installe les navigateurs

### Erreur "Permission denied"
- Le script de build doit installer Playwright avec les bonnes permissions

### Erreur "Memory limit exceeded"
- Utilisez le plan "Starter" ou supérieur
- Optimisez les timeouts dans le code

## Monitoring

Surveillez les logs Render pour :
- 🔍 Initialisation du browser
- 📡 Requêtes GraphQL interceptées
- ⏱️ Temps de réponse
- ❌ Erreurs de scraping 