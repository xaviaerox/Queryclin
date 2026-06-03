import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
/// <reference types="vitest" />

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Queryclin/',
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'save-custom-form-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const urlPath = req.url ? req.url.split('?')[0] : '';
            const isSave = urlPath.endsWith('/api/save-custom-form');
            const isDelete = urlPath.endsWith('/api/delete-custom-form');

            if (isSave && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (data && data.form && data.form.id) {
                    const dirPath = path.resolve(__dirname, 'src', 'custom-forms');
                    if (!fs.existsSync(dirPath)) {
                      fs.mkdirSync(dirPath, { recursive: true });
                    }
                    const filePath = path.join(dirPath, `form-${data.form.id}.json`);
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, path: filePath }));
                    return;
                  }
                  res.statusCode = 400;
                  res.end('Invalid request data: form and form.id are required');
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else if (isDelete && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (data && data.id) {
                    const filePath = path.resolve(__dirname, 'src', 'custom-forms', `form-${data.id}.json`);
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ success: true, message: `Deleted ${data.id}` }));
                      return;
                    }
                    res.statusCode = 404;
                    res.end('File not found');
                    return;
                  }
                  res.statusCode = 400;
                  res.end('Invalid request data: id is required');
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__BUILD_DATE__': JSON.stringify(new Date().toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
