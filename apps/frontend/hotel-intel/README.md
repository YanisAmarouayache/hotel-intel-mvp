# Hotel Intel Frontend

Application React moderne pour l'analyse concurrentielle hôtelière.

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── components/           # Composants réutilisables
│   ├── Dashboard/       # Composants spécifiques au dashboard
│   ├── Layout/          # Composants de mise en page
│   ├── Navigation/      # Composants de navigation
│   ├── HotelCard/       # Carte d'hôtel
│   ├── LoadingSpinner/  # Indicateur de chargement
│   ├── ErrorDisplay/    # Affichage d'erreurs
│   ├── EmptyState/      # États vides
│   └── HotelsGrid/      # Grille d'hôtels
├── constants/           # Constantes de l'application
│   ├── navigation.ts    # Configuration de navigation
│   └── theme.ts         # Configuration du thème
├── hooks/               # Hooks personnalisés
│   └── useHotels.ts     # Hook pour les données d'hôtels
├── types/               # Types TypeScript
│   └── index.ts         # Types centralisés
├── graphql/             # Requêtes GraphQL
│   └── queries.ts       # Définitions des requêtes
├── lib/                 # Bibliothèques et configurations
│   └── apollo.ts        # Configuration Apollo Client
├── pages/               # Pages de l'application
│   ├── DashboardPage.tsx
│   ├── HotelsPage.tsx
│   └── AddCompetitorPage.tsx
└── App.tsx              # Point d'entrée
```

## 🎨 Design System

### Thème Material UI
- **Couleurs primaires** : Bleu (#1976d2)
- **Couleurs secondaires** : Rose (#dc004e)
- **Bordures arrondies** : 8px par défaut
- **Typographie** : Roboto avec poids 600 pour les titres

### Composants réutilisables
- **StatCard** : Carte de statistique avec tendance
- **HotelCard** : Carte d'hôtel avec informations complètes
- **LoadingSpinner** : Indicateur de chargement personnalisable
- **ErrorDisplay** : Affichage d'erreurs avec différents niveaux
- **EmptyState** : États vides avec messages personnalisables

## 🧩 Composants

### Navigation
- **AppLayout** : Layout principal avec navigation latérale
- **NavigationDrawer** : Drawer de navigation responsive
- **NavigationItem** : Élément de navigation individuel
- **AppHeader** : Barre d'application avec titre dynamique

### Dashboard
- **StatsGrid** : Grille de statistiques responsive
- **StatCard** : Carte de statistique avec icône et tendance

### Formulaires
- **AddCompetitorPage** : Formulaire avec validation Zod
- **React Hook Form** : Gestion des formulaires
- **Validation** : Schémas Zod pour la validation

## 🔧 Technologies

- **React 18** avec TypeScript
- **Material UI 5** pour le design system
- **Apollo Client** pour GraphQL
- **React Router DOM** pour la navigation
- **React Hook Form** pour les formulaires
- **Zod** pour la validation
- **Vite** pour le build

## 🚀 Fonctionnalités

### ✅ Implémentées
- [x] Layout responsive avec navigation
- [x] Dashboard avec métriques
- [x] Affichage des hôtels
- [x] Formulaire d'ajout de compétiteur
- [x] Validation des formulaires
- [x] Gestion des états de chargement/erreur
- [x] Thème cohérent et moderne

### 🚧 En développement
- [ ] Analyse concurrentielle
- [ ] Évolution des prix
- [ ] Stratégie de yield
- [ ] Gestion des événements
- [ ] Critères et pondération saisonnière
- [ ] Paramètres de l'application

## 📱 Responsive Design

- **Mobile** : Navigation en drawer temporaire
- **Tablet** : Layout adaptatif
- **Desktop** : Navigation latérale fixe

## 🎯 Bonnes pratiques

- **Composants modulaires** : Chaque composant a une responsabilité unique
- **Types centralisés** : Tous les types dans `/types/index.ts`
- **Hooks personnalisés** : Logique métier dans des hooks réutilisables
- **Validation stricte** : Zod pour la validation des données
- **Design system** : Thème cohérent et composants réutilisables
- **Performance** : Lazy loading et optimisations React
