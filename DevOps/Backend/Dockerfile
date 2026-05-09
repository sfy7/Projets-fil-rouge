# Image de base : Node.js 20 sur Alpine Linux 
FROM node:20-alpine

# Définit le répertoire de travail dans le conteneur
# Toutes les commandes suivantes s'exécuteront depuis /app 
WORKDIR /app

# Copie UNIQUEMENT les fichiers de dépendances en premier
COPY package*.json ./

# Installe uniquement les dépendances de production (pas devDependencies) 
# --omit=dev exclut nodemon etc. => image plus légère en production
RUN npm install --omit=dev

# Copie tout le code source dans le conteneur
# Le .dockerignore exclut node_modules et .env (voir fichier .dockerignore)
COPY . .

# Documente le port sur lequel l'app écoute (informatif, ne publie pas le port) 
EXPOSE 5000

# Commande exécutée au démarrage du conteneur
# On utilise 'node' directement (pas nodemon) car on est en production 
CMD [ "node", "src/app.js" ]
