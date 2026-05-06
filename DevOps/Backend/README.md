# 📁 API REST — Gestion de Portfolio

API REST construite avec **Express.js** et **MongoDB** via **Mongoose**, dans le cadre d'un projet de portfolio personnel.

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|---|---|
| Node.js | Environnement d'exécution |
| Express.js | Framework HTTP |
| MongoDB | Base de données NoSQL |
| Mongoose | ODM (Object Data Modeling) |
| dotenv | Gestion des variables d'environnement |
| cors | Autorisation des requêtes cross-origin |
| nodemon | Rechargement automatique en développement |

---

## 📂 Structure du projet

```
Backend/
├── src/
│   ├── app.js                  # Point d'entrée de l'application
│   ├── config/
│   │   ├── connectdb.js        # Connexion à MongoDB
│   │   └── seeder.js           # Peuplement initial de la base de données
│   ├── models/
│   │   └── model.js            # Schéma et modèle Mongoose (Projet)
│   ├── controllers/
│   │   └── controller.js       # Logique métier — CRUD complet
│   ├── routes/
│   │   └── routes.js           # Définition des routes (express.Router)
│   └── middleware/
│       └── middleware.js       # Logger, validation, 404, error handler
├── .env                        # Variables d'environnement (non commité)
├── .gitignore
└── package.json
```

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js v16+
- MongoDB installé et en cours d'exécution **ou** un compte MongoDB Atlas

### 1. Installer les dépendances
```bash
npm install
```
### 2. Peupler la base de données (optionnel)
```bash
npm run seed
```

### 3. Démarrer le serveur
```bash
# Mode développement (rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:5000**

---

## 🔌 Endpoints de l'API

### Base URL : `http://localhost:5000/api`

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/projets` | Récupérer tous les projets |
| POST | `/api/projets` | Ajouter un nouveau projet |
| GET | `/api/projets/:id` | Récupérer un projet par son ID |
| PUT | `/api/projets/:id` | Modifier un projet |
| DELETE | `/api/projets/:id` | Supprimer un projet |

### Paramètres de query string (GET /api/projets)

| Paramètre | Type | Description | Exemple |
|---|---|---|---|
| `page` | number | Numéro de page | `?page=1` |
| `limit` | number | Nombre de résultats | `?limit=10` |
| `statut` | string | Filtrer par statut | `?statut=terminé` |
| `technologies` | string | Filtrer par technologie | `?technologies=React` |

---

## 📝 Exemples de requêtes

### Créer un projet
```http
POST /api/projets
Content-Type: application/json

{
  "libelle": "Portfolio Personnel",
  "description": "Mon site portfolio développé avec React et Node.js",
  "technologies": ["React", "Node.js", "MongoDB"],
  "image": "https://exemple.com/image.jpg",
  "date": "2024-01-01"
}
```

### Réponse
```json
{
  "success": true,
  "message": "Projet ajoute avec succes",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "libelle": "Portfolio Personnel",
    "description": "Mon site portfolio développé avec React et Node.js",
    "technologies": ["React", "Node.js", "MongoDB"],
    "image": "https://exemple.com/image.jpg",
    "date": "2024-01-01T00:00:00.000Z"
  }
}
```

### Modifier un projet
```http
PUT /api/projets/64f1a2b3c4d5e6f7a8b9c0d1
Content-Type: application/json

{
  "libelle": "Portfolio V2",
  "technologies": ["React", "Node.js", "MongoDB", "TailwindCSS"]
}
```

---

## 🗃️ Schéma du modèle Projet

| Champ | Type | Obligatoire | Défaut |
|---|---|---|---|
| `libelle` | String | ✅ | — |
| `description` | String | ✅ | — |
| `technologies` | [String] | ❌ | `[]` |
| `image` | String | ❌ | `null` |
| `imageNom` | String | ❌ | `null` |
| `date` | Date | ❌ | `Date.now` |

---

## 🌱 Seeder

Peupler la base avec les données initiales :
```bash
npm run seed
```

Vider toute la base :
```bash
npm run seed:destroy
```

---

## 🔧 Concepts mis en œuvre

- **express.Router** — Routage modulaire avec paramètres de route (`:id`)
- **Middleware** — Logger, validation des champs, validation ObjectId, gestion 404 et erreurs globales
- **Query string** — Filtrage et pagination via `req.query`
- **Corps de requête** — Réception des données via `req.body`
- **Paramètres de route** — Accès via `req.params`
- **Status codes** — 200, 201, 400, 404, 500
- **CORS** — Autorisation du frontend React (`http://localhost:5173`)
- **Mongoose** — Schéma, modèle, CRUD complet avec normalisation des données

---

## ⚙️ Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarrage en mode développement (nodemon) |
| `npm start` | Démarrage en mode production |
| `npm run seed` | Insertion des données initiales |
| `npm run seed:destroy` | Suppression de toutes les données |

---

## 🌐 Frontend associé

Ce backend est conçu pour fonctionner avec le frontend React du projet **V4**.
Le frontend tourne sur `http://localhost:5173` et communique avec cette API via `fetch`.
