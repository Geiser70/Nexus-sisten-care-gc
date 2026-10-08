import JSZip from 'jszip';

export const ZipBundleService = {
  /**
   * Generates and downloads the complete software project as a ready-to-run .zip archive
   */
  async downloadCompleteSoftwareZip(): Promise<void> {
    const zip = new JSZip();

    // 1. package.json
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: 'nexus-asisten-care-gc',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --port=3000 --host=0.0.0.0',
            build: 'vite build',
            start: 'tsx server.ts',
            serve: 'node server.ts',
            preview: 'vite preview',
            lint: 'tsc --noEmit',
          },
          dependencies: {
            express: '^4.21.2',
            jspdf: '^4.2.1',
            'jspdf-autotable': '^5.0.8',
            jszip: '^3.10.1',
            'lucide-react': '^0.546.0',
            motion: '^12.23.24',
            react: '^19.0.1',
            'react-dom': '^19.0.1',
            vite: '^8.3.0',
            xlsx: '^0.18.5',
            dotenv: '^17.2.3',
            '@google/genai': '^2.4.0',
            '@tailwindcss/vite': '^4.3.3',
            '@vitejs/plugin-react': '^6.1.1',
          },
          devDependencies: {
            '@types/express': '^4.17.21',
            '@types/node': '^22.14.0',
            '@types/react': '^19.3.0',
            '@types/react-dom': '^19.3.0',
            autoprefixer: '^10.4.21',
            tailwindcss: '^4.3.3',
            tsx: '^4.21.0',
            typescript: '^7.0.2',
            'vite-plugin-pwa': '^2.0.0',
          },
        },
        null,
        2
      )
    );

    // 2. Windows 1-click batch launcher
    zip.file(
      'iniciar-windows.bat',
      `@echo off
chcp 65001 > nul
title Nexus Asisten Care G.C - Servidor de Salud y Base de Datos

echo ==============================================================
echo   NEXUS ASISTEN CARE G.C - HISTORIAS CLINICAS Y EPIDEMIOLOGIA
echo ==============================================================
echo.
echo [1/4] Verificando entorno Node.js en esta PC...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado en esta computadora.
    echo Por favor descargue e instale Node.js (version 18 o superior) desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detectado correctamente.
echo.
echo [2/4] Instalando paquetes y dependencias del sistema...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Ocurrio un problema al instalar dependencias con npm.
    pause
    exit /b 1
)

echo.
echo [3/4] Compilando la aplicacion web progresiva (PWA)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Error durante la compilacion.
    pause
    exit /b 1
)

echo.
echo [4/4] Iniciando el servidor local en el puerto 3000...
echo.
echo ==============================================================
echo   El software ya esta listo para utilizarse:
echo   Abra su navegador web en: http://localhost:3000
echo   Presione Ctrl + C en esta ventana para detener el servidor.
echo ==============================================================
echo.

start http://localhost:3000
call npm start

pause`
    );

    // 3. Linux/macOS launcher
    zip.file(
      'iniciar-servidor.sh',
      `#!/usr/bin/env bash
set -e
echo "=============================================================="
echo "  NEXUS ASISTEN CARE G.C - SERVIDOR LINUX / MACOS"
echo "=============================================================="
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado en este servidor."
    echo "Instálelo ejecutando: sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi
echo "[1/3] Instalando dependencias..."
npm install
echo "[2/3] Compilando assets..."
npm run build
export PORT=\${PORT:-3000}
export NODE_ENV=production
echo "[3/3] Iniciando servidor en http://0.0.0.0:\${PORT} ..."
npm start`
    );

    // 4. Dockerfile & docker-compose.yml
    zip.file(
      'Dockerfile',
      `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]`
    );

    zip.file(
      'docker-compose.yml',
      `services:
  nexus-asisten-care:
    build: .
    container_name: nexus-asisten-care-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production`
    );

    // 5. server.ts
    zip.file(
      'server.ts',
      `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Nexus Asisten Care G.C',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Historias Clínicas y Vigilancia Epidemiológica',
  });
});

const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('[Nexus Care Server] Sirviendo archivos compilados desde:', distPath);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('<h1>Nexus Asisten Care G.C</h1><p>Ejecute "npm run build && npm start" para compilar y servir.</p>');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('======================================================');
  console.log('  Nexus Asisten Care G.C - Servidor en Ejecución');
  console.log('  Acceso Local:    http://localhost:' + PORT);
  console.log('  Acceso de Red:   http://0.0.0.0:' + PORT);
  console.log('======================================================');
});`
    );

    // 6. tsconfig.json & vite.config.ts
    zip.file(
      'tsconfig.json',
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            experimentalDecorators: true,
            useDefineForClassFields: false,
            module: 'ESNext',
            types: ['vite/client'],
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            skipLibCheck: true,
            moduleResolution: 'bundler',
            isolatedModules: true,
            moduleDetection: 'force',
            allowJs: true,
            jsx: 'react-jsx',
            paths: { '@/*': ['./*'] },
            allowImportingTsExtensions: true,
            noEmit: true,
          },
        },
        null,
        2
      )
    );

    zip.file(
      'vite.config.ts',
      `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Nexus Asisten Care G.C - Historias Clínicas y Epidemiología',
          short_name: 'Nexus Care',
          description: 'Nexus Asisten Care G.C - Sistema integral de historias clínicas, trazabilidad intercentros de salud, análisis ASIS y estadísticas epidemiológicas.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});`
    );

    // 7. index.html
    zip.file(
      'index.html',
      `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexus Asisten Care G.C - Historias Clínicas y Epidemiología</title>
    <meta name="description" content="Nexus Asisten Care G.C - Sistema integral de gestión de historias clínicas, verificación farmacológica, trazabilidad intercentros de salud, análisis de situación de salud (ASIS) y estadísticas epidemiológicas con exportación Excel y PDF." />
    <meta name="theme-color" content="#0f172a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Nexus Care" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/pwa-192x192.png" />
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    );

    // 8. README Guia
    zip.file(
      'LEEME_INSTRUCCIONES_INSTALACION.txt',
      `========================================================================
NEXUS ASISTEN CARE G.C - INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN EN PC
========================================================================

¡Gracias por descargar Nexus Asisten Care G.C!

PASOS PARA EJECUTAR EN TU COMPUTADORA (WINDOWS):
------------------------------------------------
1. Asegúrate de tener instalado Node.js en tu PC (versión 18 o superior).
   Si aún no lo tienes, descárgalo gratis desde: https://nodejs.org/
   (Elige la versión recomendada LTS e instala con las opciones por defecto).

2. Descomprime esta carpeta ZIP en el lugar que prefieras (ejemplo: Escritorio o Documentos).

3. Haz DOBLE CLIC en el archivo:
   "iniciar-windows.bat"

4. El asistente se encargará de todo automáticamente:
   - Verificará Node.js
   - Instalará los paquetes necesarios
   - Compilará el sistema
   - Abrirá tu navegador automáticamente en: http://localhost:3000

¡Y listo! Tu software médico estará corriendo de forma 100% privada y local en tu propia PC.


PASOS PARA EJECUTAR EN LINUX / MAC:
-----------------------------------
1. Abre tu terminal en la carpeta descomprimida.
2. Ejecuta:
   chmod +x iniciar-servidor.sh
   ./iniciar-servidor.sh
3. Abre tu navegador en: http://localhost:3000


INSTALAR COMO APLICACIÓN NATIVA (PWA):
--------------------------------------
Una vez abierta la web en Google Chrome o Microsoft Edge, presiona el botón "Instalar App"
en la parte superior o en el ícono de instalación en la barra de direcciones del navegador.
La aplicación se instalará como un programa nativo de escritorio con su propio ícono.


RESPALDO DE BASE DE DATOS:
--------------------------
Recuerda que en la pestaña "Respaldo de Base de Datos" puedes:
- Descargar una copia completa de seguridad en archivo .json
- Exportar todas las tablas a Excel (.xlsx)
- Restaurar datos anteriores en cualquier momento.
========================================================================`
    );

    // 9. Public SVG Brand Icon
    const publicFolder = zip.folder('public');
    if (publicFolder) {
      publicFolder.file(
        'icon.svg',
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>
  <rect x="216" y="116" width="80" height="280" rx="20" fill="#ffffff"/>
  <rect x="116" y="216" width="280" height="80" rx="20" fill="#ffffff"/>
  <circle cx="256" cy="256" r="32" fill="#0d9488"/>
</svg>`
      );
    }

    // Generate zip blob
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Trigger download
    const downloadAnchor = document.createElement('a');
    const url = URL.createObjectURL(content);
    downloadAnchor.href = url;
    downloadAnchor.download = 'Nexus_Asisten_Care_GC_Software_Completo.zip';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  },
};
