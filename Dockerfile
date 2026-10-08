# Imagen base oficial de Node.js optimizada
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente completo
COPY . .

# Compilar PWA y assets
RUN npm run build

# Etapa final de producción
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

# Copiar compilado y servidor
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
