import express from 'express';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

export const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/config.js', (_req, res) => {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_KEY?.trim();
  const parsedUrl = URL.parse(url ?? '');
  if (parsedUrl?.protocol !== 'https:' || parsedUrl.username || parsedUrl.password ||
      parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash || !esLlavePublica(key)) {
    return res.status(503).type('text').send('Configura una URL HTTPS y una llave pública de Supabase.');
  }
  res.set('Cache-Control', 'no-store').type('application/javascript')
    .send(`export const config = ${JSON.stringify({ url: parsedUrl.origin, key })};\n`);
});
app.get('/supabase.js', (_req, res) => {
  res.sendFile(fileURLToPath(new URL('./node_modules/@supabase/supabase-js/dist/umd/supabase.js', import.meta.url)));
});
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.use((_req, res) => res.status(404).send('Página no encontrada'));

function esLlavePublica(key) {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key ?? '')) return true;
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(key ?? '')) return false;
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
    return payload?.role === 'anon';
  } catch {
    return false;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Mini Inventario disponible en http://localhost:${port}`));
}
