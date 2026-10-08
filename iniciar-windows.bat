@echo off
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
    echo Por favor descargue e instale Node.js desde: https://nodejs.org/
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

pause
