# 🌐 FullStack Portfolio — Safiétou Sy

Portfolio personnel, présentant des projets réalisés avec la possibilité d'en ajouter, consulter et supprimer dynamiquement via une API locale (`json-server`).

---

## 📁 Arborescence du projet

```
Projets-fil-rouge/
├── images/
│   └── logo.png
├── node_modules/           # Dépendances Node.js (généré automatiquement)
├── src/
│   ├── input.css           # Fichier source CSS (directives Tailwind)
│   └── output.css          # Fichier CSS généré par Tailwind CSS
├── db.json                 # Base de données locale (json-server)
├── index.html              # Page principale du portfolio
├── package.json            # Métadonnées et dépendances du projet
├── package-lock.json       # Verrouillage des versions des dépendances
├── README.md
└── script.js               # Logique JavaScript (CRUD via fetch)
```

---

## ✨ Fonctionnalités

- 🏠 **Section Accueil** — Présentation personnelle avec liens rapides
- 🗂️ **Section Projets** — Affichage dynamique des projets depuis l'API
- ➕ **Ajout de projet** — Formulaire avec upload d'image ou URL
- 🔍 **Détail projet** — Modale avec description et technologies
- 🗑️ **Suppression de projet** — Suppression avec confirmation
- 📬 **Section Contact** — Formulaire de contact
- 📱 **Design responsive** — Compatible tous écrans

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|---|---|
| HTML5 | Structure de la page |
| Tailwind CSS | Stylisation et responsive design |
| JavaScript (Vanilla) | Logique dynamique et appels API |
| JSON Server | API REST locale (mock backend) |
| Font Awesome | Icônes sociales et UI |

---

## 🚀 Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org/) installé sur votre machine
- Un terminal (bash, PowerShell, etc.)

---

### 1. Cloner le projet

```bash
git https://github.com/sfy7/Projets-fil-rouge.git
cd Projets-fil-rouge/V3
```

---

### 2. Installer JSON Server

```bash
npm install -g json-server
```

> Si vous préférez une installation locale (sans `-g`) :
>
> ```bash
> npm install json-server
> ```

---

### 3. Lancer le serveur JSON

```bash
npx json-server --watch db.json --port 3000
```

✅ Le serveur démarre et expose l'API à l'adresse :

```
http://localhost:3000/projets
```

> Vous devriez voir dans le terminal :
> ```bash
> Resources
> http://localhost:3000/projets
>
> Home
> http://localhost:3000
> ```

---

### 4. Ouvrir le portfolio

Ouvrez le fichier `index.html` dans votre navigateur :

- **Directement** : double-cliquez sur `index.html`
- **Ou via une extension** comme [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) sur VS Code

> ⚠️ Le serveur `json-server` doit être lancé **avant** d'ouvrir la page, sinon les projets ne s'afficheront pas.

---

## 📡 Points de terminaison de l'API

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/projets` | Récupérer tous les projets |
| `POST` | `/projets` | Ajouter un nouveau projet |
| `DELETE` | `/projets/:id` | Supprimer un projet par ID |

---

## 📄 Structure de `db.json`

```json
{
  "projets": [
    {
      "id": "1",
      "libelle": "Nom du projet",
      "date": "Ajouté le 5 octobre 2023",
      "image": "https://url-de-limage.com/image.jpg",
      "description": "Description détaillée du projet.",
      "technologies": "React, Node.js, PostgreSQL"
    }
  ]
}
```

---

## 🔗 Liens

- 💼 [LinkedIn](https://www.linkedin.com/in/safi3)
- 📧 [safietou0218@gmail.com](mailto:safietou0218@gmail.com)