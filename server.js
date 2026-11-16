import express from 'express';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.use((_req, res) => res.status(404).send('Página no encontrada'));

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Mini Inventario disponible en http://localhost:${port}`));
}
