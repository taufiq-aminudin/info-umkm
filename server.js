import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'INFO UMKM' });
});

// Serve static assets with html extension handling and index defaults
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Route aliases
app.get('/umkm', (req, res) => {
  res.sendFile(path.join(__dirname, 'umkm', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`INFO UMKM server running on http://${HOST}:${PORT}`);
});
