import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Persistent SEO & AdSense Config file path
const CONFIG_FILE = path.join(__dirname, 'seo-ads-config.json');

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading seo-ads-config.json:', e);
  }
  return {
    googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
    adsenseClient: process.env.GOOGLE_ADSENSE_CLIENT || '',
    adsenseSlots: {
      top: process.env.GOOGLE_ADSENSE_SLOT_TOP || '',
      middle: process.env.GOOGLE_ADSENSE_SLOT_MIDDLE || '',
      sidebar: process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR || '',
      bottom: process.env.GOOGLE_ADSENSE_SLOT_BOTTOM || ''
    },
    autoAds: true,
    siteDomain: process.env.SITE_DOMAIN || 'https://www.info-umkm.my.id'
  };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving seo-ads-config.json:', e);
    return false;
  }
}

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'INFO UMKM' });
});

// API endpoint for SEO & AdSense Settings
app.get('/api/seo-ads-config', (req, res) => {
  res.json(readConfig());
});

app.post('/api/seo-ads-config', (req, res) => {
  const current = readConfig();
  const updated = {
    ...current,
    ...req.body,
    adsenseSlots: {
      ...current.adsenseSlots,
      ...(req.body.adsenseSlots || {})
    }
  };
  const ok = saveConfig(updated);
  if (ok) {
    // Also sync ads.txt if adsenseClient changed
    if (updated.adsenseClient) {
      syncAdsTxt(updated.adsenseClient);
    }
    res.json({ success: true, config: updated });
  } else {
    res.status(500).json({ success: false, error: 'Gagal menyimpan konfigurasi' });
  }
});

function syncAdsTxt(client) {
  try {
    const pubId = client.replace(/^ca-/, '').trim();
    if (pubId && pubId.startsWith('pub-')) {
      const adsTxtContent = `# Google AdSense ads.txt — INFO UMKM\ngoogle.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
      fs.writeFileSync(path.join(__dirname, 'ads.txt'), adsTxtContent, 'utf8');
    }
  } catch (e) {
    console.error('Error syncing ads.txt:', e);
  }
}

// 1. Google AdSense: ads.txt handler
app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const cfg = readConfig();
  const pub = cfg.adsenseClient ? cfg.adsenseClient.replace(/^ca-/, '').trim() : 'pub-0000000000000000';
  res.send(`# Google AdSense ads.txt — INFO UMKM\ngoogle.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
});

// 2. Google Search Console & Search Engines: robots.txt
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const robotsPath = path.join(__dirname, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /superadmin/\nDisallow: /api/\nSitemap: https://www.info-umkm.my.id/sitemap.xml\n`);
  }
});

// 3. Google Search Console: sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  res.sendFile(sitemapPath);
});

// 4. Google Search Console: Dynamic Verification file handler (e.g. /google1234567890abcdef.html)
app.get('/google:code.html', (req, res) => {
  const code = req.params.code;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: google${code}.html`);
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

// Fallback to index.html for navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`INFO UMKM server running on http://${HOST}:${PORT}`);
});
