# ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
# STAGE 1 — BUILD : Compilation de l'application React
# ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
# 'AS builder' nomme cette étape pour la référencer dans le stage 2 
FROM node:20-alpine AS builder

WORKDIR /app

# Copie package.json en premier pour exploiter le cache Docker 
COPY package*.json ./

# Installe TOUTES les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copie du code source react
COPY . .

# Lance la compilation React => génère le dossier /app/build
# Ce dossier contient les fichiers HTML/CSS/JS statiques optimisés 
RUN npm run build

# ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
# STAGE 2 — RUNTIME : Serveur nginx ultra-léger
# ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
# Nouvelle image de base : nginx:alpine (~25 Mo) — Node.js n'est plus nécessaire 
FROM nginx:alpine

# Récupère UNIQUEMENT le dossier build depuis le stage 1
# Node_modules, code source, etc. ne sont PAS inclus => image finale légère 
COPY --from=builder /app/dist /usr/share/nginx/html

# Injecte notre configuration nginx personnalisée 
# Elle remplace la config par défaut de nginx 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Lance nginx en mode foreground (requis par Docker — pas de daemon) 
CMD ["nginx", "-g", "daemon off;"]



