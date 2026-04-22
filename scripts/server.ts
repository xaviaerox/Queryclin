import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Note: cors is not in package.json dependencies but express is. 
// I will use express's built-in features and check if cors is needed later.
// Actually, since I am creating this to 'Init' the project in Node,
// I'll stick to what's available and common.

app.use(express.json());

// Serve static files from the 'dist' directory after building
app.use(express.static(path.join(__dirname, 'dist')));

// API Endpoints as specified in METAPROMPT.md
app.get('/api/patients', (req, res) => {
  res.json({ message: "Endpoint para listar pacientes (Local-First: los datos residen en el cliente)" });
});

app.get('/api/patient/:id', (req, res) => {
  res.json({ message: `Endpoint para obtener al paciente ${req.params.id}` });
});

app.post('/api/import', (req, res) => {
  res.json({ message: "Endpoint para importación masiva de CSV" });
});

app.get('/api/search', (req, res) => {
  const query = req.query.q;
  res.json({ message: `Endpoint de búsqueda para: ${query}` });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor Queryclin iniciado en modo Node.js`);
  console.log(`🏠 Local: http://localhost:${PORT}`);
  console.log(`🔒 Modo Local-First activo\n`);
});
