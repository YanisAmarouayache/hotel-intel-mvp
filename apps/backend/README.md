# Hotel Intel Backend

Backend NestJS avec GraphQL et Prisma pour l'application Hotel Intel.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` dans le dossier `apps/backend/` avec :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_intel?schema=public"
```

### 2. Base de données

1. Installez PostgreSQL
2. Créez une base de données `hotel_intel`
3. Exécutez les migrations Prisma :

```bash
npx prisma migrate dev --name init
```

### 3. Génération du client Prisma

```bash
npx prisma generate
```

## Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start:prod
```

## GraphQL Playground

Une fois le serveur démarré, accédez à :
- **GraphQL Playground** : http://localhost:3000/graphql

## Queries disponibles

### Récupérer tous les hôtels
```graphql
query {
  hotels {
    id
    name
    city
    price
    createdAt
    updatedAt
  }
}
```

### Récupérer un hôtel par ID
```graphql
query {
  hotel(id: 1) {
    id
    name
    city
    price
  }
}
```

## Mutations disponibles

### Créer un hôtel
```graphql
mutation {
  createHotel(
    name: "Hôtel de Paris"
    city: "Paris"
    price: 150.0
  ) {
    id
    name
    city
    price
  }
}
```

### Mettre à jour un hôtel
```graphql
mutation {
  updateHotel(
    id: 1
    name: "Nouveau nom"
    price: 200.0
  ) {
    id
    name
    city
    price
  }
}
```

### Supprimer un hôtel
```graphql
mutation {
  deleteHotel(id: 1) {
    id
    name
  }
}
```

## Structure du projet

```
src/
├── app.module.ts          # Module principal
├── app.controller.ts      # Contrôleur REST
├── main.ts               # Point d'entrée
├── hotel/                # Module Hotel
│   ├── hotel.module.ts
│   ├── hotel.resolver.ts
│   ├── hotel.service.ts
│   └── hotel.model.ts
└── prisma/               # Service Prisma
    ├── prisma.module.ts
    └── prisma.service.ts
``` 