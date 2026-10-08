import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
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

// Serve static assets from Vite dist folder in production
const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  console.log(`[Nexus Care Server] Sirviendo archivos compilados desde: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist is not yet built, provide dev info
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nexus Asisten Care G.C Server</title>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: white; padding: 40px; text-align: center; }
            .box { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
            h1 { color: #2dd4bf; margin-top: 0; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #5eead4; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Nexus Asisten Care G.C - Servidor Operativo</h1>
            <p>El servidor Express está activo en el puerto ${PORT}.</p>
            <p>Para compilar y servir la aplicación completa de producción, ejecute:</p>
            <p><code>npm run build && npm start</code></p>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`  Nexus Asisten Care G.C - Servidor en Ejecución`);
  console.log(`  Acceso Local:    http://localhost:${PORT}`);
  console.log(`  Acceso de Red:   http://0.0.0.0:${PORT}`);
  console.log(`  Puerto Activo:   ${PORT}`);
  console.log(`  Entorno:         ${process.env.NODE_ENV || 'production'}`);
  console.log(`======================================================`);
});
