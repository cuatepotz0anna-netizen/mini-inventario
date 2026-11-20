import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { crearRepositorioProductos } from '../public/productos.js';
import { app } from '../server.js';

const datos = { nombre: 'Tornillos', sku: 'ABC-01', cantidad: 2, minimo: 5 };

function clienteDePrueba(fetch) {
  return createClient('https://example.test', 'sb_publishable_test', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });
}

test('consulta, crea, edita y elimina productos mediante PostgREST', async () => {
  const producto = { ...datos, id: 'p1', user_id: 'u1', created_at: '2026-11-19T00:00:00Z' };
  const editado = { ...producto, cantidad: 5 };
  const respuestas = [[producto], [producto], [editado], [{ id: 'p1' }]];
  const solicitudes = [];
  const cliente = clienteDePrueba(async (url, opciones) => {
    solicitudes.push({ url: new URL(url), ...opciones });
    return Response.json(respuestas.shift());
  });
  const repo = crearRepositorioProductos(cliente);

  assert.deepEqual(await repo.listarProductos(), [producto]);
  assert.deepEqual(await repo.guardarProducto(datos, null, 'u1'), producto);
  assert.deepEqual(await repo.guardarProducto({ ...datos, cantidad: 5 }, 'p1', 'u1'), editado);
  await repo.eliminarProducto('p1');

  assert.deepEqual(solicitudes.map(s => s.method), ['GET', 'POST', 'PATCH', 'DELETE']);
  assert.ok(solicitudes.every(s => s.url.pathname === '/rest/v1/productos'));
  assert.deepEqual(JSON.parse(solicitudes[1].body), { ...datos, user_id: 'u1' });
  assert.deepEqual(JSON.parse(solicitudes[2].body), { ...datos, cantidad: 5 });
  for (const solicitud of solicitudes.slice(2)) assert.equal(solicitud.url.searchParams.get('id'), 'eq.p1');
});

test('valida datos y presenta errores de SKU duplicado, lectura y filas ausentes', async () => {
  const respuestas = [
    () => Response.json({ code: '23505', message: 'duplicate' }, { status: 409 }),
    () => Response.json({ message: 'sin acceso' }, { status: 403 }),
    () => Response.json([])
  ];
  const cliente = clienteDePrueba(async () => respuestas.shift()());
  const repo = crearRepositorioProductos(cliente);

  for (const cambios of [{ nombre: ' ' }, { sku: '' }, { cantidad: -1 }, { minimo: 1.5 }, { cantidad: '' },
    { minimo: null }, { cantidad: 'Infinity' }, { minimo: 2147483648 }]) {
    await assert.rejects(repo.guardarProducto({ ...datos, ...cambios }, 'p1', 'u1'));
  }
  assert.equal(respuestas.length, 3);
  await assert.rejects(repo.guardarProducto(datos, null, 'u1'), /Ya existe.*SKU/);
  await assert.rejects(repo.listarProductos(), /No se pudo leer/);
  await assert.rejects(repo.eliminarProducto('p1'), /ya no está disponible/);
});

test('servidor expone la interfaz y solo entrega configuración pública', async t => {
  for (const nombre of ['SUPABASE_URL', 'SUPABASE_KEY']) {
    const anterior = process.env[nombre];
    t.after(() => {
      if (anterior === undefined) delete process.env[nombre];
      else process.env[nombre] = anterior;
    });
  }
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
  assert.match(await (await fetch(base)).text(), /Mini Inventario/);
  for (const path of ['/app.js', '/productos.js', '/styles.css', '/supabase.js']) {
    assert.equal((await fetch(base + path)).status, 200);
  }
  for (const path of ['/README.md', '/package.json', '/.env', '/.env.example', '/inexistente']) {
    assert.equal((await fetch(base + path)).status, 404);
  }

  const jwt = role => 'header.' + Buffer.from(JSON.stringify({ role })).toString('base64url') + '.signature';
  process.env.SUPABASE_URL = 'https://example.test';
  for (const llave of ['sb_publishable_test', jwt('anon')]) {
    process.env.SUPABASE_KEY = llave;
    const respuesta = await fetch(base + '/config.js');
    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get('content-type'), /javascript/);
    assert.equal(respuesta.headers.get('cache-control'), 'no-store');
    assert.equal(await respuesta.text(), `export const config = ${JSON.stringify({ url: 'https://example.test', key: llave })};\n`);
  }
  for (const llave of ['sb_secret_test', jwt('service_role'), 'desconocida']) {
    process.env.SUPABASE_KEY = llave;
    const respuesta = await fetch(base + '/config.js');
    assert.equal(respuesta.status, 503);
    assert.ok(!(await respuesta.text()).includes(llave));
  }
  delete process.env.SUPABASE_KEY;
  assert.equal((await fetch(base + '/config.js')).status, 503);
});
