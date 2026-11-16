import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { listarProductos, guardarProducto } from '../public/productos.js';
import { app } from '../server.js';

let almacen;
beforeEach(() => {
  almacen = new Map();
  globalThis.localStorage = {
    getItem: key => almacen.get(key) ?? null,
    setItem: (key, value) => almacen.set(key, value)
  };
});
const datos = { nombre: 'Tornillos', sku: 'ABC-01', cantidad: 2, minimo: 5 };

test('alta, persistencia y edición conservan identidad y actualizan existencias bajas', async () => {
  assert.deepEqual(await listarProductos(), []);
  const creado = await guardarProducto(datos);
  assert.deepEqual(await listarProductos(), [creado]);
  assert.equal(creado.cantidad < creado.minimo, true);
  const editado = await guardarProducto({ ...datos, cantidad: 5 }, creado.id);
  assert.equal(editado.id, creado.id);
  assert.equal(editado.created_at, creado.created_at);
  assert.equal(editado.cantidad < editado.minimo, false);
  assert.deepEqual(await listarProductos(), [editado]);
});

test('rechaza duplicados normalizados y ediciones inválidas sin modificar datos', async () => {
  const primero = await guardarProducto(datos);
  const segundo = await guardarProducto({ ...datos, sku: 'XYZ' });
  await assert.rejects(guardarProducto({ ...datos, sku: ' abc-01 ' }), /SKU/);
  await assert.rejects(guardarProducto({ ...datos, sku: 'abc-01' }, segundo.id), /SKU/);
  for (const cambios of [{ nombre: ' ' }, { sku: '' }, { cantidad: -1 }, { minimo: 1.5 }, { cantidad: '' }, { minimo: null }, { cantidad: 'Infinity' }]) {
    await assert.rejects(guardarProducto({ ...datos, ...cambios }, primero.id));
  }
  assert.deepEqual(await listarProductos(), [primero, segundo]);
});

test('informa fallos de lectura y escritura sin sobrescribir datos', async () => {
  await guardarProducto(datos);
  const original = await listarProductos();
  localStorage.setItem = () => { throw new Error('quota'); };
  await assert.rejects(guardarProducto({ ...datos, sku: 'NUEVO' }), /No se pudo guardar/);
  assert.deepEqual(await listarProductos(), original);
  localStorage.getItem = () => '{invalid';
  await assert.rejects(listarProductos(), /No se pudo leer/);
});

test('servidor expone interfaz y health, y protege archivos del proyecto', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
  const pagina = await fetch(base);
  assert.equal(pagina.status, 200);
  assert.match(await pagina.text(), /Mini Inventario/);
  for (const path of ['/app.js', '/productos.js', '/styles.css']) assert.equal((await fetch(base + path)).status, 200);
  for (const path of ['/README.md', '/package.json', '/.env', '/inexistente']) assert.equal((await fetch(base + path)).status, 404);
});
