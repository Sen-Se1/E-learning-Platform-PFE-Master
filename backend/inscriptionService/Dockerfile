# ---------------------------------------------------------
# Étape 1 : Installation des dépendances de production
# ---------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --progress=false && \
    npm cache clean --force

# ---------------------------------------------------------
# Étape 2 : Image finale (Runner)
# ---------------------------------------------------------
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8005

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache libc6-compat curl && \
    rm -rf /var/cache/apk/*

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

RUN chown -R nodejs:nodejs /app

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

USER nodejs

EXPOSE ${PORT}
CMD ["node", "src/server.js"]
