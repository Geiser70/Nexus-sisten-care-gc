# Nexus Asisten Care G.C - Guía Completa de Despliegue en PC y Servidor

Sistema Integral de Historias Clínicas Electrónicas, Trazabilidad Intercentros, Verificación Farmacológica, Análisis ASIS y Vigilancia Epidemiológica con Respaldo de Base de Datos y Modo Aplicación (PWA).

---

## 1. Ejecutar en una PC Local (Windows / Mac / Linux)

### Opción Rápida en Windows (1 Solo Clic):
1. Asegúrese de tener instalado [Node.js (versión 18 o superior)](https://nodejs.org/).
2. Haga doble clic en el archivo **`iniciar-windows.bat`**.
3. El script instalará las dependencias necesarias, compilará el sistema y abrirá automáticamente su navegador en `http://localhost:3000`.

### Opción Manual por Terminal / Consola:
```bash
# 1. Instalar las dependencias
npm install

# 2. Compilar la aplicación para producción
npm run build

# 3. Iniciar el servidor local
npm start
```
Abra su navegador en: **`http://localhost:3000`**

---

## 2. Instalar como Aplicación Nativa de Escritorio o Móvil (PWA)

El software cuenta con soporte nativo de **Progressive Web App (PWA)**:
1. Abra el sistema en Google Chrome, Microsoft Edge, Safari o navegador móvil.
2. Haga clic en el botón superior **"Instalar App"** en la barra de navegación (o en el ícono de instalación en la barra de direcciones de Chrome/Edge).
3. La aplicación se instalará en su computadora como un programa de escritorio independiente con su propio ícono en el menú inicio y escritorio, funcionando a pantalla completa y sin barra de navegación del navegador.
4. En dispositivos móviles Android / iOS:
   - **Android**: Toque "Instalar App" en el aviso en pantalla.
   - **iOS (iPhone/iPad)**: Toque el botón "Compartir" de Safari y seleccione **"Agregar a pantalla de inicio"**.

---

## 3. Despliegue en un Servidor (Ubuntu / Debian / Linux)

### Mediante el Script Automatizado:
```bash
chmod +x iniciar-servidor.sh
./iniciar-servidor.sh
```

### Ejecución Continua con PM2 (24/7 en segundo plano):
Para mantener el servidor activo permanentemente incluso si reinicia el equipo:
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar la aplicación
npm run build

# Iniciar con PM2
pm2 start server.ts --name "medred-asis" --interpreter tsx

# Guardar configuración para inicio automático al reiniciar el servidor
pm2 save
pm2 startup
```

---

## 4. Despliegue con Docker y Docker Compose

Si cuenta con Docker instalado en su servidor:
```bash
# Construir y levantar el contenedor en segundo plano
docker compose up -d --build

# Verificar estado
docker compose ps

# Ver registros de ejecución en tiempo real
docker compose logs -f
```
El sistema quedará disponible en: **`http://IP_DE_SU_SERVIDOR:3000`**

---

## 5. Respaldo y Restauración de la Base de Datos

El sistema incluye una pestaña dedicada: **"Respaldo de Base de Datos"**:
1. **Descargar Copia de Seguridad (.json)**: Genera un archivo con checksum y fecha conteniendo todas las historias clínicas, centros de salud, antecedentes, atenciones y medicación.
2. **Restaurar Base de Datos (.json)**: Permite subir cualquier archivo de respaldo previo con comprobación de integridad y restauración en 1 clic.
3. **Exportar a Excel (.xlsx)**: Genera un libro de Excel con hojas separadas de toda la base de datos relacional.
4. **Puntos de Restauración Locales**: Permite guardar instantáneas antes de realizar campañas o modificaciones masivas.
