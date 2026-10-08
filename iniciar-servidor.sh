#!/usr/bin/env bash

# Script de inicio automatizado para servidores Linux / macOS
# Nexus Asisten Care G.C - Historias Clínicas y Epidemiología

set -e

echo "=============================================================="
echo "  NEXUS ASISTEN CARE G.C - SERVIDOR LINUX / MACOS"
echo "=============================================================="
echo ""

# 1. Comprobar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado en este servidor."
    echo "Instálelo ejecutando: sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

echo "[OK] Versión de Node.js detectada: $(node -v)"
echo "[OK] Versión de NPM detectada:     $(npm -v)"
echo ""

# 2. Instalar paquetes
echo "[1/3] Instalando dependencias de producción..."
npm install

# 3. Compilar aplicación
echo "[2/3] Compilando assets estáticos y PWA..."
npm run build

# 4. Lanzar servidor
export PORT=${PORT:-3000}
export NODE_ENV=production

echo "[3/3] Lanzando servidor en http://0.0.0.0:${PORT} ..."
echo "Para mantenerlo en segundo plano continuo, se recomienda PM2: 'pm2 start server.ts --name medred --interpreter tsx'"
echo "Presione Ctrl + C para detener."
echo ""

npm start
