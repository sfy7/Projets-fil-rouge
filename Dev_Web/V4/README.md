# 🌐 Portfolio FullStack — Safiétou Sy

Portfolio personnel développé avec **React + Vite + Tailwind CSS**, permettant de présenter, ajouter, modifier et supprimer des projets de manière dynamique via une API REST locale (`json-server`).

---

## 📁 Structure du projet

```
V4/
├── public/
│   └── logo.png                  # Logo affiché dans la navbar
├── src/
│   ├── api.js                    # Toutes les fonctions HTTP (GET, POST, PUT, DELETE)
│   ├── App.jsx                   # Composant racine — assemble les sections
│   ├── index.css                 # Styles globaux (Tailwind CSS)
│   ├── main.jsx                  # Point d'entrée React
│   └── components/
│       ├── Navbar.jsx            # Barre de navigation fixe avec ancres actives
│       ├── Dossier.jsx           # Cerveau de la section projets (état, CRUD, filtres)
│       ├── Projet.jsx            # Carte individuelle d'un projet
│       ├── Ajouter_projet.jsx    # Formulaire ajout / modification de projet
│       ├── Detailler_projet.jsx  # Modale centrée de détail d'un projet
│       ├── Contact.jsx           # Formulaire de contact
│       └── Footer.jsx            # Pied de page
├── db.json                       # Base de données JSON pour json-server
├── vite.config.js                # Configuration Vite
├── eslint.config.js              # Configuration ESLint
└── package.json
```

---

## ✨ Fonctionnalités

- **Page d'accueil** avec présentation personnelle et navigation par ancres
- **Section Projets** avec affichage en grille responsive (1 → 3 colonnes)
- **Recherche en temps réel** des projets par libellé
- **Tri automatique** des projets du plus récent au plus ancien
- **Ajout de projet** via un formulaire (libellé, description, technologies, image, date)
- **Modification** d'un projet existant (pré-remplissage du formulaire)
- **Suppression** avec modale de confirmation
- **Vue détail** d'un projet dans une modale centrée
- **Section Contact** avec formulaire (prénom, nom, email, sujet, message)
- **Footer** personnalisé
- Design **dark mode** entièrement construit avec Tailwind CSS v4

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|---|---|
| Frontend | React 19, JSX |
| Build | Vite 8 |
| CSS | Tailwind CSS v4 |
| Backend (mock) | json-server v1 (beta) |
| HTTP | Fetch API native |
| Lancement | concurrently (front + back en parallèle) |
| Lint | ESLint 9 |

---

## 🚀 Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- npm

### 1. Cloner le dépôt

```bash
git clone https://github.com/sfy7/Projets-fil-rouge.git
cd Projets-fil-rouge/V4
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le projet (frontend + backend simultanément)

```bash
npm run start
```

Cette commande lance en parallèle :

- **json-server** sur `http://localhost:3000` (API REST mock)
- **Vite dev server** sur `http://localhost:5173` (interface React)

> Vous pouvez aussi les lancer séparément :
>
> ```bash
> npm run server   # json-server uniquement
> npm run dev      # Vite uniquement
> ```

---

## 📡 API — Endpoints disponibles

L'API est servie par `json-server` et lit/écrit dans `db.json`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/projets` | Récupère tous les projets |
| `GET` | `/projets/:id` | Récupère un projet par son ID |
| `POST` | `/projets` | Ajoute un nouveau projet |
| `PUT` | `/projets/:id` | Modifie complètement un projet |
| `DELETE` | `/projets/:id` | Supprime un projet |

Toutes les requêtes HTTP sont centralisées dans `src/api.js`.

---

## 🗄️ Structure d'un projet (`db.json`)

```json
{
  "id": "1",
  "libelle": "Application E-commerce",
  "date": "Ajouté le 5 octobre 2023",
  "image": "https://...",
  "description": "Description complète du projet...",
  "technologies": "React, Node.js, PostgreSQL, Stripe API"
}
```

---

## 📦 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run start` | Lance le frontend et le backend simultanément |
| `npm run dev` | Lance uniquement le serveur Vite |
| `npm run server` | Lance uniquement json-server (port 3000) |
| `npm run build` | Compile le projet pour la production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Analyse le code avec ESLint |

---

## 🎨 Interface

- **Palette** : dégradé indigo → violet → rose sur le fond principal, dark `#111118` sur les cartes
- **Typographie** : Police système + `font-syne` pour les titres
- **Navigation** : Navbar fixe avec surlignage actif sur la section courante
- **Responsive** : Grille projets adaptative (1 col mobile → 3 col desktop)

---

## 📝 Notes

- Le formulaire de contact n'envoie pas d'email réel : il affiche uniquement un message de confirmation côté client.
- `json-server` est un outil de prototypage — les données sont persistées dans `db.json` en local. Pour un déploiement en production, il faudrait remplacer ce backend par une vraie API (Node.js/Express, NestJS, etc.).
- Le dossier `node_modules/` ne doit pas être versionné (déjà ignoré dans `.gitignore`).

---

## 🔗 Liens

- 💼 [LinkedIn](https://www.linkedin.com/in/safi3)
- 📧 [safietou0218@gmail.com](mailto:safietou0218@gmail.com)