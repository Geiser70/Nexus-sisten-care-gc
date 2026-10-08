import React, { useState } from 'react';
import {
  X,
  Server,
  Laptop,
  Box,
  Smartphone,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface DeploymentModalProps {
  onClose: () => void;
  onInstallPwa: () => void;
  canInstallPwa: boolean;
  isPwaInstalled: boolean;
  isIOS: boolean;
  onDownloadZip: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  onClose,
  onInstallPwa,
  canInstallPwa,
  isPwaInstalled,
  isIOS,
  onDownloadZip,
}) => {
  const [activePlatform, setActivePlatform] = useState<'pc' | 'server' | 'docker' | 'app'>('pc');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const windowsBatContent = `@echo off
chcp 65001 > nul
title Nexus Asisten Care G.C - Servidor de Salud y Base de Datos
echo [1/3] Instalando paquetes y dependencias...
call npm install
echo [2/3] Compilando la aplicacion web progresiva (PWA)...
call npm run build
echo [3/3] Iniciando el servidor local en el puerto 3000...
start http://localhost:3000
call npm start
pause`;

  const serverShContent = `#!/usr/bin/env bash
set -e
echo "Iniciando Nexus Asisten Care G.C en Servidor..."
npm install
npm run build
export PORT=\${PORT:-3000}
export NODE_ENV=production
npm start`;

  const dockerComposeContent = `services:
  nexus-asisten-care:
    build: .
    container_name: nexus-asisten-care-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Paquete de Ejecución en PC, Servidor y Modo App
              </h2>
              <p className="text-xs text-slate-400">
                Instrucciones de instalación, scripts de inicio y descarga de archivos de configuración
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActivePlatform('pc')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePlatform === 'pc'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Ejecutar en PC (Windows / Mac)</span>
          </button>

          <button
            onClick={() => setActivePlatform('app')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePlatform === 'app'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalar como App (PWA)</span>
          </button>

          <button
            onClick={() => setActivePlatform('server')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePlatform === 'server'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Servidor Linux / Cloud</span>
          </button>

          <button
            onClick={() => setActivePlatform('docker')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePlatform === 'docker'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Docker Container</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Universal Full Software ZIP Download Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  Descarga Directa
                </span>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Descargar el Software Completo en tu Computadora (.ZIP)
                </h3>
              </div>
              <p className="text-slate-300 text-xs max-w-xl">
                Obtén el proyecto empaquetado con todos los códigos, scripts de inicio de 1 clic para Windows, servidor Express, base de datos y manual de instalación.
              </p>
            </div>
            <button
              onClick={onDownloadZip}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar ZIP para PC</span>
            </button>
          </div>

          {/* TAB: PC */}
          {activePlatform === 'pc' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-teal-600" />
                  Instrucciones para Ejecutar en Computadora Personal
                </h3>
                <p className="text-slate-600 text-xs">
                  Requisito previo: Tener instalado <strong>Node.js (v18+)</strong> en su equipo (descargable gratis en <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-teal-700 underline font-medium">nodejs.org</a>).
                </p>
              </div>

              {/* Step 1: Script download */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800">
                    Opción A: Script Automatizado para Windows (Doble Clic)
                  </div>
                  <button
                    onClick={() => downloadFile('iniciar-windows.bat', windowsBatContent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar iniciar-windows.bat</span>
                  </button>
                </div>
                <p className="text-slate-500">
                  Guarde el archivo <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">iniciar-windows.bat</code> en la carpeta de la aplicación y haga doble clic para instalar, compilar y abrir en el navegador.
                </p>
              </div>

              {/* Step 2: Terminal commands */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="font-bold text-slate-800">
                  Opción B: Comandos de Terminal / Símbolo del Sistema
                </div>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# 1. Instalar dependencias
npm install

# 2. Compilar aplicación
npm run build

# 3. Iniciar el servidor local
npm start`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build && npm start', 'pc-commands')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                  >
                    {copiedCode === 'pc-commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'pc-commands' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-slate-600">
                  El servidor se iniciará en: <strong className="text-teal-700 font-mono">http://localhost:3000</strong>
                </p>
              </div>
            </div>
          )}

          {/* TAB: PWA APP */}
          {activePlatform === 'app' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-700" />
                  <h3 className="text-sm font-bold text-teal-950">
                    Modo Aplicación Instalable (PWA)
                  </h3>
                </div>
                <p className="text-teal-900 text-xs">
                  Nexus Asisten Care G.C está configurado con tecnología <strong>Progressive Web App (PWA)</strong>. Puede instalarlo como una aplicación independiente en su escritorio (Windows, Mac) o en su teléfono/tablet (Android, iOS) con ícono propio y soporte fuera de línea.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                      Estado de Instalación en este Dispositivo
                    </h4>
                    <p className="text-slate-500 mt-0.5">
                      {isPwaInstalled
                        ? 'La aplicación ya está ejecutándose en modo aplicación nativo.'
                        : canInstallPwa
                        ? 'Su navegador es compatible con la instalación directa de la aplicación.'
                        : 'Disponible para instalación a través de su navegador web.'}
                    </p>
                  </div>

                  {!isPwaInstalled && (
                    <button
                      onClick={onInstallPwa}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition-colors shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar Aplicación Ahora</span>
                    </button>
                  )}
                  {isPwaInstalled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                      <Check className="w-4 h-4" />
                      <span>Instalada</span>
                    </span>
                  )}
                </div>

                {/* Instructions by Device */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-slate-800 text-xs block">
                      En PC (Chrome / Edge / Brave):
                    </strong>
                    <p className="text-slate-600 text-[11px]">
                      Haga clic en el botón superior "Instalar Aplicación Ahora" o en el ícono de pantalla con flecha en la barra de direcciones del navegador.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-slate-800 text-xs block">
                      En iPhone / iPad (Safari):
                    </strong>
                    <p className="text-slate-600 text-[11px]">
                      Abra la app en Safari, toque el botón de <strong>Compartir</strong> (cuadrado con flecha hacia arriba) y elija <strong>"Agregar al inicio"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SERVER */}
          {activePlatform === 'server' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4 text-teal-600" />
                  Despliegue en Servidor Linux (Ubuntu / Debian / AWS / DigitalOcean)
                </h3>
                <p className="text-slate-600 text-xs">
                  Configuración para producción 24/7 con soporte para múltiples usuarios concurrentes.
                </p>
              </div>

              {/* Script Download */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Script de Inicio para Servidores Linux</div>
                  <p className="text-slate-500 text-[11px]">
                    Automatiza la comprobación, compilación y lanzamiento en servidores headless.
                  </p>
                </div>
                <button
                  onClick={() => downloadFile('iniciar-servidor.sh', serverShContent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar iniciar-servidor.sh</span>
                </button>
              </div>

              {/* PM2 execution instructions */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="font-bold text-slate-800">
                  Ejecución Continua con PM2 (Proceso en Segundo Plano)
                </div>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# 1. Instalar PM2 globalmente
sudo npm install -g pm2

# 2. Compilar la aplicación
npm run build

# 3. Iniciar el servicio con PM2
pm2 start server.ts --name "medred-asis" --interpreter tsx

# 4. Configurar arranque automático al reiniciar el servidor
pm2 startup
pm2 save`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('sudo npm install -g pm2 && npm run build && pm2 start server.ts --name "medred-asis" --interpreter tsx', 'pm2-code')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                  >
                    {copiedCode === 'pm2-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'pm2-code' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCKER */}
          {activePlatform === 'docker' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Box className="w-4 h-4 text-teal-600" />
                  Despliegue Contenedorizado con Docker & Docker Compose
                </h3>
                <p className="text-slate-600 text-xs">
                  Ejecute la aplicación en cualquier infraestructura con Docker en un solo paso aislado.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Archivo docker-compose.yml</div>
                  <p className="text-slate-500 text-[11px]">
                    Levanta el servicio completo en el puerto 3000 con reinicio automático.
                  </p>
                </div>
                <button
                  onClick={() => downloadFile('docker-compose.yml', dockerComposeContent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar docker-compose.yml</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="font-bold text-slate-800">Comando de Lanzamiento Docker</div>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Levantar contenedor en segundo plano
docker compose up -d --build

# Ver estado
docker compose ps

# Ver logs en vivo
docker compose logs -f`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('docker compose up -d --build', 'docker-cmd')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                  >
                    {copiedCode === 'docker-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'docker-cmd' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Puerto configurado por defecto: 3000</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
