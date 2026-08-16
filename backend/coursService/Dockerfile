# ---------------------------------------------------------
# Étape 1 : Installation des dépendances de production
# ---------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copie uniquement les fichiers de configuration npm
COPY package*.json ./

# Installation propre des dépendances de production uniquement (+ nettoyage cache)
RUN npm install --omit=dev --no-audit --progress=false && \
    npm cache clean --force

# ---------------------------------------------------------
# Étape 2 : Image finale (Runner)
# ---------------------------------------------------------
FROM node:20-alpine AS runner

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=8003

WORKDIR /app

# Sécurité : Création d'un utilisateur non-root
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Installation de dépendances système : ffmpeg (inclut ffprobe), libc6-compat, curl
RUN apk add --no-cache libc6-compat curl ffmpeg && \
    rm -rf /var/cache/apk/*

# Récupération sélective depuis l'étape 'deps'
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copie du code source et des fichiers de données nécessaires
COPY src ./src
COPY *.json ./

# Préparation des répertoires d'uploads avec les bons droits
RUN mkdir -p uploads/images uploads/videos uploads/documents && \
    chown -R nodejs:nodejs /app

# Ajout d'un Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Utilisation de l'utilisateur sécurisé
USER nodejs

EXPOSE ${PORT}

# Exécution directe pour une meilleure gestion des signaux
CMD ["node", "src/server.js"]
